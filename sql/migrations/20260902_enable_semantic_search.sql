/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Déploiement de la Couche ② de la recherche annuaire : recherche
 *              SÉMANTIQUE (pgvector + embeddings Gemini 768d).
 *
 *   Objectif : comprendre le SENS d'une requête, pas seulement ses mots.
 *   « quelqu'un pour refaire mon électricité » doit ramener un électricien,
 *   alors qu'aucun de ces mots n'apparaît dans sa fiche. C'est précisément ce
 *   que la recherche vocale produit : des phrases, pas des mots-clés.
 *
 *   ── Pourquoi ce fichier plutôt que 20260821_semantic_search.sql ─────────
 *   La migration d'origine n'a jamais pu s'appliquer sur ce projet (constat du
 *   01/09 : « 42704: type vector does not exist »). Elle porte trois défauts
 *   incompatibles avec cet environnement Supabase, corrigés ici :
 *
 *   ① `CREATE EXTENSION vector` sans schéma → l'extension atterrissait dans le
 *      schéma courant. Sur Supabase la convention est le schéma `extensions`
 *      (cf. la note de 20260824_boosts_phase2.sql à propos d'unaccent). On l'y
 *      installe explicitement, et on élargit le search_path du script pour que
 *      le type `vector` soit résolu quel que soit son schéma d'accueil.
 *
 *   ② match_profiles_semantic() était créée en SECURITY INVOKER. Elle lit
 *      user_profiles.embedding, colonne accordée à AUCUN rôle client depuis le
 *      durcissement des 29-30/08 : elle aurait levé 42501 dès le premier appel,
 *      reproduisant exactement la panne « zéro profil » corrigée le 01/09.
 *      Elle est donc SECURITY DEFINER + search_path figé DÈS SA CRÉATION.
 *      C'est sûr : sa sortie se limite à (profile_id, similarity) — aucune PII,
 *      et le vecteur ne quitte jamais la base — et le filtre is_published tient.
 *
 *   ③ Le trigger mark_embedding_stale() n'avait pas de search_path figé
 *      (lint Supabase « Function Search Path Mutable »). Corrigé.
 *
 *   ── Après cette migration ───────────────────────────────────────────────
 *   La colonne embedding est vide : la couche ② reste donc silencieuse et la
 *   recherche continue de fonctionner via la seule couche ① (lexicale). Elle
 *   ne s'active qu'une fois les vecteurs générés :
 *       cd backend && node scripts/embed-profiles.js --all
 *   Ce script exige GEMINI_API_KEY (Google AI Studio) côté backend, et la même
 *   clé côté frontend-user pour embarquer la requête de l'utilisateur.
 *   Sans clé, embedQuery() renvoie null et la recherche reste lexicale : la
 *   dégradation est propre et silencieuse, jamais une page vide.
 *
 *   Le trigger remet embedding_stale à true dès qu'un champ texte du profil
 *   change : rejouer le script sans --all ne ré-embarque que le nécessaire.
 *
 *   Idempotent. À jouer après 20260901_fix_search_rpc_privileges.sql.
 * @created 2026-09-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 0. Résolution du type `vector` ────────────────────────────────────────
--     Le type doit être résolvable pendant TOUT le script (colonne, index,
--     signature de la RPC). On élargit le search_path de la session : la
--     migration reste valable que l'extension vive dans `extensions` (Supabase)
--     ou dans `public` (installation antérieure).
CREATE SCHEMA IF NOT EXISTS extensions;
SET search_path = public, extensions;

-- ─── 1. Extension vectorielle ──────────────────────────────────────────────
--     WITH SCHEMA n'agit qu'à la création : si l'extension existe déjà
--     ailleurs, elle est conservée en place et le search_path ci-dessus suffit.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ─── 2. Colonne d'embedding + indicateur de fraîcheur ──────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS embedding        vector(768),
  ADD COLUMN IF NOT EXISTS embedding_stale  boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.user_profiles.embedding IS
  'Vecteur sémantique (Gemini text-embedding-004, 768 dims). Généré hors-SQL par backend/scripts/embed-profiles.js. Jamais exposé aux rôles clients.';
COMMENT ON COLUMN public.user_profiles.embedding_stale IS
  'true = le profil doit être (ré)embarqué par le script embed-profiles.';

-- ─── 3. Trigger : marquer « à ré-embarquer » quand le texte change ─────────
--     Mêmes champs que ceux composant le search_vector (Couche ①) et le texte
--     embarqué par le script : les trois représentations restent cohérentes.
CREATE OR REPLACE FUNCTION public.mark_embedding_stale()
RETURNS trigger
LANGUAGE plpgsql
-- search_path figé : sans cela, le lint Supabase signale la fonction et son
-- exécution dépendrait du search_path de l'appelant.
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (
       coalesce(NEW.first_name, '')      IS DISTINCT FROM coalesce(OLD.first_name, '')      OR
       coalesce(NEW.last_name, '')       IS DISTINCT FROM coalesce(OLD.last_name, '')       OR
       coalesce(NEW.business_name, '')   IS DISTINCT FROM coalesce(OLD.business_name, '')   OR
       coalesce(NEW.role, '')            IS DISTINCT FROM coalesce(OLD.role, '')            OR
       coalesce(NEW.specialty, '')       IS DISTINCT FROM coalesce(OLD.specialty, '')       OR
       coalesce(NEW.job_title, '')       IS DISTINCT FROM coalesce(OLD.job_title, '')       OR
       coalesce(NEW.category, '')        IS DISTINCT FROM coalesce(OLD.category, '')        OR
       coalesce(NEW.activity_domain, '') IS DISTINCT FROM coalesce(OLD.activity_domain, '') OR
       coalesce(NEW.city, '')            IS DISTINCT FROM coalesce(OLD.city, '')            OR
       coalesce(NEW.district, '')        IS DISTINCT FROM coalesce(OLD.district, '')        OR
       coalesce(NEW.slogan, '')          IS DISTINCT FROM coalesce(OLD.slogan, '')          OR
       coalesce(NEW.bio, '')             IS DISTINCT FROM coalesce(OLD.bio, '')
     ) THEN
    NEW.embedding_stale := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_embedding_stale ON public.user_profiles;
CREATE TRIGGER trg_mark_embedding_stale
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_embedding_stale();

-- ─── 4. Index HNSW (distance cosinus) ──────────────────────────────────────
--     Recherche approchée : indispensable dès quelques milliers de profils.
--     Construit sur une colonne vide, l'index est instantané ; il se remplit
--     au fur et à mesure des écritures du script d'embedding.
CREATE INDEX IF NOT EXISTS idx_user_profiles_embedding_hnsw
  ON public.user_profiles
  USING hnsw (embedding vector_cosine_ops);

-- ─── 5. RPC de recherche sémantique ────────────────────────────────────────
--     Profils publiés uniquement, classés par similarité cosinus
--     (1 = identique, 0 = orthogonal).
CREATE OR REPLACE FUNCTION public.match_profiles_semantic(
  query_embedding vector(768),
  match_count     int   DEFAULT 50,
  min_similarity  float DEFAULT 0.30
)
RETURNS TABLE(profile_id uuid, similarity real)
LANGUAGE sql STABLE
-- SECURITY DEFINER dès l'origine : la colonne embedding n'est accordée à aucun
-- rôle client, et ne doit pas l'être. Cf. 20260901_fix_search_rpc_privileges.sql.
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
  SELECT p.id AS profile_id,
         (1 - (p.embedding <=> query_embedding))::real AS similarity
  FROM public.user_profiles p
  WHERE p.is_published = true
    AND p.embedding IS NOT NULL
    AND (1 - (p.embedding <=> query_embedding)) > min_similarity
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_profiles_semantic(vector, int, float)
  TO anon, authenticated;

-- ─── 6. Défense en profondeur : embedding hors de portée des clients ───────
--     Un vecteur d'embedding est une donnée dérivée du profil : il n'a rien à
--     faire dans une réponse PostgREST, et reste accessible à la seule RPC
--     ci-dessus (SECURITY DEFINER). Inoffensif si le grant n'existait pas.
REVOKE SELECT (embedding) ON public.user_profiles FROM anon, authenticated;

-- ─── Recharger le cache de schéma PostgREST ────────────────────────────────
NOTIFY pgrst, 'reload schema';

SELECT '✅ Couche ② (sémantique) déployée : pgvector, colonne embedding, trigger de fraîcheur, index HNSW et match_profiles_semantic() en SECURITY DEFINER. Prochaine étape : cd backend && node scripts/embed-profiles.js --all' AS status;
