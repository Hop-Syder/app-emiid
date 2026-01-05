/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Configuration du Storage Supabase pour les avatars
 * @created 2026-01-05
*/

-- ==========================================
-- 7. CONFIGURATION DU STORAGE (AVATARS)
-- ==========================================

-- 1. Création du bucket 'avatars' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique : Permettre la lecture publique des avatars
-- Note: Le bucket est public, mais la policy SELECT assure l'accès via l'API
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
CREATE POLICY "Avatar Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 3. Politique : Permettre aux utilisateurs connectés d'uploader
-- On restreint le chemin pour que l'utilisateur ne puisse uploader que dans son propre dossier {user_id}/nom-image.jpg
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Politique : Permettre aux utilisateurs de modifier/supprimer leur propre avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );
