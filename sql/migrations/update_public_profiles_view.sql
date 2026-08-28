-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Migration pour mettre à jour la vue public_profiles avec le slug, l'email, et le téléphone
--  * @created 2026-06-03
--  * @updated 2026-06-03
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

-- 1. Recréer la vue public_profiles pour y inclure les colonnes manquantes : slug, email, phone
DROP VIEW IF EXISTS public.public_profiles;
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id, 
    user_id, 
    first_name, 
    last_name, 
    avatar_url, 
    cover_url, 
    bio, 
    category, 
    job_title, 
    industry, 
    role, 
    specialty, 
    activity_domain, 
    country_id, 
    city, 
    website, 
    email,
    phone,
    slug,
    is_published, 
    is_verified,
    is_premium,
    card_variant, 
    followers_count, 
    created_at
FROM public.user_profiles
WHERE is_published = TRUE;

-- 2. Ré-accorder les privilèges de lecture sur la vue pour tout le monde (anonymes et connectés)
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.tags TO anon, authenticated;
GRANT SELECT ON public.profile_tags TO anon, authenticated;

-- 3. Rétrocompatibilité : marquer has_profile à true pour tous les profils existants déjà configurés
UPDATE public.user_profiles
SET has_profile = TRUE
WHERE has_profile = FALSE AND (first_name IS NOT NULL OR last_name IS NOT NULL OR slug IS NOT NULL);

SELECT '✅ Migration de la vue public_profiles et correction rétroactive de has_profile appliquées avec succès' as status;
