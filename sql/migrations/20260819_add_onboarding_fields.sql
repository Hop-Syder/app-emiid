-- ============================================================================
-- Migration : champs manquants pour le tunnel d'onboarding EmiID (3 étapes)
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-19
--
-- Ajoute les deux colonnes requises par le tunnel « Qui / Que / Où » qui
-- n'existaient pas dans user_profiles :
--   • business_name : nom commercial / nom d'atelier (Étape 1, facultatif)
--   • district      : arrondissement / quartier (Étape 3, découverte géoloc.)
--
-- Idempotent : réexécutable sans effet de bord (IF NOT EXISTS).
-- ============================================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS business_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS district      VARCHAR(120);

COMMENT ON COLUMN public.user_profiles.business_name
  IS 'Nom commercial / nom d''atelier (facultatif si nom propre).';
COMMENT ON COLUMN public.user_profiles.district
  IS 'Arrondissement / quartier pour la découverte géolocalisée dans l''annuaire.';

-- Index léger pour le filtrage annuaire par quartier (recherches de proximité).
CREATE INDEX IF NOT EXISTS idx_user_profiles_district
  ON public.user_profiles (district)
  WHERE district IS NOT NULL;
