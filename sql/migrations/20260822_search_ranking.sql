-- ============================================================================
-- Recherche annuaire — Classement hiérarchisé (cascade pondérée des champs)
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-22
--
-- Objectif : prioriser les correspondances par IMPORTANCE du champ, façon
-- « cascade pondérée » :
--     métier / catégorie  >  ville  >  secteur  >  contexte (nom, slogan, bio)
--
-- On encode cette priorité DANS l'index plein-texte via setweight (poids natifs
-- Postgres A/B/C/D → coefficients ts_rank {A=1.0, B=0.4, C=0.2, D=0.1}).
-- La fonction search_profile_ids() est réécrite pour que le FTS pondéré reste
-- le signal dominant (les correspondances réelles passent toujours devant les
-- rattrapages « faute de frappe »), la hiérarchie des champs est ainsi préservée.
--
-- Le bonus statut (premium / vérifié) N'est PAS appliqué ici : il l'est côté
-- route (bonus multiplicatif sur la pertinence), pour rester « pertinence
-- d'abord ». Cf. frontend-user/app/api/annuaire/route.ts.
--
-- Idempotent. Jouer après 20260820_fts_search.sql et 20260821_semantic_search.sql.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 0. Garantie des colonnes référencées (auto-suffisant) ──────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS business_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS district      VARCHAR(120),
  ADD COLUMN IF NOT EXISTS slogan        VARCHAR(160);

-- ── 1. Vecteur plein-texte PONDÉRÉ (cascade des champs) ────────────────────
--     On recrée la colonne générée avec setweight. DROP COLUMN retire aussi
--     l'index GIN qui en dépend → on le recrée juste après.
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS search_vector;

ALTER TABLE public.user_profiles
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    -- A : métier / catégorie (priorité maximale)
    setweight(to_tsvector('french',
      coalesce(role, '')       || ' ' || coalesce(specialty, '') || ' ' ||
      coalesce(job_title, '')  || ' ' || coalesce(category, '')
    ), 'A') ||
    -- B : ville
    setweight(to_tsvector('french',
      coalesce(city, '')       || ' ' || coalesce(district, '')
    ), 'B') ||
    -- C : secteur d'activité
    setweight(to_tsvector('french',
      coalesce(activity_domain, '')
    ), 'C') ||
    -- D : contexte (raison sociale, slogan, nom, bio)
    setweight(to_tsvector('french',
      coalesce(business_name, '') || ' ' || coalesce(slogan, '')     || ' ' ||
      coalesce(first_name, '')    || ' ' || coalesce(last_name, '')  || ' ' ||
      coalesce(bio, '')
    ), 'D')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_user_profiles_search_vector
  ON public.user_profiles USING GIN (search_vector);

-- ── 2. Fonction de recherche classée (hiérarchie des champs préservée) ─────
--     Trois signaux :
--       • FTS pondéré  → correspondance réelle, ordonnée métier>ville>secteur ;
--       • tag          → compétence explicite (traitée comme correspondance) ;
--       • flou (trgm)  → rattrapage « faute de frappe », TOUJOURS sous les FTS.
--     Socle : les correspondances FTS/tag reçoivent 1.0 + rang → elles passent
--     systématiquement devant les rattrapages flous (< 1.0).
CREATE OR REPLACE FUNCTION public.search_profile_ids(q text, max_results int DEFAULT 200)
RETURNS TABLE(profile_id uuid, rank real)
LANGUAGE sql STABLE
AS $$
  WITH tsq AS (
    SELECT websearch_to_tsquery('french', q) AS query
  ),
  fts AS (  -- correspondance plein-texte pondérée (A/B/C/D)
    SELECT p.id AS profile_id, ts_rank(p.search_vector, (SELECT query FROM tsq)) AS r
    FROM public.user_profiles p
    WHERE p.is_published = true
      AND p.search_vector @@ (SELECT query FROM tsq)
  ),
  tagm AS (  -- correspondance sur une compétence / un tag
    SELECT pt.profile_id, 0.20::real AS r
    FROM public.profile_tags pt
    JOIN public.tags t ON t.id = pt.tag_id
    JOIN public.user_profiles p ON p.id = pt.profile_id AND p.is_published = true
    WHERE t.name ILIKE '%' || q || '%'
  ),
  fuzzy AS (  -- rattrapage fautes de frappe (métier > nom > ville pondérée bas)
    SELECT p.id AS profile_id,
           GREATEST(
             similarity(coalesce(p.role, '') || ' ' || coalesce(p.specialty, ''), q),
             similarity(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''), q),
             0.6 * similarity(coalesce(p.city, ''), q)
           ) AS r
    FROM public.user_profiles p
    WHERE p.is_published = true
      AND (
        p.role % q OR p.specialty % q
        OR (coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')) % q
        OR p.city % q
      )
  ),
  agg AS (
    SELECT u.profile_id,
           MAX(u.r) FILTER (WHERE u.src = 'fts')   AS fts_r,
           MAX(u.r) FILTER (WHERE u.src = 'tag')   AS tag_r,
           MAX(u.r) FILTER (WHERE u.src = 'fuzzy') AS fuzzy_r
    FROM (
      SELECT profile_id, r, 'fts'::text   AS src FROM fts
      UNION ALL SELECT profile_id, r, 'tag'   FROM tagm
      UNION ALL SELECT profile_id, r, 'fuzzy' FROM fuzzy
    ) u
    GROUP BY u.profile_id
  )
  SELECT a.profile_id,
         (CASE
            -- Correspondance réelle (FTS et/ou tag) : socle 1.0 + rangs.
            WHEN a.fts_r IS NOT NULL OR a.tag_r IS NOT NULL
              THEN 1.0 + coalesce(a.fts_r, 0) + coalesce(a.tag_r, 0)
            -- Rattrapage flou uniquement : reste sous tous les FTS.
            ELSE 0.5 * coalesce(a.fuzzy_r, 0)
          END)::real AS rank
  FROM agg a
  ORDER BY rank DESC
  LIMIT max_results;
$$;

GRANT EXECUTE ON FUNCTION public.search_profile_ids(text, int) TO anon, authenticated;

SELECT '✅ Classement pondéré prêt : search_vector A/B/C/D + search_profile_ids() hiérarchisé.' AS status;
