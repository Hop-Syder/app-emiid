/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Système de Galerie de Projets & Activation Realtime
 * @created 2026-03-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/──────────────────────────────────

-- ==========================================
-- 1. ACTIVATION DE SUPABASE REALTIME
-- ==========================================

-- On active le temps réel pour la table des messages
-- (IMPORTANT: Nécessite d'être exécuté via le Dashboard Supabase si le rôle n'a pas les droits)
-- alter publication supabase_realtime add table public.messages;

-- ==========================================
-- 2. SYSTÈME DE GALERIE DE PROJETS
-- ==========================================

-- Table pour la galerie (Showcase)
CREATE TABLE IF NOT EXISTS public.project_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    title VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    order_index INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE public.project_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique galerie" ON public.project_gallery;
CREATE POLICY "Lecture publique galerie" ON public.project_gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion propre galerie" ON public.project_gallery;
CREATE POLICY "Gestion propre galerie" ON public.project_gallery FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 3. STORAGE POUR LA GALERIE
-- ==========================================

-- Création du bucket 'projects'
INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

-- Politique : Lecture publique
DROP POLICY IF EXISTS "Project Gallery Public Access" ON storage.objects;
CREATE POLICY "Project Gallery Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'projects' );

-- Politique : Upload (Dossier par user_id)
DROP POLICY IF EXISTS "Users can upload project images" ON storage.objects;
CREATE POLICY "Users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'projects' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique : Update/Delete
DROP POLICY IF EXISTS "Users can manage their project images" ON storage.objects;
CREATE POLICY "Users can manage their project images"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'projects' AND (storage.foldername(name))[1] = auth.uid()::text );

-- ==========================================
-- 4. SYSTÈME DE NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'message', 'follow', 'admin', 'ad_validation'
    title TEXT NOT NULL,
    content TEXT,
    link TEXT, -- URL de redirection (ex: /messages)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs voient leurs propres notifications" ON public.notifications;
CREATE POLICY "Les utilisateurs voient leurs propres notifications" ON public.notifications 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs gèrent leurs propres notifications" ON public.notifications;
CREATE POLICY "Les utilisateurs gèrent leurs propres notifications" ON public.notifications 
    FOR UPDATE USING (auth.uid() = user_id);
