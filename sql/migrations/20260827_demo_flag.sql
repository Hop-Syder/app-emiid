-- ============================================================================
-- Jeu de démonstration — marqueur de suppression sûre
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-27
--
-- Les profils de démonstration doivent être indiscernables des vrais côté
-- interface (sinon la démonstration ne prouve rien), mais parfaitement
-- identifiables côté base pour être retirés d'un seul geste.
--
-- D'où une colonne dédiée plutôt qu'une convention sur l'e-mail ou le nom :
-- un préfixe se perd dès qu'on édite un profil, une colonne non.
--
-- Suppression complète :
--   DELETE FROM auth.users WHERE id IN (
--     SELECT user_id FROM public.user_profiles WHERE is_demo = true
--   );
--   -- la cascade retire profil, tags, vues, messages, abonnements et boosts.
--
-- Idempotent.
-- ============================================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.user_profiles.is_demo IS
  'true = profil de démonstration, à supprimer avant mise en production réelle.';

-- Index partiel : ne pèse que sur les quelques lignes de démonstration.
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_demo
  ON public.user_profiles (is_demo) WHERE is_demo = true;

-- Compte des profils de démonstration encore présents.
CREATE OR REPLACE FUNCTION public.count_demo_profiles()
RETURNS integer
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer FROM public.user_profiles WHERE is_demo = true;
$$;

SELECT
  (SELECT count(*) FROM public.user_profiles WHERE is_demo = true) AS profils_demo,
  '✅ Marqueur is_demo prêt.' AS status;
