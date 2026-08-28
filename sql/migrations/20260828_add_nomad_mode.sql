-- Migration: Add is_nomad to user_profiles

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_nomad BOOLEAN DEFAULT false;

DROP VIEW IF EXISTS public.public_profiles;
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
    id, user_id, first_name, last_name, avatar_url, cover_url, bio, category, job_title,
    industry, role, specialty, activity_domain, country_id, city, website, slug,
    is_published, is_verified, is_premium, card_variant, followers_count, created_at,
    latitude, longitude, is_nomad
FROM public.user_profiles
WHERE is_published = TRUE
  AND COALESCE(is_suspended, FALSE) = FALSE;

-- Le DROP VIEW ci-dessus recrée l'objet : les privilèges par défaut du schéma
-- (ALTER DEFAULT PRIVILEGES ... TO anon, authenticated) s'y réappliquent alors
-- intégralement (INSERT/UPDATE/DELETE inclus). On les révoque avant de ne
-- regrant que SELECT, seul accès voulu sur cette vue publique.
REVOKE ALL ON public.public_profiles FROM anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
