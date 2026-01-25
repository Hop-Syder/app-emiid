/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Schéma SQL pour la Messagerie et le Système de Suivi (Portefeuille)
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

-- ==========================================
-- 1. SYSTÈME DE SUIVI (FOLLOWERS / PORTEFEUILLE)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- RLS for user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique des suivis" ON public.user_follows;
CREATE POLICY "Lecture publique des suivis" ON public.user_follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Les utilisateurs gèrent leurs propres suivis" ON public.user_follows;
CREATE POLICY "Les utilisateurs gèrent leurs propres suivis" ON public.user_follows 
    FOR ALL USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);

-- ==========================================
-- 2. SYSTÈME DE MESSAGERIE
-- ==========================================

-- Table des Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    last_message_content TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant1_id, participant2_id),
    CONSTRAINT participants_differs CHECK (participant1_id != participant2_id)
);

-- Table des Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant1_id, participant2_id);

-- RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Voir ses propres conversations" ON public.conversations;
CREATE POLICY "Voir ses propres conversations" ON public.conversations 
    FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Voir les messages de ses conversations" ON public.messages;
CREATE POLICY "Voir les messages de ses conversations" ON public.messages 
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE participant1_id = auth.uid() OR participant2_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Envoyer des messages" ON public.messages;
CREATE POLICY "Envoyer des messages" ON public.messages 
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE participant1_id = auth.uid() OR participant2_id = auth.uid()
        )
    );
