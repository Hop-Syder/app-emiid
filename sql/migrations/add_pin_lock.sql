/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Migration pour ajouter le système de verrouillage après 3 essais PIN
 * @created 2026-04-26
 */

-- Ajout des colonnes pour gérer le verrouillage
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- Mettre à jour les éventuels utilisateurs ayant déjà trop de tentatives
UPDATE public.user_profiles 
SET is_locked = TRUE, locked_at = NOW() 
WHERE pin_attempts >= 3 AND is_locked = FALSE;
