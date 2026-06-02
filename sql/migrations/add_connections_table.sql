-- @author @hopsyder
-- @organization Nexus Partners
-- @description Migration pour créer la table connections et corriger la vue public_profiles.
-- @created 2026-06-02

-- 1. Recréer la vue public_profiles pour y inclure les colonnes manquantes
DROP VIEW IF EXISTS public.public_profiles;
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id, 
    user_id, 
    first_name, 
    last_name, 
    avatar_url, 
    cover_url, 
    bio, 
    category, 
    job_title, 
    industry, 
    role, 
    specialty, 
    activity_domain, 
    country_id, 
    city, 
    website, 
    is_published, 
    is_verified,
    is_premium,
    card_variant, 
    followers_count, 
    created_at
FROM public.user_profiles
WHERE is_published = TRUE;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. Créer la table connections
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id),
    CONSTRAINT sender_receiver_differs CHECK (sender_id != receiver_id)
);

-- Index pour accélérer les recherches de connexions
CREATE INDEX IF NOT EXISTS idx_connections_sender_id ON public.connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver_id ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- Activer RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DROP POLICY IF EXISTS "Users can read their own connections" ON public.connections;
CREATE POLICY "Users can read their own connections" ON public.connections
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can insert connection requests" ON public.connections;
CREATE POLICY "Users can insert connection requests" ON public.connections
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their received connections" ON public.connections;
CREATE POLICY "Users can update their received connections" ON public.connections
    FOR UPDATE
    USING (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can delete connection requests" ON public.connections;
CREATE POLICY "Users can delete connection requests" ON public.connections
    FOR DELETE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;

SELECT '✅ Migration connections et correction de la vue public_profiles appliquées avec succès' as status;
