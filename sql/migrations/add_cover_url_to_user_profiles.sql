-- @author @hopsyder
-- @organization Nexus Partners
-- @description Migration pour ajouter cover_url à la table user_profiles et mettre à jour la vue public_profiles.
-- @created 2026-05-24
-- @updated 2026-05-24

-- 1. Ajouter la colonne cover_url à la table user_profiles si elle n'existe pas déjà
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- 2. Recréer la vue public_profiles pour y inclure la colonne cover_url
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
    card_variant, 
    followers_count, 
    created_at
FROM public.user_profiles
WHERE is_published = TRUE;

-- 3. Ré-accorder les privilèges de lecture sur la vue pour tout le monde (anonymes et connectés)
GRANT SELECT ON public.public_profiles TO anon, authenticated;

SELECT '✅ Migration cover_url appliquée avec succès' as status;
