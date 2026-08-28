-- ============================================================================
-- Migration : champs avancés des Paramètres / Profil EmiID
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-19
--
-- Alimente les onglets Paramètres (hors onboarding) :
--   • À propos & Bio      → slogan, years_experience
--   • Réseaux sociaux     → facebook/instagram/tiktok/linkedin, tél/email public
--   • Horaires & Services → opening_hours (JSONB), services (JSONB), address
--   • Sécurité            → two_factor_enabled
--   • Vérification        → table verification_documents (+ bucket privé)
--
-- La plupart des champs vivent sur user_profiles : ils transitent par
-- l'endpoint PUT /api/users/me existant (aucune nouvelle route requise).
-- Idempotent : réexécutable sans effet de bord.
-- ============================================================================

-- ── 1. Colonnes simples sur user_profiles ──────────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS slogan             VARCHAR(160),
  ADD COLUMN IF NOT EXISTS years_experience   SMALLINT CHECK (years_experience IS NULL OR (years_experience >= 0 AND years_experience <= 80)),
  ADD COLUMN IF NOT EXISTS facebook_url       TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url      TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url         TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url       TEXT,
  ADD COLUMN IF NOT EXISTS secondary_phone    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS public_email       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address            TEXT,
  ADD COLUMN IF NOT EXISTS opening_hours      JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services           JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.user_profiles.slogan           IS 'Slogan / phrase d''accroche.';
COMMENT ON COLUMN public.user_profiles.years_experience IS 'Années d''expérience.';
COMMENT ON COLUMN public.user_profiles.opening_hours    IS 'Horaires : [{ "day": 1, "open": "08:00", "close": "18:00", "closed": false }].';
COMMENT ON COLUMN public.user_profiles.services         IS 'Catalogue : [{ "title": "…", "price": 5000, "description": "…" }] (prix en FCFA).';

-- ── 2. Table des documents de vérification (KYC) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.verification_documents (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doc_type   VARCHAR(30) NOT NULL CHECK (doc_type IN ('cni', 'cip', 'passeport', 'ifu', 'registre', 'atelier')),
    file_path  TEXT NOT NULL,               -- chemin dans le bucket privé "verification"
    status     VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_docs_user_id ON public.verification_documents(user_id);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Le propriétaire gère ses propres documents ; l'admin passe par le service role
-- (bypass RLS) côté backend.
DROP POLICY IF EXISTS "Verification Docs Owner Access" ON public.verification_documents;
CREATE POLICY "Verification Docs Owner Access" ON public.verification_documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_documents TO authenticated;

-- ── 3. Bucket privé "verification" (PII : jamais public) ───────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification', 'verification', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Aucune lecture anon/publique. Accès strictement propriétaire, chemin `${uid}/…`.
DROP POLICY IF EXISTS "verification_owner_read" ON storage.objects;
CREATE POLICY "verification_owner_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'verification' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "verification_owner_insert" ON storage.objects;
CREATE POLICY "verification_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'verification' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "verification_owner_delete" ON storage.objects;
CREATE POLICY "verification_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'verification' AND (storage.foldername(name))[1] = auth.uid()::text);

SELECT '✅ Champs Paramètres avancés + table verification_documents + bucket privé prêts.' AS status;
