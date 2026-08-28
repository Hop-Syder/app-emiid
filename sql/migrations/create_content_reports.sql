-- =============================================================
-- Migration : content_reports (signalements polymorphes)
-- Objet     : Centraliser les signalements user→admin pour
--             galerie, messages, profils dans une seule table.
-- Sûreté    : idempotente
-- =============================================================

BEGIN;

-- 1) Table -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_reports (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_type   TEXT NOT NULL,                 -- 'gallery' | 'message' | 'profile'
    subject_id     UUID NOT NULL,                 -- FK logique vers la table visée
    reporter_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason         TEXT NOT NULL,                 -- raison libre, limite 1000 chars (CHECK)
    status         TEXT NOT NULL DEFAULT 'open',  -- 'open' | 'resolved' | 'dismissed'
    resolved_at    TIMESTAMPTZ,
    resolved_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_note     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contraintes
ALTER TABLE public.content_reports
  DROP CONSTRAINT IF EXISTS content_reports_subject_type_check;
ALTER TABLE public.content_reports
  ADD  CONSTRAINT content_reports_subject_type_check
       CHECK (subject_type IN ('gallery', 'message', 'profile'));

ALTER TABLE public.content_reports
  DROP CONSTRAINT IF EXISTS content_reports_status_check;
ALTER TABLE public.content_reports
  ADD  CONSTRAINT content_reports_status_check
       CHECK (status IN ('open', 'resolved', 'dismissed'));

ALTER TABLE public.content_reports
  DROP CONSTRAINT IF EXISTS content_reports_reason_len;
ALTER TABLE public.content_reports
  ADD  CONSTRAINT content_reports_reason_len
       CHECK (char_length(reason) BETWEEN 3 AND 1000);

-- Anti-doublon : un user ne peut signaler 2× la même cible tant que non traité
CREATE UNIQUE INDEX IF NOT EXISTS uq_content_reports_open
  ON public.content_reports (reporter_id, subject_type, subject_id)
  WHERE status = 'open';

-- Index de file d'attente admin
CREATE INDEX IF NOT EXISTS idx_content_reports_status_created
  ON public.content_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reports_subject
  ON public.content_reports (subject_type, subject_id);

-- 2) RLS -------------------------------------------------------
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs voient uniquement leurs propres signalements
DROP POLICY IF EXISTS "content_reports_reporter_select" ON public.content_reports;
CREATE POLICY "content_reports_reporter_select"
  ON public.content_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Les utilisateurs peuvent créer un signalement en tant que reporter_id = self
DROP POLICY IF EXISTS "content_reports_reporter_insert" ON public.content_reports;
CREATE POLICY "content_reports_reporter_insert"
  ON public.content_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id AND status = 'open');

-- NB : service_role (admin) bypasse RLS → la console admin lit/met à jour
-- sans policy explicite. Pas de UPDATE/DELETE côté user (volontaire).

-- 3) Permissions -----------------------------------------------
GRANT SELECT, INSERT ON public.content_reports TO authenticated;
GRANT ALL           ON public.content_reports TO service_role;

COMMIT;

-- =============================================================
-- Vérif rapide :
-- SELECT subject_type, status, COUNT(*) FROM public.content_reports GROUP BY 1,2;
-- =============================================================
