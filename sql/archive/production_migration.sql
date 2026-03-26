-- ==============================================================================
-- SCRIPT DE MIGRATION POUR LA PRODUCTION (RAILWAY / SUPABASE)
-- ==============================================================================
-- Ce script est idempotent : il crée les tables et colonnes UNIQUEMENT si elles n'existent pas.
-- Vous pouvez l'exécuter en toute sécurité sur votre base de données de production.

-- 1. S'assurer que l'extension UUID est activée
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Mise à jour de la table USER_PROFILES (Colonnes manquantes)
DO $$
BEGIN
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255);
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_code TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_enabled BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_attempts INTEGER DEFAULT 0;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
EXCEPTION
    WHEN OTHERS THEN RAISE NOTICE 'Erreur lors de la mise à jour des colonnes user_profiles';
END $$;

-- 3. Système de Suivi (Followers)
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- RLS Follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Follows Read" ON public.user_follows;
CREATE POLICY "Follows Read" ON public.user_follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Follows Write" ON public.user_follows;
CREATE POLICY "Follows Write" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

-- 4. Système de Messagerie
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

-- RLS Messagerie
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Conv Own" ON public.conversations;
CREATE POLICY "Conv Own" ON public.conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "Msg Own" ON public.messages;
CREATE POLICY "Msg Own" ON public.messages FOR SELECT USING (
    conversation_id IN (SELECT id FROM public.conversations WHERE participant1_id = auth.uid() OR participant2_id = auth.uid())
);

DROP POLICY IF EXISTS "Msg Send" ON public.messages;
CREATE POLICY "Msg Send" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- 5. Mise à jour de la Vue Publique (Secure View)
DROP VIEW IF EXISTS public.public_profiles_view;
CREATE OR REPLACE VIEW public.public_profiles_view AS
SELECT 
    id, user_id, first_name, last_name, avatar_url, bio, category, role, specialty, 
    activity_domain, industry, country_id, city, website, is_published, created_at
FROM public.user_profiles
WHERE is_published = TRUE;

GRANT SELECT ON public.public_profiles_view TO anon, authenticated;

-- Confirmation
SELECT 'Migration terminée avec succès' as status;
