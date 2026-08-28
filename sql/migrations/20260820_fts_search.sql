-- ============================================================================
-- Recherche annuaire — Couche ① : FTS français + trigram (pg_trgm)
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-20
--
-- Remplace la recherche ILIKE « phrase entière » (qui casse dès qu'il y a
-- plusieurs mots, ex. « couturier à Akpakpa ») par :
--   • un index plein-texte français (tokenisation, radicalisation, classement) ;
--   • une tolérance aux fautes de frappe via trigram (pg_trgm) ;
--   • une fonction search_profile_ids() qui renvoie les profils publiés
--     classés par pertinence (FTS + similarité + correspondance de tags).
--
-- Dépend des colonnes ajoutées précédemment : business_name, district, slogan
-- (migrations 20260819_*). Jouer les migrations dans l'ordre.
-- Idempotent.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 0. Garantie des colonnes référencées par le vecteur ────────────────────
--     (auto-suffisant : fonctionne même si les migrations 20260819_* n'ont pas
--      encore été jouées).
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS business_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS district      VARCHAR(120),
  ADD COLUMN IF NOT EXISTS slogan        VARCHAR(160);

-- ── 1. Vecteur plein-texte (français), généré et indexé (GIN) ──────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('french',
      coalesce(first_name, '')     || ' ' || coalesce(last_name, '')  || ' ' ||
      coalesce(business_name, '')  || ' ' || coalesce(role, '')       || ' ' ||
      coalesce(specialty, '')      || ' ' || coalesce(job_title, '')  || ' ' ||
      coalesce(category, '')       || ' ' || coalesce(activity_domain, '') || ' ' ||
      coalesce(city, '')           || ' ' || coalesce(district, '')   || ' ' ||
      coalesce(slogan, '')         || ' ' || coalesce(bio, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_user_profiles_search_vector
  ON public.user_profiles USING GIN (search_vector);

-- ── 2. Index trigram (tolérance aux fautes) sur les champs les plus cherchés ─
CREATE INDEX IF NOT EXISTS idx_user_profiles_trgm_role
  ON public.user_profiles USING GIN (role gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_user_profiles_trgm_specialty
  ON public.user_profiles USING GIN (specialty gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_user_profiles_trgm_city
  ON public.user_profiles USING GIN (city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_user_profiles_trgm_name
  ON public.user_profiles USING GIN ((coalesce(first_name, '') || ' ' || coalesce(last_name, '')) gin_trgm_ops);

-- ── 3. Fonction de recherche classée (profils publiés uniquement) ──────────
CREATE OR REPLACE FUNCTION public.search_profile_ids(q text, max_results int DEFAULT 200)
RETURNS TABLE(profile_id uuid, rank real)
LANGUAGE sql STABLE
AS $$
  WITH tsq AS (
    SELECT websearch_to_tsquery('french', q) AS query
  ),
  fts AS (  -- correspondance plein-texte classée
    SELECT p.id AS profile_id, ts_rank(p.search_vector, (SELECT query FROM tsq)) AS r
    FROM public.user_profiles p
    WHERE p.is_published = true
      AND p.search_vector @@ (SELECT query FROM tsq)
  ),
  fuzzy AS (  -- tolérance aux fautes (opérateur % : seuil de similarité)
    SELECT p.id AS profile_id,
           GREATEST(
             similarity(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''), q),
             similarity(coalesce(p.role, ''), q),
             similarity(coalesce(p.specialty, ''), q),
             similarity(coalesce(p.city, ''), q)
           ) AS r
    FROM public.user_profiles p
    WHERE p.is_published = true
      AND (
        (coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')) % q
        OR p.role % q OR p.specialty % q OR p.city % q
      )
  ),
  tagm AS (  -- correspondance sur une compétence / un tag
    SELECT pt.profile_id, 0.15::real AS r
    FROM public.profile_tags pt
    JOIN public.tags t ON t.id = pt.tag_id
    JOIN public.user_profiles p ON p.id = pt.profile_id AND p.is_published = true
    WHERE t.name ILIKE '%' || q || '%'
  )
  SELECT u.profile_id, MAX(u.r)::real AS rank
  FROM (
    SELECT profile_id, r FROM fts
    UNION ALL SELECT profile_id, r FROM fuzzy
    UNION ALL SELECT profile_id, r FROM tagm
  ) u
  GROUP BY u.profile_id
  ORDER BY rank DESC
  LIMIT max_results;
$$;

GRANT EXECUTE ON FUNCTION public.search_profile_ids(text, int) TO anon, authenticated;

SELECT '✅ FTS français + pg_trgm + search_profile_ids() prêts.' AS status;
