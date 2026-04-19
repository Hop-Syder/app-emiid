/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Schéma SQL pour authentification multi-providers (Google, LinkedIn, etc.)
 * @created 2024-12-14
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

-- ==========================================
-- NEXUS CONNECT - AUTHENTIFICATION MULTI-PROVIDERS
-- ==========================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE 1: Profils utilisateurs (BASE)
-- ==========================================
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Informations de base
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    
    -- Statut du profil
    has_profile BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);

COMMENT ON TABLE public.user_profiles IS 'Profils utilisateurs Nukun.';
COMMENT ON COLUMN public.user_profiles.has_profile IS 'Indique si l''utilisateur a complété son profil entrepreneur.';

-- ==========================================
-- TABLE: public.user_auth_providers
-- Stocke les informations des providers OAuth utilisés
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_auth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Informations du provider
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'linkedin', 'github', 'facebook', 'email')),
    provider_user_id TEXT, -- ID unique chez le provider
    
    -- Métadonnées du provider (stockage flexible)
    provider_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Dates
    first_connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte: un user peut avoir plusieurs providers, mais un seul de chaque type
    UNIQUE(user_id, provider)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_auth_providers_user_id ON public.user_auth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_auth_providers_provider ON public.user_auth_providers(provider);

-- ==========================================
-- FONCTION AMÉLIORÉE: Création automatique du profil utilisateur
-- Supporte Google, LinkedIn et autres providers
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    provider_name TEXT;
    first_name_value TEXT;
    last_name_value TEXT;
    full_name_value TEXT;
    email_value TEXT;
    avatar_url_value TEXT;
    provider_id_value TEXT;
BEGIN
    -- Récupérer le provider utilisé (depuis raw_app_meta_data)
    provider_name := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
    
    -- Récupérer l'email
    email_value := NEW.email;
    
    -- Extraction des données selon le provider
    CASE provider_name
        -- ==========================================
        -- GOOGLE
        -- ==========================================
        WHEN 'google' THEN
            first_name_value := NEW.raw_user_meta_data->>'given_name';
            last_name_value := NEW.raw_user_meta_data->>'family_name';
            full_name_value := NEW.raw_user_meta_data->>'full_name';
            avatar_url_value := NEW.raw_user_meta_data->>'avatar_url';
            provider_id_value := NEW.raw_user_meta_data->>'sub'; -- Google User ID
            
            -- Si first_name/last_name absents, extraire du full_name
            IF first_name_value IS NULL AND full_name_value IS NOT NULL THEN
                first_name_value := split_part(full_name_value, ' ', 1);
                last_name_value := NULLIF(substring(full_name_value FROM length(split_part(full_name_value, ' ', 1)) + 2), '');
            END IF;
        
        -- ==========================================
        -- LINKEDIN
        -- ==========================================
        WHEN 'linkedin' THEN
            -- LinkedIn retourne 'name' (full name) et parfois 'given_name'/'family_name'
            first_name_value := COALESCE(
                NEW.raw_user_meta_data->>'given_name',
                NEW.raw_user_meta_data->>'firstName'
            );
            last_name_value := COALESCE(
                NEW.raw_user_meta_data->>'family_name',
                NEW.raw_user_meta_data->>'lastName'
            );
            full_name_value := NEW.raw_user_meta_data->>'name';
            avatar_url_value := NEW.raw_user_meta_data->>'picture';
            provider_id_value := NEW.raw_user_meta_data->>'sub';
            
            -- Fallback: extraire du full_name si nécessaire
            IF first_name_value IS NULL AND full_name_value IS NOT NULL THEN
                first_name_value := split_part(full_name_value, ' ', 1);
                last_name_value := NULLIF(substring(full_name_value FROM length(split_part(full_name_value, ' ', 1)) + 2), '');
            END IF;
        
        -- ==========================================
        -- EMAIL (inscription classique)
        -- ==========================================
        WHEN 'email' THEN
            -- Récupérer depuis les métadonnées fournies lors de l'inscription
            first_name_value := NEW.raw_user_meta_data->>'first_name';
            last_name_value := NEW.raw_user_meta_data->>'last_name';
            full_name_value := COALESCE(
                NEW.raw_user_meta_data->>'full_name',
                CONCAT_WS(' ', first_name_value, last_name_value)
            );
            avatar_url_value := NEW.raw_user_meta_data->>'avatar_url';
            provider_id_value := NEW.id::text; -- Utiliser l'UUID Supabase
        
        -- ==========================================
        -- AUTRES PROVIDERS (Facebook, etc.)
        -- ==========================================
        ELSE
            first_name_value := COALESCE(
                NEW.raw_user_meta_data->>'given_name',
                NEW.raw_user_meta_data->>'first_name'
            );
            last_name_value := COALESCE(
                NEW.raw_user_meta_data->>'family_name',
                NEW.raw_user_meta_data->>'last_name'
            );
            full_name_value := NEW.raw_user_meta_data->>'name';
            avatar_url_value := COALESCE(
                NEW.raw_user_meta_data->>'avatar_url',
                NEW.raw_user_meta_data->>'picture'
            );
            provider_id_value := COALESCE(
                NEW.raw_user_meta_data->>'sub',
                NEW.id::text
            );
            
            -- Fallback extraction
            IF first_name_value IS NULL AND full_name_value IS NOT NULL THEN
                first_name_value := split_part(full_name_value, ' ', 1);
                last_name_value := NULLIF(substring(full_name_value FROM length(split_part(full_name_value, ' ', 1)) + 2), '');
            END IF;
    END CASE;
    
    -- ==========================================
    -- INSERTION dans user_profiles
    -- ==========================================
    INSERT INTO public.user_profiles (
        user_id, 
        first_name, 
        last_name,
        email,
        avatar_url,
        has_profile
    )
    VALUES (
        NEW.id,
        COALESCE(first_name_value, 'Utilisateur'), -- Valeur par défaut si null
        COALESCE(last_name_value, ''),
        email_value,
        avatar_url_value,
        FALSE -- Le profil complet sera créé plus tard
    )
    ON CONFLICT (user_id) DO NOTHING; -- Éviter les doublons si trigger rejoué
    
    -- ==========================================
    -- INSERTION dans user_auth_providers
    -- ==========================================
    INSERT INTO public.user_auth_providers (
        user_id,
        provider,
        provider_user_id,
        provider_metadata
    )
    VALUES (
        NEW.id,
        provider_name,
        provider_id_value,
        jsonb_build_object(
            'email', email_value,
            'full_name', full_name_value,
            'avatar_url', avatar_url_value,
            'raw_metadata', NEW.raw_user_meta_data
        )
    )
    ON CONFLICT (user_id, provider) DO UPDATE SET
        last_used_at = NOW(),
        provider_metadata = EXCLUDED.provider_metadata;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- MISE À JOUR de la table user_profiles
-- Ajout des nouveaux champs si nécessaire
-- ==========================================
DO $$ 
BEGIN
    -- Ajouter email si n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN email VARCHAR(255);
    END IF;
    
    -- Ajouter avatar_url si n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- ==========================================
-- TRIGGER: Mise à jour automatique du profil
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- FONCTION: Récupérer les providers d'un utilisateur
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_user_providers(p_user_id UUID)
RETURNS TABLE(
    provider VARCHAR,
    first_connected_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uap.provider,
        uap.first_connected_at,
        uap.last_used_at
    FROM public.user_auth_providers uap
    WHERE uap.user_id = p_user_id
    ORDER BY uap.last_used_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- RLS: user_auth_providers
-- ==========================================
ALTER TABLE public.user_auth_providers ENABLE ROW LEVEL SECURITY;

-- Lecture: seulement ses propres providers
DROP POLICY IF EXISTS "user_auth_providers_select" ON public.user_auth_providers;
CREATE POLICY "user_auth_providers_select" ON public.user_auth_providers
    FOR SELECT USING (auth.uid() = user_id);

-- Insertion: automatique via trigger (pas de policy INSERT nécessaire)
-- Update: seulement via trigger (pas de policy UPDATE nécessaire)

-- ==========================================
-- MIGRATION DES DONNÉES EXISTANTES
-- Remplir user_auth_providers pour les users existants
-- ==========================================
DO $$
DECLARE
    user_record RECORD;
    provider_name TEXT;
BEGIN
    FOR user_record IN 
        SELECT id, email, raw_app_meta_data, raw_user_meta_data 
        FROM auth.users
    LOOP
        -- Déterminer le provider
        provider_name := COALESCE(user_record.raw_app_meta_data->>'provider', 'email');
        
        -- Insérer dans user_auth_providers si pas déjà présent
        INSERT INTO public.user_auth_providers (
            user_id,
            provider,
            provider_user_id,
            provider_metadata,
            first_connected_at
        )
        VALUES (
            user_record.id,
            provider_name,
            COALESCE(user_record.raw_user_meta_data->>'sub', user_record.id::text),
            jsonb_build_object(
                'email', user_record.email,
                'raw_metadata', user_record.raw_user_meta_data
            ),
            NOW()
        )
        ON CONFLICT (user_id, provider) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE '✅ Migration des providers existants terminée';
END $$;

-- ==========================================
-- VUES UTILES
-- ==========================================

-- Vue: Profils avec leurs providers
CREATE OR REPLACE VIEW public.user_profiles_with_providers AS
SELECT 
    up.id,
    up.user_id,
    up.first_name,
    up.last_name,
    up.email,
    up.avatar_url,
    up.has_profile,
    up.created_at,
    up.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'provider', uap.provider,
                'first_connected', uap.first_connected_at,
                'last_used', uap.last_used_at
            ) ORDER BY uap.last_used_at DESC
        ) FILTER (WHERE uap.provider IS NOT NULL),
        '[]'::json
    ) as auth_providers
FROM public.user_profiles up
LEFT JOIN public.user_auth_providers uap ON up.user_id = uap.user_id
GROUP BY up.id, up.user_id, up.first_name, up.last_name, up.email, up.avatar_url, up.has_profile, up.created_at, up.updated_at;

-- ==========================================
-- TESTS & VÉRIFICATIONS
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRATION MULTI-PROVIDER TERMINÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Table créée: user_auth_providers';
    RAISE NOTICE '⚡ Fonction mise à jour: handle_new_user()';
    RAISE NOTICE '🔍 Vue créée: user_profiles_with_providers';
    RAISE NOTICE '🔐 RLS activé sur user_auth_providers';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Providers supportés:';
    RAISE NOTICE '   - Google (actif)';
    RAISE NOTICE '   - LinkedIn (prêt)';
    RAISE NOTICE '   - GitHub (prêt)';
    RAISE NOTICE '   - Email (actif)';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Prochaines étapes:';
    RAISE NOTICE '   1. Configurer LinkedIn OAuth dans Supabase dashboard-user';
    RAISE NOTICE '   2. Tester la connexion avec différents providers';
    RAISE NOTICE '   3. Vérifier la table user_auth_providers';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- REQUÊTES DE VÉRIFICATION
-- ==========================================

-- Vérifier les providers des utilisateurs
-- SELECT * FROM public.user_profiles_with_providers;

-- Compter les utilisateurs par provider
-- SELECT provider, COUNT(*) as user_count 
-- FROM public.user_auth_providers 
-- GROUP BY provider 
-- ORDER BY user_count DESC;

-- Voir les métadonnées d'un provider spécifique
-- SELECT user_id, provider, provider_metadata 
-- FROM public.user_auth_providers 
-- WHERE provider = 'google';
