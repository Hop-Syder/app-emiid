-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Update get_public_profile RPC function to include business_name and district
--  * @created 2026-08-28
--  * 🌐 ceo.nexuspartners.xyz
--  */
-- ──────────────────────────────────

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
        'business_name', up.business_name,
        'bio', up.bio,
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
        'followers_count', up.followers_count,
        'created_at', up.created_at,
        -- Contact renvoyé UNIQUEMENT si l'utilisateur l'a laissé visible (R7).
        'email', CASE WHEN up.show_contact THEN up.email ELSE NULL END,
        'phone', CASE WHEN up.show_contact THEN up.phone ELSE NULL END,
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
      AND COALESCE(up.is_suspended, FALSE) = FALSE
      AND (
            up.slug = lower(identifier)
         OR up.id::text = lower(identifier)
         OR up.user_id::text = lower(identifier)
      )
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;

SELECT '✅ get_public_profile mis à jour avec business_name et district.' AS status;
