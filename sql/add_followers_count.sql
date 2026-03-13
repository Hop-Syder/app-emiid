-- Ajout de la colonne followers_count si elle n'existe pas
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0;

-- Fonction pour incrémenter le nombre d'abonnés
CREATE OR REPLACE FUNCTION increment_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_profiles
    SET followers_count = followers_count + 1
    WHERE user_id = NEW.following_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour décrémenter le nombre d'abonnés
CREATE OR REPLACE FUNCTION decrement_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_profiles
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE user_id = OLD.following_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour incrémenter lors d'un nouveau suivi
DROP TRIGGER IF EXISTS increment_followers_on_follow ON public.user_follows;
CREATE TRIGGER increment_followers_on_follow
AFTER INSERT ON public.user_follows
FOR EACH ROW
EXECUTE FUNCTION increment_followers_count();

-- Trigger pour décrémenter lors d'un désabonnement
DROP TRIGGER IF EXISTS decrement_followers_on_unfollow ON public.user_follows;
CREATE TRIGGER decrement_followers_on_unfollow
AFTER DELETE ON public.user_follows
FOR EACH ROW
EXECUTE FUNCTION decrement_followers_count();
