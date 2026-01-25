-- Script de réparation rapide pour ajouter les colonnes manquantes
-- À exécuter dans l'éditeur SQL de Supabase si vous rencontrez l'erreur "column ... does not exist"

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS activity_domain VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_code TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_attempts INTEGER DEFAULT 0;

-- Recréation de la vue après ajout des colonnes
DROP VIEW IF EXISTS public.public_profiles_view;

CREATE OR REPLACE VIEW public.public_profiles_view AS
SELECT 
    id, user_id, first_name, last_name, avatar_url, bio, category, role, specialty, 
    activity_domain, industry, country_id, city, website, is_published, created_at
FROM public.user_profiles
WHERE is_published = TRUE;

GRANT SELECT ON public.public_profiles_view TO anon, authenticated;
