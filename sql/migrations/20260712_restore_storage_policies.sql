-- ============================================================
-- Restauration des politiques de stockage (avatars + project_gallery)
-- ------------------------------------------------------------
-- Contexte : la migration 20260709_security_lints_hardening.sql a supprimé les
-- policies "Public Access" du dashboard (qui étaient FOR ALL), retirant par effet
-- de bord le droit d'INSERT → upload bloqué :
--   « new row violates row-level security policy »
--
-- Correctif :
--   1. Buckets marqués public=true  → l'AFFICHAGE fonctionne via getPublicUrl (CDN,
--      sans policy SELECT → on ne réintroduit PAS l'énumération fermée par le durcissement).
--   2. Policies INSERT/UPDATE/DELETE scopées au dossier de l'utilisateur
--      (storage.foldername(name)[1] = auth.uid()) → chaque compte ne gère que ses fichiers.
--
-- Chemins vérifiés dans le code :
--   avatars         : `${auth.uid}/fichier`  (avatar + cover_…)
--   project_gallery : `${auth.uid}/timestamp.ext`
-- ============================================================

-- ── 1. Buckets publics (lecture via URL publique) ───────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('project_gallery', 'project_gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ── 2. Bucket "avatars" : écriture réservée au propriétaire du dossier ───────
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

-- ── 3. Bucket "project_gallery" : idem ──────────────────────────────────────
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

-- ── 4. (OPTIONNEL) Lecture via l'API Storage pour les connectés ─────────────
--     NON activé par défaut : les buckets sont publics (affichage OK) et on évite
--     de rouvrir l'énumération. Décommenter UNIQUEMENT si un accès API SELECT
--     (ex. .list()) devient nécessaire.
-- CREATE POLICY "avatars_auth_read" ON storage.objects
--   FOR SELECT TO authenticated USING (bucket_id = 'avatars');
-- CREATE POLICY "gallery_auth_read" ON storage.objects
--   FOR SELECT TO authenticated USING (bucket_id = 'project_gallery');

SELECT '✅ Policies storage restaurées (avatars + project_gallery : public + insert/update/delete par propriétaire).' AS status;
