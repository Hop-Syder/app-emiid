-- =============================================================
-- Migration : user_blocks (blocage de profils)
-- Objet     : Permettre a un utilisateur de bloquer un profil.
--             Sert de base au masquage et a la moderation.
-- Surete    : idempotente
-- =============================================================

BEGIN;

-- 1) Table -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Empecher le blocage de soi-meme
ALTER TABLE public.user_blocks
  DROP CONSTRAINT IF EXISTS user_blocks_no_self;
ALTER TABLE public.user_blocks
  ADD  CONSTRAINT user_blocks_no_self
       CHECK (blocker_id <> blocked_id);

-- Anti-doublon : un seul blocage par couple (bloqueur, bloque)
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_blocks_pair
  ON public.user_blocks (blocker_id, blocked_id);

-- Index de lecture par bloqueur
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker
  ON public.user_blocks (blocker_id, created_at DESC);

-- 2) RLS -------------------------------------------------------
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Lecture : un utilisateur voit uniquement ses propres blocages
DROP POLICY IF EXISTS "user_blocks_owner_select" ON public.user_blocks;
CREATE POLICY "user_blocks_owner_select"
  ON public.user_blocks
  FOR SELECT
  USING (auth.uid() = blocker_id);

-- Insertion : seulement en tant que bloqueur = self
DROP POLICY IF EXISTS "user_blocks_owner_insert" ON public.user_blocks;
CREATE POLICY "user_blocks_owner_insert"
  ON public.user_blocks
  FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Suppression (deblocage) : seulement ses propres blocages
DROP POLICY IF EXISTS "user_blocks_owner_delete" ON public.user_blocks;
CREATE POLICY "user_blocks_owner_delete"
  ON public.user_blocks
  FOR DELETE
  USING (auth.uid() = blocker_id);

-- 3) Permissions -----------------------------------------------
GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;
GRANT ALL                    ON public.user_blocks TO service_role;

COMMIT;

-- =============================================================
-- Verif rapide :
-- SELECT blocker_id, COUNT(*) FROM public.user_blocks GROUP BY 1;
-- =============================================================
