/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Schéma SQL Unifié : Authentification + Application (Profils & Annonces)
 * @created 2026-01-04
*/

-- ==========================================
-- 1. EXTENSIONS & PRÉPARATION
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLE DES PROFILS (user_profiles)
-- ==========================================
-- Cette table stocke les informations visibles et modifiables de l'utilisateur.
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Informations personnelles
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    bio TEXT, -- Champ ajouté pour la personnalisation
    
    -- Statut & Métadonnées
    has_profile BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la rapidité des recherches par user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ==========================================
-- 3. TABLE DES ANNONCES (ads)
-- ==========================================
-- Gère les annonces (Marketplace) postées par les utilisateurs.
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Contenu de l'annonce
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    category VARCHAR(50),
    target_audience TEXT,
    
    -- Valeurs financières & Statut
    budget_limit NUMERIC DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'deleted')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour filtrer par user, statut et date (Performance Senior)
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON public.ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);

-- ==========================================
-- 4. LOGIQUE AUTOMATIQUE (Triggers)
-- ==========================================

-- Fonction pour créer automatiquement un profil à l'inscription
-- Gère intelligemment Google, LinkedIn et Email
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
        NULLIF(substring(NEW.raw_user_meta_data->>'full_name' FROM length(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1)) + 2), ''),
        ''
    );

    INSERT INTO public.user_profiles (user_id, first_name, last_name, email, avatar_url)
    VALUES (
        NEW.id,
        first_name_val,
        last_name_val,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activation du trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. SÉCURITÉ (Row Level Security - RLS)
-- ==========================================

-- Activer RLS sur les tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- POLITIQUES POUR USER_PROFILES
-- Tout le monde peut voir les profils
CREATE POLICY "Profils publics" ON public.user_profiles
    FOR SELECT USING (true);

-- L'utilisateur peut modifier SON profil
CREATE POLICY "Modification propre profil" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- POLITIQUES POUR ADS (ANNONCES)
-- Tout le monde voit les annonces actives
CREATE POLICY "Annonces actives visibles" ON public.ads
    FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

-- L'utilisateur peut insérer ses annonces
CREATE POLICY "Utilisateurs créent annonces" ON public.ads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- L'utilisateur peut modifier ses annonces
CREATE POLICY "Utilisateurs modifient annonces" ON public.ads
    FOR UPDATE USING (auth.uid() = user_id);
