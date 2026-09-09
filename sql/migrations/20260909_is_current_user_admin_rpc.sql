-- ==========================================
-- Unification de l'autorisation admin sur is_admin
-- ==========================================
-- Contexte : trois mécanismes différents décidaient "qui est admin" dans le
-- repo — is_admin (backend + bouton Accorder/Révoquer dans le cockpit),
-- app_metadata/ADMIN_EMAILS (verrou réel des server actions du cockpit,
-- frontend-admin/lib/supabase/server.ts), et user_profiles.role en texte
-- libre (frontend-admin/components/auth/admin-login-form.tsx, pour la seule
-- redirection post-login). Résultat : accorder "Admin" via le cockpit ne
-- donnait aucun accès réel au cockpit lui-même.
--
-- Décision : is_admin devient la seule source de vérité, partout.
--
-- Problème : is_admin est délibérément REVOKE pour authenticated
-- (20260830_fix_user_profiles_exposure.sql) — un utilisateur connecté ne
-- peut pas lire cette colonne en direct, même la sienne. Cette RPC
-- SECURITY DEFINER ne révèle que le statut admin de l'appelant (auth.uid()),
-- jamais celui d'un tiers — elle ne réintroduit donc pas la fuite que le
-- REVOKE visait à corriger.

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT is_admin FROM public.user_profiles WHERE user_id = auth.uid()),
    false
  );
$function$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
