-- ════════════════════════════════════════════════════════════════════════════
--  P0 ADMIN — Suspension réversible + Journal d'audit + garde-fous rôles
--  À exécuter dans le SQL Editor Supabase. Idempotent.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Colonnes de suspension sur user_profiles ────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_suspended     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_at     timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_until  timestamptz,          -- NULL = suspension permanente
  ADD COLUMN IF NOT EXISTS suspended_reason text,
  ADD COLUMN IF NOT EXISTS suspended_by     uuid;

CREATE INDEX IF NOT EXISTS idx_user_profiles_suspended
  ON public.user_profiles (is_suspended) WHERE is_suspended = true;

-- ─── 2. Journal d'audit des actions admin ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     uuid NOT NULL,
  admin_email  text,
  action       text NOT NULL,             -- ex: user.suspend, user.delete, user.grant_admin
  target_type  text,                      -- ex: user, gallery_item, report
  target_id    text,
  target_label text,                      -- libellé lisible (nom/email de la cible)
  details      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id   ON public.admin_audit_log (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target     ON public.admin_audit_log (target_type, target_id);

-- RLS : lecture réservée aux admins ; écriture uniquement via service role (bypass RLS).
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_admin_read" ON public.admin_audit_log;
CREATE POLICY "audit_admin_read" ON public.admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.user_id = auth.uid() AND p.is_admin = true
    )
  );
-- Aucune policy INSERT/UPDATE/DELETE → seul le service role peut écrire (journal inaltérable côté client).

-- ─── 3. Exclure les profils suspendus de l'annuaire public ──────────────────
--     (vue anon-lisible : un suspendu disparaît de l'annuaire et des cartes OG)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
    id, user_id, first_name, last_name, avatar_url, cover_url, bio, category,
    job_title, industry, role, specialty, activity_domain, country_id, city,
    website, slug, is_published, is_verified, is_premium, card_variant,
    followers_count, created_at
FROM public.user_profiles
WHERE is_published = TRUE
  AND COALESCE(is_suspended, FALSE) = FALSE;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ─── 4. Idem pour la RPC de profil public unitaire ──────────────────────────
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
      AND COALESCE(up.is_suspended, FALSE) = FALSE
      AND (
            up.slug = lower(identifier)
         OR up.id::text = lower(identifier)
         OR up.user_id::text = lower(identifier)
      )
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;

SELECT '✅ P0 admin appliqué : suspension + admin_audit_log + annuaire filtré.' AS status;
