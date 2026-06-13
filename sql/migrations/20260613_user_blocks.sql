-- =============================================================
-- Migration : user_blocks (blocage d'utilisateurs)
-- Objet     : Permettre à un utilisateur de bloquer un profil.
--             Sert de base au masquage et à la modération.
-- Sûreté    : idempotente
-- =============================================================

BEGIN;

-- 1) Table -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- On ne peut pas se bloquer soi-même
ALTER TABLE public.user_blocks
  DROP CONSTRAINT IF EXISTS user_blocks_no_self;
ALTER TABLE public.user_blocks
  ADD  CONSTRAINT user_blocks_no_self
       CHECK (blocker_id <> blocked_id);

-- Anti-doublon : un seul blocage actif par couple (bloqueur, bloqué)
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_blocks_pair
  ON public.user_blocks (blocker_id, blocked_id);

-- Index de lecture par bloqueur
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker
  ON public.user_blocks (blocker_id, created_at DESC);

-- 2) RLS -------------------------------------------------------
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Un utilisateur ne voit que ses propres blocages
DROP POLICY IF EXISTS "user_blocks_owner_select" ON public.user_blocks;
CREATE POLICY "user_blocks_owner_select"
  ON public.user_blocks
  FOR SELECT
  USING (auth.uid() = blocker_id);

-- Un utilisateur ne peut créer un blocage qu'en tant que bloqueur = self
DROP POLICY IF EXISTS "user_blocks_owner_insert" ON public.user_blocks;
CREATE POLICY "user_blocks_owner_insert"
  ON public.user_blocks
  FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Un utilisateur peut retirer (débloquer) ses propres blocages
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
-- Vérif rapide :
-- SELECT blocker_id, COUNT(*) FROM public.user_blocks GROUP BY 1;
-- =============================================================
