-- ============================================================
-- P2 #11 — Programmation des annonces (scheduling)
-- ------------------------------------------------------------
-- File d'attente des annonces à envoyer à une date future. Le
-- processeur (route cron protégée par CRON_SECRET) traite les lignes
-- « pending » dont scheduled_for <= now(), puis marque « sent »/« failed ».
-- Accès uniquement via service role (RLS activée, aucune policy publique).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scheduled_broadcasts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  content        text NOT NULL,
  segment        text NOT NULL,
  link           text,
  scheduled_for  timestamptz NOT NULL,
  status         text NOT NULL DEFAULT 'pending',
  created_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  sent_at        timestamptz,
  result_count   integer,
  result_total   integer,
  error          text
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scheduled_broadcasts_status_chk'
  ) THEN
    ALTER TABLE public.scheduled_broadcasts
      ADD CONSTRAINT scheduled_broadcasts_status_chk
      CHECK (status IN ('pending', 'sent', 'failed', 'canceled'));
  END IF;
END $$;

-- Le processeur cible les lignes dues : status = 'pending' ET scheduled_for <= now().
CREATE INDEX IF NOT EXISTS idx_scheduled_broadcasts_due
  ON public.scheduled_broadcasts (scheduled_for)
  WHERE status = 'pending';

ALTER TABLE public.scheduled_broadcasts ENABLE ROW LEVEL SECURITY;
-- Aucune policy : seul le service role (client admin / cron) y accède.
