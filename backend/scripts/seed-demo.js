#!/usr/bin/env node
/**
 * Jeu de données de démonstration — création et suppression.
 *
 * Crée des professionnels crédibles répartis sur plusieurs communes du Bénin,
 * avec quelques comptes Pro et un boost actif, afin que l'annuaire, la recherche
 * et le classement aient de la matière à montrer.
 *
 * Chaque profil porte `is_demo = true` (migration 20260827) : c'est ce marqueur,
 * et non une convention de nommage, qui permet de tout retirer d'un seul geste.
 *
 * Usage :
 *   node scripts/seed-demo.js            # crée le jeu de démonstration
 *   node scripts/seed-demo.js --purge    # supprime TOUT ce qui est marqué démo
 *   node scripts/seed-demo.js --count    # compte les profils de démonstration
 *
 * Variables (.env) : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquants dans .env');
  process.exit(2);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

// Domaine réservé : aucune adresse réelle ne peut entrer en collision.
const DEMO_DOMAIN = 'demo.emiid.invalid';

const PROFILES = [
  { first: 'Koffi',    last: 'ADJOVI',     role: 'Électricien bâtiment', specialty: 'Installation et dépannage électrique', city: 'Cotonou',        cat: 'Artisan', tags: ['électricité', 'dépannage', 'bâtiment'],        bio: "Quinze ans d'installations résidentielles et de mises aux normes à Cotonou.", pro: true,  verified: true },
  { first: 'Aïcha',    last: 'SEIDOU',     role: 'Couturière',           specialty: 'Prêt-à-porter et tenues de cérémonie',  city: 'Cotonou',        cat: 'Artisan', tags: ['couture', 'mode', 'sur-mesure'],               bio: 'Atelier à Akpakpa, spécialisée dans les tenues de cérémonie en tissu wax.', pro: true,  verified: true },
  { first: 'Rachid',   last: 'BIO',        role: 'Mécanicien auto',      specialty: 'Diagnostic et réparation toutes marques', city: 'Parakou',      cat: 'Artisan', tags: ['mécanique', 'automobile', 'diagnostic'],       bio: 'Garage indépendant à Parakou, diagnostic électronique et entretien courant.', pro: false, verified: true },
  { first: 'Bernadette', last: 'HOUNKPE',  role: 'Traiteur',             specialty: 'Cuisine béninoise pour événements',     city: 'Porto-Novo',     cat: 'Artisan', tags: ['traiteur', 'événementiel', 'cuisine'],         bio: 'Mariages et réceptions à Porto-Novo, cuisine béninoise et internationale.', pro: false, verified: false },
  { first: 'Serge',    last: 'DOSSOU',     role: 'Développeur web',      specialty: 'Applications web et mobiles',           city: 'Cotonou',        cat: 'Freelance', tags: ['développement', 'web', 'mobile'],            bio: 'Développeur indépendant, applications de gestion pour PME béninoises.', pro: true,  verified: false },
  { first: 'Fatou',    last: 'ZINSOU',     role: 'Coiffeuse',            specialty: 'Coiffure afro et soins capillaires',    city: 'Abomey-Calavi',  cat: 'Artisan', tags: ['coiffure', 'beauté', 'soins'],                 bio: 'Salon à Abomey-Calavi, tresses, tissages et soins naturels.', pro: false, verified: true },
  { first: 'Ibrahim',  last: 'TRAORE',     role: 'Menuisier',            specialty: 'Mobilier sur mesure et agencement',     city: 'Bohicon',        cat: 'Artisan', tags: ['menuiserie', 'bois', 'mobilier'],              bio: 'Atelier de menuiserie à Bohicon, mobilier sur mesure en bois local.', pro: false, verified: false },
  { first: 'Chantal',  last: 'AGBODJAN',   role: 'Comptable',            specialty: 'Comptabilité et fiscalité des PME',     city: 'Cotonou',        cat: 'Entrepreneur', tags: ['comptabilité', 'fiscalité', 'conseil'],    bio: 'Accompagnement comptable et fiscal des petites entreprises.', pro: true,  verified: true },
  { first: 'Moussa',   last: 'GBAGUIDI',   role: 'Plombier',             specialty: 'Sanitaire et réseaux d’eau',       city: 'Cotonou',        cat: 'Artisan', tags: ['plomberie', 'sanitaire', 'dépannage'],         bio: 'Dépannage rapide et installations sanitaires sur tout Cotonou.', pro: false, verified: false },
  { first: 'Léonie',   last: 'KPOTON',     role: 'Graphiste',            specialty: 'Identité visuelle et supports imprimés', city: 'Porto-Novo',    cat: 'Freelance', tags: ['design', 'graphisme', 'identité visuelle'],  bio: 'Logos, chartes et supports de communication pour commerces locaux.', pro: false, verified: true },
  { first: 'Anicet',   last: 'AHOUANDJINOU', role: 'Soudeur métallique', specialty: 'Portails, grilles et charpente légère', city: 'Abomey-Calavi', cat: 'Artisan', tags: ['soudure', 'métallerie', 'portail'],           bio: 'Fabrication de portails et grilles de sécurité sur mesure.', pro: false, verified: false },
  { first: 'Sandrine', last: 'LOKO',       role: 'Photographe',          specialty: 'Portrait, mariage et corporate',        city: 'Cotonou',        cat: 'Freelance', tags: ['photographie', 'mariage', 'portrait'],       bio: 'Reportages de mariage et photographie corporate au Bénin.', pro: false, verified: true },
  { first: 'Yacoubou', last: 'ISSA',       role: 'Vulcanisateur',        specialty: 'Pneumatique et équilibrage',            city: 'Parakou',        cat: 'Artisan', tags: ['pneu', 'vulcanisation', 'automobile'],         bio: 'Réparation et vente de pneus, équilibrage, service rapide.', pro: false, verified: false },
  { first: 'Prosper',  last: 'AGOSSOU',    role: 'Maçon',                specialty: 'Gros œuvre et finitions',               city: 'Ouidah',         cat: 'Artisan', tags: ['maçonnerie', 'construction', 'bâtiment'],      bio: 'Construction et rénovation, du gros œuvre aux finitions.', pro: false, verified: false },
  { first: 'Micheline', last: 'TOSSOU',    role: 'Pâtissière',           specialty: 'Gâteaux de cérémonie et viennoiserie',  city: 'Cotonou',        cat: 'Artisan', tags: ['pâtisserie', 'gâteau', 'événementiel'],        bio: 'Gâteaux de mariage et pièces montées, livraison sur Cotonou.', pro: false, verified: true },
];

const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function count() {
  const { count: n, error } = await supabase
    .from('user_profiles').select('id', { count: 'exact', head: true }).eq('is_demo', true);
  if (error) { console.error('❌', error.message); process.exit(2); }
  console.log(`${n ?? 0} profil(s) de démonstration en base.`);
}

async function purge() {
  const { data: rows, error } = await supabase
    .from('user_profiles').select('user_id').eq('is_demo', true);
  if (error) { console.error('❌ Lecture échouée :', error.message); process.exit(2); }
  if (!rows?.length) { console.log('Aucun profil de démonstration à supprimer.'); return; }

  console.log(`▶ Suppression de ${rows.length} compte(s) de démonstration…`);
  let removed = 0;
  for (const r of rows) {
    // La suppression du compte auth entraîne en cascade profil, tags, vues,
    // messages, abonnements et boosts : rien ne subsiste.
    const { error: delErr } = await supabase.auth.admin.deleteUser(r.user_id);
    if (delErr) console.error(`  ⚠️  ${r.user_id} : ${delErr.message}`);
    else { removed += 1; process.stdout.write(`  ✅ ${r.user_id}\n`); }
  }
  console.log(`\n✔ ${removed}/${rows.length} compte(s) supprimé(s).`);
}

async function seed() {
  // Bénin : rattachement au pays et aux communes du référentiel.
  const { data: benin } = await supabase
    .from('countries').select('id').eq('iso_code', 'BJ').maybeSingle();
  const { data: communes } = await supabase.from('communes').select('id, name');
  const communeByName = new Map((communes || []).map((c) => [c.name.toLowerCase(), c.id]));

  if (!communes?.length) {
    console.warn('⚠️  Référentiel des communes vide : jouer 20260824_boosts_phase2.sql d\'abord.');
  }

  console.log(`▶ Création de ${PROFILES.length} profils de démonstration…`);
  const created = [];

  for (const p of PROFILES) {
    const slug = slugify(`${p.first}-${p.last}`);
    const email = `${slug}@${DEMO_DOMAIN}`;

    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: `Demo!${Math.random().toString(36).slice(2, 12)}`,
      user_metadata: { first_name: p.first, last_name: p.last, is_demo: true },
    });

    if (authErr) {
      if (/already/i.test(authErr.message)) { console.log(`  → ${email} existe déjà, ignoré`); continue; }
      console.error(`  ⚠️  ${email} : ${authErr.message}`);
      continue;
    }

    const { data: profile, error: profErr } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authUser.user.id,
        first_name: p.first,
        last_name: p.last,
        email,
        role: p.role,
        specialty: p.specialty,
        category: p.cat,
        city: p.city,
        bio: p.bio,
        slug,
        country_id: benin?.id ?? null,
        commune_id: communeByName.get(p.city.toLowerCase()) ?? null,
        is_published: true,
        is_verified: p.verified,
        is_premium: p.pro,
        has_profile: true,
        is_demo: true,
      })
      .select('id, user_id')
      .single();

    if (profErr) { console.error(`  ⚠️  profil ${slug} : ${profErr.message}`); continue; }

    // Compétences : réutilise les tags existants, crée les manquants.
    for (const name of p.tags) {
      let { data: tag } = await supabase.from('tags').select('id').ilike('name', name).maybeSingle();
      if (!tag) {
        const { data: newTag } = await supabase.from('tags').insert({ name }).select('id').single();
        tag = newTag;
      }
      if (tag) await supabase.from('profile_tags').insert({ profile_id: profile.id, tag_id: tag.id });
    }

    // Abonnement Pro : le trigger sync_is_premium tient is_premium à jour.
    if (p.pro) {
      await supabase.from('subscriptions').upsert({
        user_id: authUser.user.id,
        tier: 'PRO_MONTHLY',
        status: 'ACTIVE',
        end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
      }, { onConflict: 'user_id' });
    }

    created.push({ ...p, userId: authUser.user.id, profileId: profile.id });
    process.stdout.write(`  ✅ ${p.first} ${p.last} — ${p.role} (${p.city})\n`);
  }

  // Un boost communal actif, pour que le classement ait quelque chose à montrer.
  const boosted = created.find((c) => c.city === 'Cotonou' && c.pro);
  const cotonouId = communeByName.get('cotonou');
  if (boosted && cotonouId) {
    const { error: boostErr } = await supabase.from('profile_boosts').insert({
      profile_id: boosted.userId,
      scope: 'COMMUNE',
      commune_id: cotonouId,
      status: 'ACTIVE',
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      price_paid: 1200,
    });
    if (!boostErr) console.log(`\n  ⭐ Boost communal actif : ${boosted.first} ${boosted.last} à Cotonou`);
  }

  console.log(`\n✔ ${created.length} profil(s) créé(s). Suppression : node scripts/seed-demo.js --purge`);
}

const arg = process.argv[2];
(async () => {
  if (arg === '--purge') await purge();
  else if (arg === '--count') await count();
  else await seed();
  process.exit(0);
})();
