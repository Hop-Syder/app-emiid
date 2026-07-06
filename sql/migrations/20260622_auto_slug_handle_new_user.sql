-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description R4 — Slug par défaut à la création du compte.
--  *              handle_new_user génère un slug SEO-friendly (`prenom-xxxxxxxx`) dès
--  *              l'inscription, pour éviter les URLs de profil en UUID et les profils
--  *              sans identifiant lisible. Backfill des profils existants sans slug.
--  * @created 2026-06-22
--  * 🌐 ceo.nexuspartners.xyz
--  */
-- ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_first text;
    v_base  text;
    v_slug  text;
BEGIN
    v_first := COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
        'membre'
    );

    -- Slugify basique : minuscules, tout caractère non alphanumérique → tiret.
    v_base := trim(both '-' from lower(regexp_replace(v_first, '[^a-zA-Z0-9]+', '-', 'g')));
    IF v_base IS NULL OR v_base = '' THEN
        v_base := 'membre';
    END IF;

    -- Suffixe déterministe issu de l'UUID → unicité de fait (pas d'échec de trigger).
    v_slug := v_base || '-' || substr(md5(NEW.id::text), 1, 8);

    INSERT INTO public.user_profiles (user_id, first_name, last_name, email, avatar_url, role, slug)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        '',
        v_slug
    ) ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Backfill : donner un slug aux profils existants qui n'en ont pas.
UPDATE public.user_profiles up
SET slug = COALESCE(
        NULLIF(trim(both '-' from lower(regexp_replace(up.first_name, '[^a-zA-Z0-9]+', '-', 'g'))), ''),
        'membre'
    ) || '-' || substr(md5(up.user_id::text), 1, 8)
WHERE up.slug IS NULL OR up.slug = '';

SELECT '✅ R4 : slug auto activé dans handle_new_user + backfill effectué.' AS status;
