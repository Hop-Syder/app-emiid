-- ==========================================
-- SCRIPT DE MIGRATION : SETUP NOTIFICATIONS (REALTIME + TRIGGERS)
-- ==========================================

-- 1. ACTIVER LE REALTIME SUR LA TABLE NOTIFICATIONS
-- Cela permet au frontend d'écouter les insertions et mises à jour en direct via supabase.channel
BEGIN;
  -- Essayer d'ajouter la table à la publication realtime
  -- (Si ça échoue car elle y est déjà, ce n'est pas grave)
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
COMMIT;

-- 2. TRIGGER POUR LES NOUVEAUX FOLLOWS
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
    follower_name TEXT;
BEGIN
    -- Récupérer le nom de la personne qui commence à suivre
    SELECT first_name || ' ' || last_name INTO follower_name
    FROM public.user_profiles
    WHERE user_id = NEW.follower_id;

    -- Ne pas créer de notification si on se suit soi-même (au cas où)
    IF NEW.follower_id != NEW.following_id THEN
        INSERT INTO public.notifications (user_id, type, title, content, link)
        VALUES (
            NEW.following_id, 
            'follow', 
            'Nouveau follower', 
            COALESCE(follower_name, 'Un utilisateur') || ' a commencé à vous suivre.', 
            '/annuaire/' || NEW.follower_id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_follower ON public.user_follows;
CREATE TRIGGER trg_notify_new_follower
AFTER INSERT ON public.user_follows
FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();


-- 3. TRIGGER POUR LES NOUVEAUX MESSAGES
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Récupérer le nom de l'expéditeur
    SELECT first_name || ' ' || last_name INTO sender_name
    FROM public.user_profiles
    WHERE user_id = NEW.sender_id;

    -- Créer l'alerte pour le destinataire
    INSERT INTO public.notifications (user_id, type, title, content, link)
    VALUES (
        NEW.receiver_id, 
        'message', 
        'Nouveau message', 
        COALESCE(sender_name, 'Quelqu''un') || ' vous a envoyé un message.', 
        '/hub/messages/' || NEW.conversation_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();


-- 4. TRIGGER POUR LES VISITES DE PROFIL
CREATE OR REPLACE FUNCTION public.notify_profile_view()
RETURNS TRIGGER AS $$
DECLARE
    viewer_name TEXT;
BEGIN
    -- Obtenir le nom du visiteur si celui-ci est authentifié
    IF NEW.viewer_id IS NOT NULL THEN
        SELECT first_name || ' ' || last_name INTO viewer_name
        FROM public.user_profiles
        WHERE user_id = NEW.viewer_id;
    END IF;

    -- Ne pas notifier si on visite son propre profil
    IF NEW.viewer_id IS NULL OR NEW.viewer_id != NEW.viewed_id THEN
        INSERT INTO public.notifications (user_id, type, title, content)
        VALUES (
            NEW.viewed_id, 
            'view', 
            'Nouvelle visite de profil', 
            COALESCE(viewer_name, 'Un visiteur anonyme') || ' a consulté votre profil.'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_profile_view ON public.profile_views;
CREATE TRIGGER trg_notify_profile_view
AFTER INSERT ON public.profile_views
FOR EACH ROW EXECUTE FUNCTION public.notify_profile_view();
