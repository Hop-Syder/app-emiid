-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Ajout des coordonnées GPS (latitude/longitude) de l'entreprise
--  * @created 2026-08-28
--  * 🌐 ceo.nexuspartners.xyz
--  */
-- ──────────────────────────────────

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

COMMENT ON COLUMN public.user_profiles.latitude
  IS 'Latitude GPS de l''entreprise ou de l''atelier';
COMMENT ON COLUMN public.user_profiles.longitude
  IS 'Longitude GPS de l''entreprise ou de l''atelier';

-- Facultatif : Index spatial ou composite si des recherches par proximité sont prévues
-- CREATE INDEX IF NOT EXISTS idx_user_profiles_gps
--   ON public.user_profiles (latitude, longitude)
--   WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
