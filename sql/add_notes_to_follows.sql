/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Ajout de la colonne notes aux suivis
 * @created 2026-03-13
*/

ALTER TABLE public.user_follows ADD COLUMN IF NOT EXISTS notes TEXT;
