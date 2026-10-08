-- ==============================================================================
-- @author @hopsyder
-- @description Nettoyage : l'image par défaut « /profil/avatar.jpg » était
--              enregistrée en base comme si c'était l'avatar de l'utilisateur
--              (page Paramètres et assistant de création de profil).
--              L'interface affiche déjà cette image quand avatar_url est vide :
--              on remet donc ces lignes à NULL. Idempotent.
-- @created 2026-10-08
-- ==============================================================================

UPDATE public.user_profiles
SET avatar_url = NULL
WHERE avatar_url = '/profil/avatar.jpg';
