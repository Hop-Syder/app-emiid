-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Recherche de proximité avec formule de Haversine
--  * @created 2026-08-28
--  * 🌐 ceo.nexuspartners.xyz
--  */
-- ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.search_profiles_by_proximity(
    p_lat numeric,
    p_lng numeric,
    p_radius_km numeric DEFAULT 50
)
RETURNS TABLE (
    profile_id uuid,
    distance_km numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    -- Formule de Haversine
    -- Rayon de la Terre : ~6371 km
    SELECT profile_id, distance_km
    FROM (
        SELECT
            id as profile_id,
            (
                6371 * acos(
                    cos(radians(p_lat))
                    * cos(radians(latitude))
                    * cos(radians(longitude) - radians(p_lng))
                    + sin(radians(p_lat))
                    * sin(radians(latitude))
                )
            )::numeric AS distance_km
        FROM public.user_profiles
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND is_published = TRUE
          AND COALESCE(is_suspended, FALSE) = FALSE
    ) d
    WHERE d.distance_km <= p_radius_km
    ORDER BY distance_km ASC;
$$;

GRANT EXECUTE ON FUNCTION public.search_profiles_by_proximity(numeric, numeric, numeric) TO anon, authenticated;
