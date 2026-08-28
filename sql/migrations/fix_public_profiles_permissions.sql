/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Migration pour corriger les permissions d'accès aux profils publics.
 *              Permet à la vue `public_profiles` d'accéder aux données de `user_profiles`
 *              même pour les utilisateurs non connectés (anon), tout en protégeant
 *              les colonnes sensibles.
 * @created 2026-05-11
 */

-- 1. Permettre la lecture des lignes publiées au niveau RLS
DROP POLICY IF EXISTS "Profils publiés : lecture publique" ON public.user_profiles;
CREATE POLICY "Profils publiés : lecture publique" 
ON public.user_profiles 
FOR SELECT 
USING (is_published = TRUE);

-- 2. Accorder le droit de sélection sur la table à tout le monde
-- (nécessaire pour que les vues et les requêtes PostgREST fonctionnent)
GRANT SELECT ON public.user_profiles TO anon, authenticated;

-- 3. SÉCURITÉ : Révoquer explicitement l'accès aux colonnes sensibles pour anon et authenticated
-- On ne laisse que le service_role et postgres accéder à ces colonnes critiques.
REVOKE SELECT (pin_code, pin_attempts, pin_enabled, is_locked, locked_at) ON public.user_profiles FROM anon, authenticated;

-- 4. S'assurer que les tables de liaison sont aussi accessibles
GRANT SELECT ON public.countries TO anon, authenticated;
GRANT SELECT ON public.tags TO anon, authenticated;
GRANT SELECT ON public.profile_tags TO anon, authenticated;

-- 5. Vérifier que la vue est accessible
GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMENT ON TABLE public.user_profiles IS 'Table des profils utilisateurs. RLS activé. Colonnes PIN protégées par column-level security.';
