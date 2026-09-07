-- ==========================================
-- Parcours & Expériences professionnelles
-- ==========================================
-- Corrige le fait que l'onglet public "Parcours & Expériences" affichait
-- toujours "Parcours non renseigné" (frontend-user/hooks/use-profile-data.ts
-- fixait experiences: [] en dur — aucune donnée n'existait nulle part).
--
-- Même pattern que services/opening_hours (migration 20260819) : colonne
-- JSONB sur user_profiles, éditée d'un bloc via PUT /api/users/me existant,
-- pas de modération ni de fichiers joints → pas besoin d'une table dédiée.
--
-- Forme d'un élément : { id, title, company, startDate ("YYYY-MM"),
-- endDate ("YYYY-MM"|null), current, description? }.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.user_profiles.experiences IS
  'Parcours professionnel : tableau de { id, title, company, startDate ("YYYY-MM"), endDate ("YYYY-MM"|null), current, description? }. Éditée en une fois via PUT /api/users/me, comme services/opening_hours.';

-- Exposer experiences dans la RPC publique (chemin de lecture pour tout
-- visiteur anonyme/tiers). Copie exacte du corps de la migration
-- 20260906_reviews_and_private_notes.sql, avec une clé ajoutée après
-- opening_hours — rien d'autre ne change.
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
        'email', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN up.email ELSE NULL END,
        'phone', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN up.phone ELSE NULL END,
        'has_contact', up.show_contact AND (up.email IS NOT NULL OR up.phone IS NOT NULL),
        'website', up.website,
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
