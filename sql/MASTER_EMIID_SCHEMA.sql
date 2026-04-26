/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description MASTER SCHEMA FINAL - EmiID (SSoT)
 * @version 1.2.1
 * @updated 2026-04-19
 * 
 * 📖 Documentation détaillée : docs/DATABASE_SCHEMA.md
 * 
 * CHANGE LOG v1.2.1:
 * - Rebranding global : EmiID -> EmiID.
 * - Ton réseau, ta force.
 */

-- ==========================================
-- 1. EXTENSIONS & PRÉPARATION
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 2. RÉFÉRENTIELS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    iso_code CHAR(2) UNIQUE NOT NULL,
    is_west_africa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. CŒUR DU SYSTÈME : PROFILS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    category VARCHAR(50) DEFAULT 'Artisan',
    job_title TEXT,
    industry TEXT,
    role VARCHAR(100),
    specialty VARCHAR(255),
    activity_domain VARCHAR(100),
    country_id UUID REFERENCES public.countries(id),
    city VARCHAR(100),
    phone VARCHAR(20),
    website TEXT,
    pin_enabled BOOLEAN DEFAULT FALSE,
    pin_code TEXT,
    pin_attempts INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_at TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT FALSE,
    card_variant VARCHAR(50) DEFAULT 'default',
    has_profile BOOLEAN DEFAULT FALSE,
    followers_count INTEGER DEFAULT 0 CHECK (followers_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

CREATE TABLE IF NOT EXISTS public.profile_tags (
    profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, tag_id)
);

-- ==========================================
-- 4. RÉSEAUTAGE (Follow System)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CONSTRAINT participants_differs CHECK (follower_id != following_id)
);

-- ==========================================
-- 5. MESSAGERIE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    last_message_content TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant1_id, participant2_id),
    CONSTRAINT different_participants CHECK (participant1_id != participant2_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv_id ON public.messages(conversation_id);

-- ==========================================
-- 6. LOGIQUE AUTOMATIQUE
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, first_name, last_name, email, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        ''
    ) ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sync_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.user_profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.user_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE user_id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Interdire la modification du contenu des messages (seul is_read peut passer à TRUE)
CREATE OR REPLACE FUNCTION public.enforce_message_read_only()
RETURNS TRIGGER AS $$
BEGIN
    -- Blocage de toute modification de contenu, expéditeur ou conversation
    IF NEW.id <> OLD.id OR NEW.conversation_id <> OLD.conversation_id OR NEW.sender_id <> OLD.sender_id OR NEW.content <> OLD.content THEN
        RAISE EXCEPTION 'Modification du message interdite';
    END IF;

    -- Seul is_read peut évoluer de FALSE vers TRUE
    IF NEW.is_read IS DISTINCT FROM OLD.is_read THEN
        IF NEW.is_read = TRUE THEN
            RETURN NEW;
        ELSE
            RAISE EXCEPTION 'Retour en arrière sur is_read interdit';
        END IF;
    END IF;

    -- Pas de changement : on laisse passer
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_sync_followers ON public.user_follows;
CREATE TRIGGER trg_sync_followers AFTER INSERT OR DELETE ON public.user_follows FOR EACH ROW EXECUTE FUNCTION public.sync_followers_count();

DROP TRIGGER IF EXISTS trg_messages_read_only ON public.messages;
CREATE TRIGGER trg_messages_read_only
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_message_read_only();

-- ==========================================
-- 6b. SYSTÈME DE NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'message', 'system', 'security'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON public.push_subscriptions(user_id);

-- ==========================================
-- 7. SÉCURITÉ (RLS)
-- ==========================================

-- User Profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profil propre : accès total" ON public.user_profiles;
CREATE POLICY "Profil propre : accès total" ON public.user_profiles FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Profils publiés : lecture" ON public.user_profiles;
CREATE POLICY "Profils publiés : lecture" ON public.user_profiles FOR SELECT USING (is_published = TRUE);

-- Follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Follows Read" ON public.user_follows;
CREATE POLICY "Follows Read" ON public.user_follows FOR SELECT USING (auth.uid() IN (follower_id, following_id));
DROP POLICY IF EXISTS "Follows Write" ON public.user_follows;
CREATE POLICY "Follows Write" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Conversations Participant Access" ON public.conversations;
CREATE POLICY "Conversations Participant Access" ON public.conversations FOR ALL USING (auth.uid() IN (participant1_id, participant2_id));

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Messages Participant Read" ON public.messages;
CREATE POLICY "Messages Participant Read" ON public.messages FOR SELECT USING (
    conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() IN (participant1_id, participant2_id))
);
DROP POLICY IF EXISTS "Messages Participant Write" ON public.messages;
CREATE POLICY "Messages Participant Write" ON public.messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND 
    conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() IN (participant1_id, participant2_id))
);
DROP POLICY IF EXISTS "Messages Mark as Read" ON public.messages;
CREATE POLICY "Messages Mark as Read" ON public.messages FOR UPDATE
    USING (conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() IN (participant1_id, participant2_id)))
    WITH CHECK (
        conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() IN (participant1_id, participant2_id))
        AND sender_id <> auth.uid()
        AND is_read = TRUE
    );

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notifications Access" ON public.notifications;
CREATE POLICY "Notifications Access" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Push Subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Push Subs Access" ON public.push_subscriptions;
CREATE POLICY "Push Subs Access" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 8. VUES PUBLIQUES SÉCURISÉES
-- ==========================================

DROP VIEW IF EXISTS public.public_profiles;
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id, user_id, first_name, last_name, avatar_url, bio, category, job_title, 
    industry, role, specialty, activity_domain, country_id, city, website, 
    is_published, card_variant, followers_count, created_at
FROM public.user_profiles
WHERE is_published = TRUE;

-- ==========================================
-- 9. PERMISSIONS (Grants)
-- ==========================================
REVOKE ALL ON public.user_profiles FROM PUBLIC, authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_follows TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;

SELECT '✅ EmiID Master Schema v1.2.1 déployé. Ton réseau, ta force.' as status;
