-- @author @hopsyder
-- @organization Nexus Partners
-- @description Migration pour ajouter is_premium et is_verified à la vue public_profiles.
-- @created 2026-06-01

-- 1. Recréer la vue public_profiles pour y inclure les colonnes manquantes
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

SELECT '✅ Migration is_premium et is_verified vers public_profiles appliquée avec succès' as status;
