#!/usr/bin/env node
/**
 * Génère les embeddings sémantiques des profils publiés (Couche ② de la
 * recherche annuaire) et les stocke dans user_profiles.embedding.
 *
 * Modèle : Gemini text-embedding-004 (768 dimensions, gratuit).
 * Doit être joué APRÈS la migration sql/migrations/20260821_semantic_search.sql.
 *
 * Usage :
 *   cd /app/backend && node scripts/embed-profiles.js            # profils périmés
 *   cd /app/backend && node scripts/embed-profiles.js --all      # tout re-embarquer
 *
 * Variables d'environnement (.env) :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (accès service — écrit l'embedding)
 *   GEMINI_API_KEY                            (clé Google AI Studio)
 *   GEMINI_EMBED_MODEL   (optionnel, défaut text-embedding-004)
 *
 * À relancer périodiquement (cron) ou après un import massif de profils.
 * Le trigger trg_mark_embedding_stale remet embedding_stale=true dès qu'un
 * champ texte change → ce script ne ré-embarque que le nécessaire.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_EMBED_MODEL || 'text-embedding-004';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquants dans .env');
  process.exit(2);
}
if (!GEMINI_KEY) {
  console.error('❌ GEMINI_API_KEY manquant dans .env (clé Google AI Studio).');
  process.exit(2);
}

const ALL = process.argv.includes('--all');
const BATCH = 25; // profils lus par page
const SLEEP_MS = 250; // pause entre appels Gemini (ménage le quota gratuit)

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Champs texte embarqués — identiques au search_vector (Couche ①).
const TEXT_FIELDS = [
  'first_name', 'last_name', 'business_name', 'role', 'specialty',
  'job_title', 'category', 'activity_domain', 'city', 'district',
  'slogan', 'bio',
];

/** Construit le texte représentatif d'un profil. */
function profileText(p) {
  return TEXT_FIELDS.map((f) => (p[f] || '').toString().trim())
    .filter(Boolean)
    .join(' — ');
}

/** Embarque un document (profil) via Gemini. taskType=RETRIEVAL_DOCUMENT. */
async function embedDocument(text) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${MODEL}`,
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT',
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini ${res.status} : ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const values = json && json.embedding && json.embedding.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Réponse Gemini sans embedding.');
  }
  return values;
}

(async () => {
  console.log(`▶ Embedding des profils (${ALL ? 'tous' : 'périmés uniquement'}) — modèle ${MODEL}`);

  let processed = 0;
  let failed = 0;
  let offset = 0; // uniquement pour le mode --all (pagination stable)
  let stalled = 0; // lots consécutifs sans aucun succès (anti-boucle)

  // On boucle tant qu'il reste des profils à traiter. En mode « périmés »,
  // on écrit embedding_stale=false au fur et à mesure → la même requête finit
  // par se vider. En mode --all, on pagine explicitement via offset.
  for (;;) {
    let q = supabase
      .from('user_profiles')
      .select(`id, ${TEXT_FIELDS.join(', ')}, is_published, embedding_stale`)
      .eq('is_published', true);
    if (!ALL) q = q.eq('embedding_stale', true).limit(BATCH);
    else q = q.order('id', { ascending: true }).range(offset, offset + BATCH - 1);

    const { data: rows, error } = await q;
    if (error) {
      console.error('❌ Lecture profils :', error.message);
      process.exit(2);
    }
    if (!rows || rows.length === 0) break;
    offset += rows.length;

    let okThisBatch = 0;
    for (const p of rows) {
      const text = profileText(p);
      if (!text) {
        // Rien à embarquer → on marque non-périmé pour ne pas boucler.
        await supabase.from('user_profiles')
          .update({ embedding_stale: false }).eq('id', p.id);
        okThisBatch += 1;
        continue;
      }
      try {
        const vec = await embedDocument(text);
        const { error: upErr } = await supabase
          .from('user_profiles')
          .update({ embedding: vec, embedding_stale: false })
          .eq('id', p.id);
        if (upErr) throw new Error(upErr.message);
        processed += 1;
        okThisBatch += 1;
        process.stdout.write(`  ✅ ${p.id}\n`);
      } catch (e) {
        failed += 1;
        console.error(`  ⚠️  ${p.id} : ${e.message}`);
      }
      await sleep(SLEEP_MS);
    }

    // Anti-boucle (mode « périmés ») : en cas de lot entièrement en échec,
    // les profils restent stale et seraient relus indéfiniment. On arrête
    // après 2 lots consécutifs sans le moindre succès (probable panne clé/quota).
    if (!ALL) {
      stalled = okThisBatch === 0 ? stalled + 1 : 0;
      if (stalled >= 2) {
        console.error('⛔ Arrêt : deux lots consécutifs sans succès (clé/quota ?).');
        break;
      }
    }
  }

  console.log(`\n✔ Terminé — ${processed} profil(s) embarqué(s), ${failed} échec(s).`);
  process.exit(failed > 0 ? 3 : 0);
})();
