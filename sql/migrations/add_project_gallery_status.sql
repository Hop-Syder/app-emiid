-- =============================================================
-- Migration : project_gallery moderation status
-- Objet     : Permettre la modération (pending/approved/rejected)
--             des éléments de galerie projet par l'admin.
-- Sûreté    : idempotente (IF NOT EXISTS / DROP IF EXISTS)
-- =============================================================

BEGIN;

-- 1) Colonnes de modération ------------------------------------
ALTER TABLE public.project_gallery
  ADD COLUMN IF NOT EXISTS status             TEXT        NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason   TEXT;

-- Contrainte CHECK (drop-then-create pour idempotence)
ALTER TABLE public.project_gallery
  DROP CONSTRAINT IF EXISTS project_gallery_status_check;
ALTER TABLE public.project_gallery
  ADD  CONSTRAINT project_gallery_status_check
       CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2) Rétrocompat : les items déjà publiés sont marqués approved
UPDATE public.project_gallery
SET    status = 'approved',
       reviewed_at = COALESCE(reviewed_at, NOW())
WHERE  status = 'pending'
  AND  created_at < NOW() - INTERVAL '1 minute';

-- 3) Index pour la file de modération
CREATE INDEX IF NOT EXISTS idx_gallery_status
  ON public.project_gallery(status);
CREATE INDEX IF NOT EXISTS idx_gallery_status_created
  ON public.project_gallery(status, created_at DESC);

-- 4) RLS : le public ne voit QUE les items approuvés
DROP POLICY IF EXISTS "Gallery Read Published"  ON public.project_gallery;
DROP POLICY IF EXISTS "Gallery Read Approved"   ON public.project_gallery;
CREATE POLICY "Gallery Read Approved"
  ON public.project_gallery
  FOR SELECT
  USING (
    status = 'approved'
    AND profile_id IN (SELECT id FROM public.user_profiles WHERE is_published = TRUE)
  );

-- 5) Le propriétaire garde accès total à ses items (tous status)
--    (policy "Gallery Owner Write" reste inchangée — laisse l'écriture au user_id)
-- NB : le service_role (admin) bypasse la RLS par défaut.

COMMIT;

-- =============================================================
-- Vérification rapide (à lancer séparément) :
-- SELECT status, COUNT(*) FROM public.project_gallery GROUP BY status;
-- =============================================================
