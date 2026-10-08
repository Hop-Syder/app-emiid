-- ==============================================================================
-- @author @hopsyder
-- @description Accueil mobile « Talents actifs » : chaque ligne affiche
--              « Jean K. · Menuisier · Akpakpa — Dès 15 000 FCFA ». La vue
--              public_profiles n'exposait ni le quartier (district) ni aucun
--              prix : on ajoute les deux.
--
--              starting_price = plus petit prix strictement positif du
--              catalogue `services` (JSONB [{title, price, description}]),
--              NULL si aucune prestation n'a de prix.
--
--              CREATE OR REPLACE VIEW n'autorise ni suppression ni
--              réordonnancement : les colonnes existantes sont reprises à
--              l'identique (20260904) et les nouvelles ajoutées EN FIN.
--              Idempotent.
-- @created 2026-10-09
-- ==============================================================================

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false)
AS
SELECT
    id, user_id, first_name, last_name, avatar_url, cover_url, bio, category, job_title,
    industry, role, specialty, activity_domain, country_id, city, website, slug,
    is_published, is_verified, is_premium, card_variant, followers_count, created_at,
    latitude, longitude, is_nomad, updated_at,
    commune_id,
    -- Nouvelles colonnes (fin de liste).
    district,
    (
        SELECT MIN((s->>'price')::numeric)
        FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(services) = 'array' THEN services ELSE '[]'::jsonb END
        ) AS s
        WHERE jsonb_typeof(s->'price') = 'number' AND (s->>'price')::numeric > 0
    ) AS starting_price
FROM public.user_profiles
WHERE is_published = TRUE
  AND COALESCE(is_suspended, FALSE) = FALSE;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

SELECT '✅ public_profiles expose district et starting_price.' AS status;
