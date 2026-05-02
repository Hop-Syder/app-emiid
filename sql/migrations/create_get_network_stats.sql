/**
 * @author @hopsyder / E1 audit
 * @organization Nexus Partners
 * @description RPC get_network_stats() — renvoie en 1 seul appel DB les 4
 *   compteurs affichés sur le dashboard utilisateur et le dashboard public :
 *     { totalEntrepreneurs, verifiedMembers, countriesCovered, premiumMembers }
 *
 *   Remplace 4 requêtes PostgREST séparées (+ un Set côté JS) par une
 *   agrégation native Postgres avec FILTER. Gain attendu : ~4-6× sur la
 *   latence du dashboard et charge réduite sur PostgREST.
 *
 * @created 2026-01 (audit consolidé)
 *
 * À exécuter dans Supabase :
 *   - Option A : SQL Editor → coller le contenu → Run
 *   - Option B : psql via connection string du projet
 *
 * Le backend (dashboardController.ts) appelle la RPC et tombe en fallback
 * sur les 4 requêtes individuelles si la fonction n'existe pas encore —
 * cette migration peut donc être appliquée à froid sans downtime.
 */

-- ==========================================
-- 1) Fonction RPC
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_network_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'totalEntrepreneurs',
      COUNT(*) FILTER (WHERE is_published IS TRUE),
    'verifiedMembers',
      COUNT(*) FILTER (WHERE is_published IS TRUE AND is_verified IS TRUE),
    'premiumMembers',
      COUNT(*) FILTER (WHERE is_published IS TRUE AND is_premium IS TRUE),
    'countriesCovered',
      COUNT(DISTINCT country_id) FILTER (WHERE is_published IS TRUE AND country_id IS NOT NULL)
  )
  FROM public.user_profiles;
$$;

COMMENT ON FUNCTION public.get_network_stats() IS
  'Retourne les 4 compteurs globaux du réseau EmiID (pros publiés, vérifiés, premium, pays couverts). Accessible anon + authenticated.';

-- ==========================================
-- 2) Permissions (accès anon + authentifié)
-- ==========================================

GRANT EXECUTE ON FUNCTION public.get_network_stats() TO anon, authenticated, service_role;

-- ==========================================
-- 3) Index support (si absent) pour accélérer les FILTER
-- ==========================================

-- FILTER sur is_published est largement sélectif ; un index partiel aide
-- pour les comptages verified/premium et le DISTINCT country_id.
CREATE INDEX IF NOT EXISTS idx_user_profiles_published
  ON public.user_profiles (is_published)
  WHERE is_published IS TRUE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_published_country
  ON public.user_profiles (country_id)
  WHERE is_published IS TRUE AND country_id IS NOT NULL;

-- ==========================================
-- 4) Vérification manuelle (optionnel)
-- ==========================================
-- SELECT public.get_network_stats();
-- -- Doit renvoyer un jsonb du type :
-- -- {"totalEntrepreneurs": 6, "verifiedMembers": 0, "countriesCovered": 2, "premiumMembers": 0}
