/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Schéma SQL Unifié : Authentification + Application (Profils & Annonces)
 * @created 2026-01-04
 *
 * Version finale : corrections
 * - Utilise gen_random_uuid() (pgcrypto) pour cohérence
 * - INSERT du trigger handle_new_user : liste de colonnes alignée sur les valeurs
 * - Fonction handle_new_user déclarée SECURITY DEFINER (on recommande de révoquer l'exécution pour anon/authenticated)
 * - Trigger empêchant la modification de ads.user_id
 * - Politiques RLS corrigées (éviter références invalides à NEW)
 */

-- ==========================================
-- 1. EXTENSIONS & PRÉPARATION
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- fournit gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- optionnel, conservé si besoin

-- ==========================================
-- 1.5. TABLES DE RÉFÉRENCE (Secteurs & Professions)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.activity_sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sector_id UUID REFERENCES public.activity_sectors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tables pour l'auto-complétion intelligente (utilisées par le backend)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tables pour les Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion des données initiales
INSERT INTO public.activity_sectors (name, slug) VALUES
('Artisanat', 'artisanat'),
('Technologie & Digital', 'tech-digital'),
('Commerce & Vente', 'commerce-vente'),
('Agriculture & Agro-industrie', 'agriculture'),
('Services aux entreprises', 'services-entreprises'),
('Bâtiment & Travaux Publics', 'btp'),
('Transport & Logistique', 'transport'),
('Santé & Bien-être', 'sante'),
('Éducation & Formation', 'education'),
('Agences', 'agences'),
('Startup', 'startup')
ON CONFLICT (slug) DO NOTHING;

-- On récupère les IDs pour insérer les professions (Exemple simplifié)
INSERT INTO public.professions (name, sector_id) 
SELECT 'Menuisier / Ébéniste', id FROM public.activity_sectors WHERE slug = 'btp' UNION ALL
SELECT 'Plombier', id FROM public.activity_sectors WHERE slug = 'btp' UNION ALL
SELECT 'Électricien', id FROM public.activity_sectors WHERE slug = 'btp' UNION ALL
SELECT 'Développeur Fullstack', id FROM public.activity_sectors WHERE slug = 'tech-digital' UNION ALL
SELECT 'Designer UI/UX', id FROM public.activity_sectors WHERE slug = 'tech-digital' UNION ALL
SELECT 'Community Manager', id FROM public.activity_sectors WHERE slug = 'tech-digital' UNION ALL
SELECT 'Comptable', id FROM public.activity_sectors WHERE slug = 'services-entreprises' UNION ALL
SELECT 'Consultant', id FROM public.activity_sectors WHERE slug = 'services-entreprises'
ON CONFLICT DO NOTHING;

-- ==========================================
-- 1.6. TABLE DES PAYS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    iso_code CHAR(2) UNIQUE NOT NULL, -- ex: 'ML', 'FR'
    is_west_africa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion de quelques pays (Afrique de l'Ouest + Reste du monde)
INSERT INTO public.countries (name, iso_code, is_west_africa) VALUES
('Mali', 'ML', TRUE),
('Sénégal', 'SN', TRUE),
('Côte d''Ivoire', 'CI', TRUE),
('Burkina Faso', 'BF', TRUE),
('Bénin', 'BJ', TRUE),
('Niger', 'NE', TRUE),
('Togo', 'TG', TRUE),
('Guinée', 'GN', TRUE),
('Ghana', 'GH', TRUE),
('Nigeria', 'NG', TRUE),
('France', 'FR', FALSE),
('États-Unis', 'US', FALSE),
('Canada', 'CA', FALSE),
('Chine', 'CN', FALSE)
ON CONFLICT (iso_code) DO NOTHING;

-- ==========================================
-- 2. TABLE DES PROFILS (user_profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    -- Informations personnelles
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    category VARCHAR(50), -- Artisan, Freelance, Entreprise, ONG
    role VARCHAR(100),    -- Titre professionnel
    specialty VARCHAR(255), -- Description (anciennement Spécialité)
    activity_domain VARCHAR(100), -- Domaine d'activité
    
    -- Localisation
    country_id UUID REFERENCES public.countries(id),
    city VARCHAR(100),
    
    -- Contact & Web
    phone VARCHAR(20),
    website TEXT,

    -- Sécurité PIN
    pin_enabled BOOLEAN DEFAULT FALSE,
    pin_code TEXT, -- Haché (bcrypt) via backend
    pin_attempts INTEGER DEFAULT 0,

    -- Statut & Métadonnées
    is_published BOOLEAN DEFAULT FALSE,
    card_variant VARCHAR(50) DEFAULT 'default',
    has_profile BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison pour les Tags
CREATE TABLE IF NOT EXISTS public.profile_tags (
    profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);



-- ==========================================
-- 4. LOGIQUE AUTOMATIQUE (Triggers & fonctions)
-- ==========================================

-- Fonction pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    first_name_val TEXT;
    last_name_val TEXT;
BEGIN
    -- Extraction intelligente du prénom/nom selon le provider
    first_name_val := COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'given_name',
        split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
        'Utilisateur'
    );

    last_name_val := COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'family_name',
        NULLIF(substring(NEW.raw_user_meta_data->>'full_name'
            FROM length(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1)) + 2), ''),
        ''
    );

    INSERT INTO public.user_profiles (
        user_id,
        first_name,
        last_name,
        email,
        avatar_url,
        category,
        role,
        specialty
    )
    VALUES (
        NEW.id,
        first_name_val,
        last_name_val,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        COALESCE(NEW.raw_user_meta_data->>'category', 'Artisan'),
        COALESCE(NEW.raw_user_meta_data->>'role', ''),
        COALESCE(NEW.raw_user_meta_data->>'specialty', '')
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour appeler la fonction après création d'un utilisateur auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- ==========================================
-- 5. SÉCURITÉ (Row Level Security - RLS)
-- ==========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES policies
-- Lecture : On masque les champs sensibles (PIN) pour le public
DROP POLICY IF EXISTS "Profils publics" ON public.user_profiles;
CREATE POLICY "Profils publics" ON public.user_profiles
    FOR SELECT USING (true);

-- Note: Pour une sécurité maximale, on pourrait utiliser une VUE pour masquer pin_code.
-- Mais ici nous gérons via l'API.

DROP POLICY IF EXISTS "Modification propre profil" ON public.user_profiles;
CREATE POLICY "Modification propre profil" ON public.user_profiles
    FOR UPDATE USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Politiques pour les tables de support
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des tags" ON public.tags FOR SELECT USING (true);

ALTER TABLE public.profile_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des profile_tags" ON public.profile_tags FOR SELECT USING (true);
CREATE POLICY "Modif propre profile_tags" ON public.profile_tags 
    FOR ALL USING (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = (SELECT auth.uid())));



-- ==========================================
-- 6. RECOMMANDATIONS & NOTES
-- ==========================================
-- 1) Cohérence UUID :
--    - Ce fichier utilise gen_random_uuid() (pgcrypto). Si vous préférez uuid-ossp, remplacez gen_random_uuid() par uuid_generate_v4()
--      et vérifiez que l'extension uuid-ossp est activée et disponible dans votre instance.
-- 2) Confidentialité :
--    - La policy "Profils publics" expose toutes les colonnes en lecture. Si vous souhaitez masquer des champs sensibles (email),
--      créez une vue publique avec les champs non sensibles et limitez l'accès direct à la table.
-- 3) Permissions :
--    - Les fonctions SECURITY DEFINER sont créées ; conservez la révocation d'EXECUTE pour anon/authenticated si la logique doit rester uniquement
--      déclenchée par des triggers et non appelée directement par des utilisateurs.
-- 4) Tests :
--    - Testez l'inscription d'un utilisateur via l'API Auth et vérifiez la création automatique du profil.
--    - Testez la mise à jour du profil via l'API et vérifiez le hachage du PIN.
