-- =============================================================
-- Migration : Ajout de liens de projet et de photos aux réalisations
-- Objet     : Permettre l'ajout de liens externes (drive, site web)
--             pour chaque élément de la galerie de projets.
-- Sûreté    : Idempotente
-- =============================================================

BEGIN;

ALTER TABLE public.project_gallery
  ADD COLUMN IF NOT EXISTS project_url TEXT,
  ADD COLUMN IF NOT EXISTS drive_url TEXT;

COMMIT;
