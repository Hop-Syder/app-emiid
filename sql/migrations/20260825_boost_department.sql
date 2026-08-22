-- ============================================================================
-- Monétisation — Boost départemental (Score 3 du cadrage)
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-25
--
-- La structure était déjà prête (profile_boosts.scope / department_id) ; il
-- manquait la remontée dans le classement.
--
-- Règle métier : une recherche dans une COMMUNE doit faire remonter
--   • les profils boostés SUR cette commune          → Score 4 ;
--   • les profils boostés SUR SON DÉPARTEMENT        → Score 3.
-- La fonction renvoie donc la portée, pour que l'appelant pondère différemment.
--
-- Le type de retour change : PostgreSQL impose un DROP avant recréation.
-- Idempotent. Jouer après 20260824_boosts_phase2.sql.
-- ============================================================================

DROP FUNCTION IF EXISTS public.active_boosted_profile_ids(uuid);

CREATE FUNCTION public.active_boosted_profile_ids(p_commune_id uuid)
RETURNS TABLE(profile_id uuid, scope text)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH target AS (
    SELECT c.id AS commune_id, c.department_id
    FROM public.communes c
    WHERE c.id = p_commune_id
  )
  -- Score 4 : boost sur la commune exacte.
  SELECT DISTINCT b.profile_id, 'COMMUNE'::text AS scope
  FROM public.profile_boosts b
  JOIN public.user_profiles p ON p.id = b.profile_id AND p.is_published = true
  JOIN target t ON b.commune_id = t.commune_id
  WHERE b.status = 'ACTIVE'
    AND b.scope = 'COMMUNE'
    AND b.starts_at <= now()
    AND b.expires_at > now()

  UNION

  -- Score 3 : boost sur le département auquel appartient la commune.
  SELECT DISTINCT b.profile_id, 'DEPARTMENT'::text AS scope
  FROM public.profile_boosts b
  JOIN public.user_profiles p ON p.id = b.profile_id AND p.is_published = true
  JOIN target t ON b.department_id = t.department_id
  WHERE b.status = 'ACTIVE'
    AND b.scope = 'DEPARTMENT'
    AND b.starts_at <= now()
    AND b.expires_at > now();
$$;

GRANT EXECUTE ON FUNCTION public.active_boosted_profile_ids(uuid) TO anon, authenticated;

-- Index dédié aux boosts départementaux (l'existant ne couvre que la commune).
CREATE INDEX IF NOT EXISTS idx_boosts_department_lookup
  ON public.profile_boosts (scope, department_id, status, expires_at);

-- Résolution d'un département par libellé (tolérante aux accents et à la casse).
CREATE OR REPLACE FUNCTION public.resolve_department_id(p_label text)
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT d.id
  FROM public.departments d
  WHERE public.normalize_place(d.name) = public.normalize_place(p_label)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_department_id(text) TO anon, authenticated;

SELECT '✅ Boost départemental prêt : active_boosted_profile_ids() renvoie désormais la portée.' AS status;
