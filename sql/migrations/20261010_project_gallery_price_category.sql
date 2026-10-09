-- ==============================================================================
-- @author @hopsyder
-- @description Portfolio des réalisations : prix indicatif et catégorie.
--              La fiche profil affiche désormais le portfolio en premier plan,
--              avec une étiquette de prix sur la photo (« 85 000 FCFA ») et des
--              filtres par catégorie (Meubles, Portes, Chantiers…).
--              Les deux colonnes sont facultatives : une réalisation sans prix
--              s'affiche sans étiquette, sans catégorie elle reste dans « Tous ».
--              Idempotent.
-- @created 2026-10-10
-- ==============================================================================

ALTER TABLE public.project_gallery
  ADD COLUMN IF NOT EXISTS price    NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS category VARCHAR(60);

-- Un prix négatif n'a pas de sens ; 0 reste permis (geste commercial).
ALTER TABLE public.project_gallery
  DROP CONSTRAINT IF EXISTS project_gallery_price_check;
ALTER TABLE public.project_gallery
  ADD  CONSTRAINT project_gallery_price_check
       CHECK (price IS NULL OR price >= 0);

-- Filtrage par catégorie sur la fiche d'un professionnel.
CREATE INDEX IF NOT EXISTS idx_gallery_profile_category
  ON public.project_gallery (profile_id, category)
  WHERE status = 'approved';

NOTIFY pgrst, 'reload schema';

SELECT '✅ project_gallery : colonnes price et category ajoutées.' AS status;
