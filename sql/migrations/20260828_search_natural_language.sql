-- ============================================================================
-- Recherche annuaire — tolérance au langage parlé
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-28
--
-- Symptôme : « je recherche un artisan » ne renvoyait AUCUN résultat, alors que
-- des artisans existent.
--
-- Cause : websearch_to_tsquery applique un ET implicite entre les mots. Le
-- dictionnaire français écarte « je » et « un » (mots vides), mais PAS
-- « recherche ». La requête devenait donc « recherch & artisan », et aucun
-- profil ne contient le mot « recherche ».
--
-- La dictée vocale produit systématiquement ce genre de phrase : le problème
-- n'est pas marginal, il est structurel.
--
-- Deux réponses :
--   1. retirer les formulations de requête (« je cherche », « il me faut »…) ;
--   2. si le ET ne donne rien, retomber sur un OU entre les termes restants —
--      une correspondance partielle vaut mieux qu'une page vide.
--
-- Le classement distingue les deux : correspondance complète d'abord, partielle
-- ensuite. Les catégories restent couvertes (poids A du search_vector), donc
-- « artisan » atteint bien category = 'Artisan' sans qu'aucun filtre soit posé.
--
-- Idempotent.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_profile_ids(q text, max_results int DEFAULT 200)
RETURNS TABLE(profile_id uuid, rank real)
LANGUAGE sql STABLE
AS $$
  WITH cleaned AS (
    -- Formulations de requête, pas des critères : on les retire avant analyse.
    SELECT NULLIF(trim(regexp_replace(
      regexp_replace(lower(coalesce(q, '')),
        '\y(je|j''|jai|recherche|rechercher|cherche|chercher|chercherais|veux|voudrais|souhaite|besoin|faut|trouve|trouver|quelqu''un|quelqun|serait|urgent|urgente|svp|stp|s''il|sil|vous|plait|plaît|merci|bonjour|salut|moi|mon|ma|mes|nous|pour|avec|dans|chez|vers|aupres|aupr[eè]s|autour|pres|pr[eè]s)\y',
        ' ', 'g'),
      '\s+', ' ', 'g')), '') AS txt
  ),
  base AS (
    -- Si le nettoyage a tout supprimé, on repart de la saisie d'origine.
    SELECT coalesce((SELECT txt FROM cleaned), q) AS txt
  ),
  tsq AS (
    SELECT
      websearch_to_tsquery('french', (SELECT txt FROM base)) AS q_and,
      -- Variante permissive : le ET devient un OU. Le passage par la
      -- représentation textuelle est la façon la plus sûre de transformer
      -- une tsquery déjà analysée sans réécrire l'analyseur.
      NULLIF(replace(websearch_to_tsquery('french', (SELECT txt FROM base))::text, '&', '|'), '')::tsquery AS q_or
  ),
  fts AS (
    SELECT p.id AS profile_id,
           CASE
             -- Tous les termes présents : correspondance franche, socle relevé.
             WHEN p.search_vector @@ (SELECT q_and FROM tsq)
               THEN 0.60 + ts_rank(p.search_vector, (SELECT q_and FROM tsq))
             -- Une partie seulement : utile, mais classé en dessous.
             ELSE 0.25 + 0.5 * ts_rank(p.search_vector, (SELECT q_or FROM tsq))
           END AS r
    FROM public.user_profiles p
    WHERE p.is_published = true
      AND (
        p.search_vector @@ (SELECT q_and FROM tsq)
        OR p.search_vector @@ (SELECT q_or FROM tsq)
      )
  ),
  tagm AS (
    SELECT pt.profile_id, 0.20::real AS r
    FROM public.profile_tags pt
    JOIN public.tags t ON t.id = pt.tag_id
    JOIN public.user_profiles p ON p.id = pt.profile_id AND p.is_published = true
    WHERE t.name ILIKE '%' || (SELECT txt FROM base) || '%'
  ),
  fuzzy AS (
    SELECT p.id AS profile_id,
           GREATEST(
             similarity(coalesce(p.role, '') || ' ' || coalesce(p.specialty, ''), (SELECT txt FROM base)),
             similarity(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''), (SELECT txt FROM base)),
             0.6 * similarity(coalesce(p.city, ''), (SELECT txt FROM base))
           ) AS r
    FROM public.user_profiles p
    WHERE p.is_published = true
      AND (
        p.role % (SELECT txt FROM base) OR p.specialty % (SELECT txt FROM base)
        OR (coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')) % (SELECT txt FROM base)
        OR p.city % (SELECT txt FROM base)
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
            WHEN a.fts_r IS NOT NULL OR a.tag_r IS NOT NULL
              THEN 1.0 + coalesce(a.fts_r, 0) + coalesce(a.tag_r, 0)
            ELSE 0.5 * coalesce(a.fuzzy_r, 0)
          END)::real AS rank
  FROM agg a
  ORDER BY rank DESC
  LIMIT max_results;
$$;

GRANT EXECUTE ON FUNCTION public.search_profile_ids(text, int) TO anon, authenticated;

SELECT '✅ Recherche tolérante au langage parlé : « je recherche un artisan » aboutit désormais.' AS status;
