-- Corrige les liens de notifications et resserre les policies RLS.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
    follower_name TEXT;
    follower_slug TEXT;
BEGIN
    SELECT
        NULLIF(TRIM(first_name || ' ' || last_name), ''),
        slug
    INTO follower_name, follower_slug
    FROM public.user_profiles
    WHERE user_id = NEW.follower_id;

    IF NEW.follower_id != NEW.following_id THEN
        INSERT INTO public.notifications (user_id, type, title, content, link)
        VALUES (
            NEW.following_id,
            'follow',
            'Nouveau follower',
            COALESCE(follower_name, 'Un utilisateur') || ' a commencé à vous suivre.',
            '/profil/' || COALESCE(follower_slug, NEW.follower_id::text)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_notify_new_follower ON public.user_follows;
CREATE TRIGGER trg_notify_new_follower
AFTER INSERT ON public.user_follows
FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    recipient_id UUID;
BEGIN
    SELECT NULLIF(TRIM(first_name || ' ' || last_name), '')
    INTO sender_name
    FROM public.user_profiles
    WHERE user_id = NEW.sender_id;

    SELECT
        CASE
            WHEN participant1_id = NEW.sender_id THEN participant2_id
            ELSE participant1_id
        END
    INTO recipient_id
    FROM public.conversations
    WHERE id = NEW.conversation_id
      AND NEW.sender_id IN (participant1_id, participant2_id);

    IF recipient_id IS NOT NULL AND recipient_id != NEW.sender_id THEN
        INSERT INTO public.notifications (user_id, type, title, content, link)
        VALUES (
            recipient_id,
            'message',
            'Nouveau message',
            COALESCE(sender_name, 'Quelqu''un') || ' vous a envoyé un message.',
            '/messages?contact=' || NEW.sender_id::text
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

DROP POLICY IF EXISTS "Notifications Access" ON public.notifications;
DROP POLICY IF EXISTS "Notifications select own" ON public.notifications;
DROP POLICY IF EXISTS "Notifications update own" ON public.notifications;
DROP POLICY IF EXISTS "Notifications delete own" ON public.notifications;

CREATE POLICY "Notifications select own"
ON public.notifications
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Notifications update own"
ON public.notifications
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Notifications delete own"
ON public.notifications
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON public.notifications FROM anon;
REVOKE INSERT ON public.notifications FROM authenticated;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
