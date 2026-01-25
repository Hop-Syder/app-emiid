-- ==============================================================================
-- SCRIPT DE DEDUPLICATION & SECURISATION DES PROFILS UTILSATEURS
-- ==============================================================================
-- Objectif : Garantir qu'un utilisateur (user_id) ne possède qu'une seule ligne dans user_profiles.
-- Comportement : Conserve le profil le plus récemment mis à jour, supprime les autres, et empêche les doublons futurs.

BEGIN; -- Début de la transaction pour sécurité

-- 1. NETTOYAGE DES DOUBLONS (Garde le plus récent)
-- On utilise une CTE pour identifier les doublons
WITH Duplicates AS (
    SELECT 
        id,
        user_id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id 
            ORDER BY updated_at DESC, created_at DESC
        ) as rank
    FROM public.user_profiles
)
DELETE FROM public.user_profiles
WHERE id IN (
    SELECT id FROM Duplicates WHERE rank > 1
);

-- 2. AJOUT DE LA CONTRAINTE D'UNICITÉ
-- Cela empêchera physiquement la création de doublons à l'avenir (erreur SQL immédiate)
-- Note: Si la contrainte existe déjà, cette commande échouera proprement ou peut être ignorée.
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_user_id_key'
    ) THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

COMMIT; -- Validation des changements

-- 3. VERIFICATION
SELECT 
    COUNT(*) as total_profiles, 
    COUNT(DISTINCT user_id) as unique_users 
FROM public.user_profiles;
-- Si total_profiles == unique_users, l'opération est un succès parfait.
