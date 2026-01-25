-- Ajout de la politique d'INSERT manquante pour les profils utilisateurs
-- Cela permet aux utilisateurs authentifiés de créer leur ligne dans user_profiles si elle n'existe pas encore
-- (utile si le trigger automatique échoue ou pour les méthodes upsert)

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User Can Insert Own Profile" ON public.user_profiles;

CREATE POLICY "User Can Insert Own Profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Vérification des permissions sur la séquence (si applicable, bien que UUID ici)
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
