-- ==============================================================================
-- @author @hopsyder
-- @description Stories 24 h — « Chantiers du jour ».
--
--   Un professionnel publie une photo de son travail du jour. Elle reste
--   visible 24 heures, puis disparaît d'elle-même. C'est la preuve vivante
--   qu'un artisan est actif, là où le catalogue montre un travail passé.
--
--   Expiration : portée par la colonne `expires_at` et appliquée par les
--   politiques RLS. Aucune tâche planifiée n'est nécessaire — une story
--   périmée cesse simplement d'être lisible. Le ménage des lignes et des
--   fichiers se fait séparément (voir la note en fin de fichier).
--
--   Vues : table `story_views`, une ligne par (story, spectateur). Seul
--   l'auteur de la story lit ses vues ; un spectateur ne voit pas qui d'autre
--   a regardé.
--
--   Idempotent.
-- @created 2026-10-11
-- ==============================================================================

-- ─── 1. Table des stories ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_stories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id)         ON DELETE CASCADE,
    profile_id  UUID          REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    caption     VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

-- Lecture du fil : les stories encore valides, les plus récentes d'abord.
CREATE INDEX IF NOT EXISTS idx_stories_active
  ON public.profile_stories (expires_at DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_user
  ON public.profile_stories (user_id, created_at DESC);

-- ─── 2. Vues des stories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.story_views (
    story_id   UUID NOT NULL REFERENCES public.profile_stories(id) ON DELETE CASCADE,
    viewer_id  UUID NOT NULL REFERENCES auth.users(id)             ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (story_id, viewer_id)
);

-- ─── 3. RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.profile_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views     ENABLE ROW LEVEL SECURITY;

-- Lecture publique : stories non expirées de profils publiés et non suspendus.
DROP POLICY IF EXISTS "Stories actives : lecture publique" ON public.profile_stories;
CREATE POLICY "Stories actives : lecture publique" ON public.profile_stories
  FOR SELECT
  USING (
    expires_at > NOW()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = profile_stories.profile_id
        AND up.is_published = TRUE
        AND COALESCE(up.is_suspended, FALSE) = FALSE
    )
  );

-- L'auteur voit et gère les siennes, y compris expirées (pour les supprimer).
DROP POLICY IF EXISTS "Stories : accès total à l'auteur" ON public.profile_stories;
CREATE POLICY "Stories : accès total à l'auteur" ON public.profile_stories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Un spectateur connecté enregistre SA propre vue, sur une story qu'il peut lire.
DROP POLICY IF EXISTS "Vues : le spectateur enregistre la sienne" ON public.story_views;
CREATE POLICY "Vues : le spectateur enregistre la sienne" ON public.story_views
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = viewer_id
    AND EXISTS (
      SELECT 1 FROM public.profile_stories s
      WHERE s.id = story_views.story_id AND s.expires_at > NOW()
    )
  );

-- Seul l'auteur de la story lit ses vues.
DROP POLICY IF EXISTS "Vues : lecture par l'auteur de la story" ON public.story_views;
CREATE POLICY "Vues : lecture par l'auteur de la story" ON public.story_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_stories s
      WHERE s.id = story_views.story_id AND s.user_id = auth.uid()
    )
  );

GRANT SELECT               ON public.profile_stories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_stories TO authenticated;
GRANT SELECT, INSERT       ON public.story_views       TO authenticated;

-- ─── 4. Bucket de stockage ─────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Chemin imposé : `${auth.uid}/…` — on n'écrit que dans son propre dossier.
DROP POLICY IF EXISTS "stories_owner_insert" ON storage.objects;
CREATE POLICY "stories_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'stories' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "stories_owner_delete" ON storage.objects;
CREATE POLICY "stories_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'stories' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "stories_public_read" ON storage.objects;
CREATE POLICY "stories_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'stories');

-- ─── 5. Ménage des stories périmées ────────────────────────────────────────
--  Expirées, elles ne sont plus lisibles : la purge ne change rien pour
--  l'utilisateur, elle libère le stockage. À appeler depuis une tâche
--  planifiée (pg_cron) ou manuellement. Les fichiers du bucket se retirent
--  séparément, le SQL ne pouvant pas supprimer un objet de stockage.
CREATE OR REPLACE FUNCTION public.purge_expired_stories(older_than INTERVAL DEFAULT INTERVAL '7 days')
RETURNS TABLE (deleted_count BIGINT, image_urls TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  urls TEXT[];
  n BIGINT;
BEGIN
  WITH gone AS (
    DELETE FROM public.profile_stories
    WHERE expires_at < NOW() - older_than
    RETURNING image_url
  )
  SELECT COUNT(*), COALESCE(array_agg(image_url), '{}') INTO n, urls FROM gone;
  RETURN QUERY SELECT n, urls;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_stories(INTERVAL) FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';

SELECT '✅ Stories 24 h : profile_stories, story_views, bucket stories et purge créés.' AS status;
