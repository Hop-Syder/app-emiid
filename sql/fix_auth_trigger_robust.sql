-- ==========================================
-- FIX: Réparation robuste de l'authentification
-- ==========================================

-- 1. S'assurer que les tables existent
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    has_profile BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Recréer la fonction handle_new_user avec une approche "Fail Safe"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    provider_name TEXT;
    first_name_value TEXT;
    last_name_value TEXT;
    full_name_value TEXT;
    avatar_url_value TEXT;
BEGIN
    -- Protection contre les erreurs pour ne jamais bloquer le login
    BEGIN
        -- Extraction basique des métadonnées
        provider_name := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
        first_name_value := COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name', split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1));
        last_name_value := COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name');
        avatar_url_value := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture');
        
        -- Si pas de nom, on met une valeur par défaut
        IF first_name_value IS NULL THEN
            first_name_value := 'Utilisateur';
        END IF;

        -- Insertion simplifiée dans user_profiles
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
            first_name_value,
            last_name_value,
            NEW.email,
            avatar_url_value,
            FALSE
        )
        ON CONFLICT (user_id) DO UPDATE SET
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            avatar_url = EXCLUDED.avatar_url,
            updated_at = NOW();

    EXCEPTION WHEN OTHERS THEN
        -- En cas d'erreur SQL, on log mais on NE BLOQUE PAS l'insertion dans auth.users
        RAISE WARNING 'Erreur dans handle_new_user: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Réappliquer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Droits (au cas où)
GRANT ALL ON public.user_profiles TO postgres;
GRANT ALL ON public.user_profiles TO service_role;
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
