-- Ajout des colonnes pour la certification (Verifié) et l'abonnement (Premium)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Vous pouvez également vouloir ajouter ces colonnes aux éventuelles vues sécurisées ou fonctions si nécessaire.
