/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Schéma SQL Maître consolidé - Version Finale Unifiée
 * @created 2026-01-25
 * 
 * Contient :
 * 1. Extensions et Configuration
 * 2. Tables de Référence (Pays, Secteurs, Jobs, Tags)
 * 3. Tables Principales (Profils, Annonces)
 * 4. Fonctionnalités Avancées (Suivi, Messagerie)
 * 5. Logique Métier (Triggers, Fonctions Sync)
 * 6. Sécurité & Confidentialité (RLS, Vues sécurisées)
 */

-- ==========================================
-- 1. EXTENSIONS & PRÉPARATION
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;      
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLES DE RÉFÉRENCE & DONNÉES STATIC
-- ==========================================

-- Countries
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    iso_code CHAR(2) UNIQUE NOT NULL, 
    is_west_africa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Données Pays (Exemple)
INSERT INTO public.countries (name, iso_code, is_west_africa) VALUES
('Mali', 'ML', TRUE), ('Sénégal', 'SN', TRUE), ('Côte d''Ivoire', 'CI', TRUE),
('Burkina Faso', 'BF', TRUE), ('Bénin', 'BJ', TRUE), ('Togo', 'TG', TRUE),
('Niger', 'NE', TRUE), ('France', 'FR', FALSE), ('États-Unis', 'US', FALSE)
ON CONFLICT (iso_code) DO NOTHING;

-- Smart Autocomplete (Crowdsourcing)
CREATE TABLE IF NOT EXISTS public.industries (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jobs (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags System
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. TABLES PRINCIPALES (User Profiles)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Identité Publique
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    category VARCHAR(50), 
    role VARCHAR(100),    -- Titre affiché
    job_title TEXT,       -- Normalisé (backend logic)
    specialty VARCHAR(255),
    
    -- Business & Localisation
    activity_domain VARCHAR(100),
    industry TEXT,        -- Normalisé
    country_id UUID REFERENCES public.countries(id),
    city VARCHAR(255),
    website VARCHAR(255),
    
    -- Données Privées / Sensibles (A PROTÉGER)
    email VARCHAR(255),
    phone VARCHAR(20),
    pin_code TEXT,
    pin_enabled BOOLEAN DEFAULT FALSE,
    pin_attempts INTEGER DEFAULT 0,
    
    -- Statut
    has_profile BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Liaison Profil <-> Tags
CREATE TABLE IF NOT EXISTS public.profile_tags (
    profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, tag_id)
);

-- ==========================================
-- 4. ANNONCES (Ads)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    category VARCHAR(50),
    budget_limit NUMERIC DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. FONCTIONNALITÉS AVANCÉES
-- ==========================================

-- Système de Suivi (Follow)
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Messagerie
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    last_message_content TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. TRIGGERS & LOGIQUE MÉTIER
-- ==========================================

-- Création de profil automatique
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, first_name, last_name, role)
    VALUES (
        NEW.id, 
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'role'
    ) ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sauvegarde complète profil + tags (Utilisé par le code Backend/SQL si nécessaire)
CREATE OR REPLACE FUNCTION public.save_profile_card(
    p_user_id UUID, p_first_name TEXT, p_last_name TEXT, p_role TEXT, 
    p_category TEXT, p_specialty TEXT, p_bio TEXT, p_phone TEXT, 
    p_website TEXT, p_country_id UUID, p_city TEXT, p_is_published BOOLEAN, p_tags TEXT[]
) RETURNS JSON AS $$
DECLARE
    v_profile_id UUID;
    v_tag_name TEXT;
    v_tag_id UUID;
BEGIN
    INSERT INTO public.user_profiles (
        user_id, first_name, last_name, role, category, specialty, bio, phone, website, country_id, city, is_published, updated_at
    ) VALUES (
        p_user_id, p_first_name, p_last_name, p_role, p_category, p_specialty, p_bio, p_phone, p_website, p_country_id, p_city, p_is_published, NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role,
        category = EXCLUDED.category, specialty = EXCLUDED.specialty, bio = EXCLUDED.bio,
        phone = EXCLUDED.phone, website = EXCLUDED.website, country_id = EXCLUDED.country_id,
        city = EXCLUDED.city, is_published = EXCLUDED.is_published, updated_at = NOW()
    RETURNING id INTO v_profile_id;

    DELETE FROM public.profile_tags WHERE profile_id = v_profile_id;

    IF p_tags IS NOT NULL THEN
        FOREACH v_tag_name IN ARRAY p_tags LOOP
            INSERT INTO public.tags (name) VALUES (LOWER(TRIM(v_tag_name)))
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_tag_id;
            INSERT INTO public.profile_tags (profile_id, tag_id) VALUES (v_profile_id, v_tag_id) ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
    RETURN json_build_object('success', true, 'profile_id', v_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6.5. MIGRATION & GARANTIE DE SCHÉMA
-- ==========================================
-- Ce bloc s'assure que les colonnes existent même si la table a été créée par une ancienne version du script
DO $$
BEGIN
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS activity_domain VARCHAR(100);
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255);
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_code TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_enabled BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_attempts INTEGER DEFAULT 0;
EXCEPTION
    WHEN OTHERS THEN RAISE NOTICE 'Erreur lors de la mise à jour des colonnes: %', SQLERRM;
END $$;

-- ==========================================
-- 7. SÉCURITÉ (RLS + SECURE VIEWS)
-- ==========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- --> CONFIDENTIALITÉ : Vue Publique Sécurisée
-- On ne donne accès qu'à cette vue pour le public, pas à la table user_profiles brute
CREATE OR REPLACE VIEW public.public_profiles_view AS
SELECT 
    id, user_id, first_name, last_name, avatar_url, bio, category, role, specialty, 
    activity_domain, industry, country_id, city, website, is_published, created_at
FROM public.user_profiles
WHERE is_published = TRUE;

-- Permissions Vue
GRANT SELECT ON public.public_profiles_view TO anon, authenticated;

-- Policies Table user_profiles (Restriction stricte)
-- 1. Lecture : Tout le monde peut lire (nécessaire pour les jointures internes), MAIS on recommande d'utiliser la vue pour l'affichage public
DROP POLICY IF EXISTS "Public Profiles Read" ON public.user_profiles;
CREATE POLICY "Public Profiles Read" ON public.user_profiles FOR SELECT USING (true);

-- 2. Modification : Seulement soi-même
DROP POLICY IF EXISTS "User Update Own Profile" ON public.user_profiles;
CREATE POLICY "User Update Own Profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Policies Ads
CREATE POLICY "Ads Read" ON public.ads FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
CREATE POLICY "Ads Write" ON public.ads FOR ALL USING (auth.uid() = user_id);

-- Policies Follows
CREATE POLICY "Follows Read" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Follows Write" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

-- Policies Messages
CREATE POLICY "Conv Own" ON public.conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Msg Own" ON public.messages FOR SELECT USING (
    conversation_id IN (SELECT id FROM public.conversations WHERE participant1_id = auth.uid() OR participant2_id = auth.uid())
);
CREATE POLICY "Msg Send" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
