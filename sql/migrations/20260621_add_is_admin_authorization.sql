-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Sépare le rôle MÉTIER (user_profiles.role) du rôle d'AUTORISATION admin.
--  *              Corrige une escalade de privilèges : jusqu'ici n'importe quel utilisateur
--  *              pouvait définir son métier sur "admin" via PUT /api/users/me et passait
--  *              le contrôle requireAdmin (qui faisait role ILIKE '%admin%').
--  * @created 2026-06-21
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

-- 1. Colonne d'autorisation dédiée, NON modifiable via le self-service profil.
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Reprise (grandfathering) des admins existants identifiés par l'ancien mécanisme.
--    ⚠️ À AUDITER MANUELLEMENT : vérifier que cette liste ne contient que de vrais admins.
--    Lancer d'abord le SELECT pour inspecter, puis l'UPDATE.
--    SELECT user_id, email, role FROM public.user_profiles WHERE role ILIKE '%admin%';
UPDATE public.user_profiles
SET is_admin = TRUE
WHERE role ILIKE '%admin%'
  AND NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE is_admin = TRUE);

-- 3. (Optionnel) Index partiel pour accélérer les vérifications de droits admin.
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin
    ON public.user_profiles (user_id)
    WHERE is_admin = TRUE;

SELECT '✅ Colonne is_admin ajoutée et admins existants repris. Vérifier la liste ci-dessus.' AS status;
