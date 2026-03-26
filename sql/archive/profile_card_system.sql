/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Schéma SQL pour la sauvegarde des Cartes de Profil et des Tags
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

-- ==========================================
-- 1. EXTENSION DE LA TABLE USER_PROFILES
-- ==========================================
-- On s'assure que toutes les colonnes nécessaires existent
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS role VARCHAR(100),
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS specialty VARCHAR(255),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES public.countries(id),
ADD COLUMN IF NOT EXISTS city VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- ==========================================
-- 2. SYSTÈME DE TAGS (MOTS-CLÉS)
-- ==========================================

-- Table pour stocker les tags uniques
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison entre Profils et Tags (Plusieurs-à-Plusieurs)
CREATE TABLE IF NOT EXISTS public.profile_tags (
    profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, tag_id)
);

-- RLS pour les tags (Lecture publique, Insertion par utilisateurs authentifiés)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique tags" ON public.tags;
CREATE POLICY "Lecture publique tags" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertion tags par authentifiés" ON public.tags;
CREATE POLICY "Insertion tags par authentifiés" ON public.tags FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Gestion propre tags profil" ON public.profile_tags;
CREATE POLICY "Gestion propre tags profil" ON public.profile_tags
    USING (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- ==========================================
-- 3. FONCTION DE SAUVEGARDE COMPLÈTE
-- ==========================================
-- Cette fonction permet de sauvegarder le profil et de synchroniser les tags en une seule transaction

CREATE OR REPLACE FUNCTION public.save_profile_card(
    p_user_id UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_role TEXT,
    p_category TEXT,
    p_specialty TEXT,
    p_bio TEXT,
    p_phone TEXT,
    p_website TEXT,
    p_country_id UUID,
    p_city TEXT,
    p_is_published BOOLEAN,
    p_tags TEXT[] -- Tableau de noms de tags
)
RETURNS JSON AS $$
DECLARE
    v_profile_id UUID;
    v_tag_name TEXT;
    v_tag_id UUID;
BEGIN
    -- 1. Mise à jour ou Insertion du profil
    INSERT INTO public.user_profiles (
        user_id, first_name, last_name, role, category, specialty, bio, phone, website, country_id, city, is_published, updated_at
    )
    VALUES (
        p_user_id, p_first_name, p_last_name, p_role, p_category, p_specialty, p_bio, p_phone, p_website, p_country_id, p_city, p_is_published, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        category = EXCLUDED.category,
        specialty = EXCLUDED.specialty,
        bio = EXCLUDED.bio,
        phone = EXCLUDED.phone,
        website = EXCLUDED.website,
        country_id = EXCLUDED.country_id,
        city = EXCLUDED.city,
        is_published = EXCLUDED.is_published,
        updated_at = NOW()
    RETURNING id INTO v_profile_id;

    -- 2. Nettoyage des anciens tags
    DELETE FROM public.profile_tags WHERE profile_id = v_profile_id;

    -- 3. Insertion des nouveaux tags
    IF p_tags IS NOT NULL THEN
        FOREACH v_tag_name IN ARRAY p_tags LOOP
            -- Insertion du tag s'il n'existe pas
            INSERT INTO public.tags (name)
            VALUES (LOWER(TRIM(v_tag_name)))
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name -- Dummy update to get ID
            RETURNING id INTO v_tag_id;

            -- Liaison tag -> profil
            INSERT INTO public.profile_tags (profile_id, tag_id)
            VALUES (v_profile_id, v_tag_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    RETURN json_build_object('success', true, 'profile_id', v_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
