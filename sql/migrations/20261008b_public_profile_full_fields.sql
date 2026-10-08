-- ==============================================================================
-- @author @hopsyder
-- @description Profil public : expose enfin les champs saisis dans /parametres
--              qui n'étaient jamais affichés — slogan, années d'expérience,
--              réseaux sociaux (Facebook, Instagram, TikTok, LinkedIn), badge
--              téléphone certifié, et contacts secondaires (téléphone et email
--              commerciaux).
--
--              Les contacts secondaires suivent exactement la règle du contact
--              principal : opt-in `show_contact` ET visiteur connecté (anti-
--              aspiration, cf. 20260829_gate_contact_by_auth). `has_contact`
--              en tient compte pour afficher l'invitation à se connecter.
--
--              Reprend à l'identique 20260907b_profile_experiences.sql pour le
--              reste. CREATE OR REPLACE conserve les GRANT existants. Idempotent.
-- @created 2026-10-08
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_public_profile(identifier text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT jsonb_build_object(
        'id', up.id,
        'user_id', up.user_id,
        'first_name', up.first_name,
        'last_name', up.last_name,
        'business_name', up.business_name,
        'bio', up.bio,
        'slogan', up.slogan,
        'years_experience', up.years_experience,
        'district', up.district,
        'city', up.city,
        'avatar_url', up.avatar_url,
        'cover_url', up.cover_url,
        'specialty', up.specialty,
        'category', up.category,
        'slug', up.slug,
        'is_published', up.is_published,
        'is_verified', up.is_verified,
        'is_premium', up.is_premium,
        'phone_verified', COALESCE(up.phone_verified, FALSE),
        'followers_count', up.followers_count,
        'created_at', up.created_at,
        'email', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN up.email ELSE NULL END,
        'phone', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN up.phone ELSE NULL END,
        'secondary_phone', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN NULLIF(up.secondary_phone, '') ELSE NULL END,
        'public_email', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN NULLIF(up.public_email, '') ELSE NULL END,
        'has_contact', up.show_contact AND (
            up.email IS NOT NULL OR up.phone IS NOT NULL
            OR NULLIF(up.secondary_phone, '') IS NOT NULL OR NULLIF(up.public_email, '') IS NOT NULL
        ),
        'website', up.website,
        'facebook_url', NULLIF(up.facebook_url, ''),
        'instagram_url', NULLIF(up.instagram_url, ''),
        'tiktok_url', NULLIF(up.tiktok_url, ''),
        'linkedin_url', NULLIF(up.linkedin_url, ''),
        'role', up.role,
        'services', COALESCE(up.services, '[]'::jsonb),
        'opening_hours', COALESCE(up.opening_hours, '[]'::jsonb),
        'experiences', COALESCE(up.experiences, '[]'::jsonb),
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
      AND COALESCE(up.is_suspended, FALSE) = FALSE
      AND (
            up.slug = lower(identifier)
         OR up.id::text = lower(identifier)
         OR up.user_id::text = lower(identifier)
      )
    LIMIT 1;
$function$;
