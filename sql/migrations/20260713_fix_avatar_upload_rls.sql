-- ============================================================
-- Correctif upload d'images (avatars / couvertures / galerie / chat)
-- ------------------------------------------------------------
-- Contexte : 20260709_security_lints_hardening.sql a supprimé les policies
-- "Public Access" (FOR ALL) de storage.objects, retirant par effet de bord le
-- droit d'INSERT des utilisateurs → « new row violates row-level security policy »
-- sur l'upload d'avatar. 20260712_restore_storage_policies.sql a restauré
-- l'écriture pour avatars + project_gallery, mais :
--   - aucune policy SELECT n'a été recréée (lecture API bloquée) ;
--   - le bucket "messages" (upload d'images du chat, côté client) a été oublié.
--
-- Ce script est IDEMPOTENT : ré-exécutable sans risque. Il constitue le
-- correctif complet à jouer une seule fois dans le SQL Editor Supabase.
-- ============================================================

-- ── 1. Buckets : existence + lecture publique via URL (/object/public/…) ─────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('project_gallery', 'project_gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ── 2. Lecture API du bucket avatars (anon + authentifiés) ───────────────────
--     Requise par le cahier des charges : garantit l'affichage même via l'API
--     Storage (list/download), pas seulement via l'URL publique CDN.
--     Portée limitée au bucket avatars : contenu public par nature.
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

-- ── 3. Écriture avatars : réservée au dossier personnel de l'utilisateur ─────
--     Chemin client : `${auth.uid()}/<fichier>` (avatar et cover_*).
DROP POLICY IF EXISTS "avatars_owner_insert" ON storage.objects;
CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ── 4. Écriture project_gallery : idem (chemin `${auth.uid()}/…`) ────────────
DROP POLICY IF EXISTS "gallery_owner_insert" ON storage.objects;
CREATE POLICY "gallery_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project_gallery' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "gallery_owner_update" ON storage.objects;
CREATE POLICY "gallery_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'project_gallery' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'project_gallery' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "gallery_owner_delete" ON storage.objects;
CREATE POLICY "gallery_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'project_gallery' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ── 5. Bucket messages : upload d'images du chat (côté client) ───────────────
--     Chemin client : `messages/${conversation_id}/<fichier>`.
--     L'INSERT n'est autorisé qu'aux MEMBRES de la conversation ciblée
--     (vérification via conversation_participants, comme le backend).
DROP POLICY IF EXISTS "messages_member_insert" ON storage.objects;
CREATE POLICY "messages_member_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'messages'
    AND (storage.foldername(name))[1] = 'messages'
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id::text = (storage.foldername(name))[2]
        AND cp.user_id = auth.uid()
        AND cp.status = 'joined'
    )
  );

SELECT '✅ Upload d''images restauré : avatars (lecture publique + écriture propriétaire), galerie, et chat (membres).' AS status;
