-- ════════════════════════════════════════════════════════════════════════════
--  FIX — notify_profile_view() référençait NEW.viewed_id, mais la colonne de
--  public.profile_views s'appelle profile_id. Résultat : tout INSERT dans
--  profile_views échouait → aucune vue enregistrée → stats d'impact figées à 0.
--  On recrée la fonction avec le bon nom de colonne (+ search_path durci).
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.notify_profile_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    viewer_name TEXT;
BEGIN
    -- Nom du visiteur s'il est authentifié
    IF NEW.viewer_id IS NOT NULL THEN
        SELECT first_name || ' ' || last_name INTO viewer_name
        FROM public.user_profiles
        WHERE user_id = NEW.viewer_id;
    END IF;

    -- Ne pas notifier l'auto-visite (colonne correcte : profile_id)
    IF NEW.viewer_id IS NULL OR NEW.viewer_id <> NEW.profile_id THEN
        INSERT INTO public.notifications (user_id, type, title, content)
        VALUES (
            NEW.profile_id,
            'view',
            'Nouvelle visite de profil',
            COALESCE(viewer_name, 'Un visiteur anonyme') || ' a consulté votre profil.'
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Le trigger existe déjà (AFTER INSERT) ; CREATE OR REPLACE de la fonction suffit.

SELECT '✅ notify_profile_view corrigé (viewed_id → profile_id) : le tracking de vues fonctionne.' AS status;
