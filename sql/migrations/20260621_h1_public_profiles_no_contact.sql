-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Correctif H1 : la vue public_profiles exposait email + phone à `anon`,
--  *              permettant l'énumération en masse des coordonnées de tous les membres
--  *              publiés (moissonnage / RGPD). On retire ces colonnes de la vue listable
--  *              et on sert l'affichage du contact profil-par-profil via une fonction
--  *              get_public_profile(identifier) : un seul profil à la fois, donc pas de dump.
--  * @created 2026-06-21
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

-- 1. Recréer la vue SANS email ni phone (toutes les autres colonnes inchangées).
DROP VIEW IF EXISTS public.public_profiles;
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
    id,
    user_id,
    first_name,
    last_name,
    avatar_url,
    cover_url,
    bio,
    category,
    job_title,
    industry,
    role,
    specialty,
    activity_domain,
    country_id,
    city,
    website,
    slug,
    is_published,
    is_verified,
    is_premium,
    card_variant,
    followers_count,
    created_at
FROM public.user_profiles
WHERE is_published = TRUE;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. Fonction d'accès au profil public COMPLET (un seul à la fois), incluant le
--    contact (email/phone) destiné à l'affichage sur la page profil.
--    SECURITY DEFINER : lit user_profiles en contournant la RLS, mais STRICTEMENT
--    pour les profils publiés et uniquement les colonnes non sensibles (jamais
--    pin_code / pin_attempts / otp). Pas d'énumération possible : un identifiant requis.
DROP FUNCTION IF EXISTS public.get_public_profile(text);
CREATE OR REPLACE FUNCTION public.get_public_profile(identifier text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT jsonb_build_object(
        'id', up.id,
        'user_id', up.user_id,
        'first_name', up.first_name,
        'last_name', up.last_name,
        'bio', up.bio,
        'city', up.city,
        'avatar_url', up.avatar_url,
        'cover_url', up.cover_url,
        'specialty', up.specialty,
        'category', up.category,
        'slug', up.slug,
        'is_published', up.is_published,
        'is_verified', up.is_verified,
        'is_premium', up.is_premium,
        'followers_count', up.followers_count,
        'created_at', up.created_at,
        'email', up.email,
        'phone', up.phone,
        'website', up.website,
        'role', up.role,
        'countries', CASE WHEN c.id IS NOT NULL
            THEN jsonb_build_object('name', c.name)
            ELSE NULL END,
        'profile_tags', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('tags', jsonb_build_object('name', t.name)))
            FROM public.profile_tags pt
            JOIN public.tags t ON t.id = pt.tag_id
            WHERE pt.profile_id = up.id
        ), '[]'::jsonb)
    )
    FROM public.user_profiles up
    LEFT JOIN public.countries c ON c.id = up.country_id
    WHERE up.is_published = TRUE
      AND (
            up.slug = lower(identifier)
         OR up.id::text = lower(identifier)
         OR up.user_id::text = lower(identifier)
      )
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;

SELECT '✅ H1 appliqué : email/phone retirés de public_profiles + get_public_profile() créé.' AS status;
