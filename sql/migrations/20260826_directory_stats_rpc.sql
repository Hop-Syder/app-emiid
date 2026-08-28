-- ============================================================================
-- Annuaire — statistiques réelles (pays et tags populaires)
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-26
--
-- Les routes /api/annuaire/stats-countries et /api/annuaire/tags appelaient
-- get_top_countries() et get_popular_tags(), qui n'existaient dans AUCUNE
-- migration. L'appel échouait donc systématiquement et les routes servaient un
-- jeu de données FICTIF (« Sénégal 45, Côte d'Ivoire 38 »…) affiché en
-- permanence dans les filtres, la liste des pays et les tags de l'annuaire.
--
-- Cette migration crée les deux fonctions manquantes : l'annuaire montre
-- désormais l'état réel du réseau, quitte à être vide au démarrage.
--
-- Idempotent.
-- ============================================================================

-- Pays les plus représentés parmi les profils publiés.
CREATE OR REPLACE FUNCTION public.get_top_countries()
RETURNS TABLE(id uuid, iso_code text, name text, count bigint)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.iso_code::text, c.name::text, count(p.id) AS count
  FROM public.countries c
  JOIN public.user_profiles p
    ON p.country_id = c.id AND p.is_published = true
  GROUP BY c.id, c.iso_code, c.name
  ORDER BY count DESC, c.name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_top_countries() TO anon, authenticated;

-- Compétences les plus portées par les profils publiés.
CREATE OR REPLACE FUNCTION public.get_popular_tags(max_results int DEFAULT 20)
RETURNS TABLE(id uuid, name text, count bigint)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name::text, count(pt.profile_id) AS count
  FROM public.tags t
  JOIN public.profile_tags pt ON pt.tag_id = t.id
  JOIN public.user_profiles p ON p.id = pt.profile_id AND p.is_published = true
  GROUP BY t.id, t.name
  ORDER BY count DESC, t.name ASC
  LIMIT max_results;
$$;

GRANT EXECUTE ON FUNCTION public.get_popular_tags(int) TO anon, authenticated;

SELECT '✅ get_top_countries() et get_popular_tags() créées — fin des données fictives.' AS status;
