-- ============================================================================
-- Annonces — modèles réutilisables et suivi des envois
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-29
--
-- Jusqu'ici, une annonce partait et disparaissait : seule une trace restait
-- dans admin_audit_log, illisible et non réutilisable. Rédiger deux fois le
-- même message imposait de tout retaper.
--
-- Deux tables :
--   • message_templates  — ce qu'on veut pouvoir renvoyer plus tard ;
--   • campaigns / campaign_recipients — qui a reçu quoi, et qui l'a ouvert.
--
-- Le suivi d'ouverture concerne les E-MAILS. Les notifications internes ont
-- déjà leur mesure : notifications.is_read, agrégée par getBroadcastReadCounts().
--
-- Idempotent.
-- ============================================================================

-- ── 1. Modèles réutilisables ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.message_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(120) NOT NULL,
  -- 'inapp' = notification interne, 'email' = campagne e-mail.
  channel     varchar(10)  NOT NULL CHECK (channel IN ('inapp', 'email')),
  subject     varchar(200) NOT NULL,
  content     text         NOT NULL,
  -- Segment (notifications) ou critères d'audience (e-mails) : conservés pour
  -- que réutiliser un modèle restitue aussi son ciblage, pas seulement son texte.
  segment     varchar(40),
  criteria    jsonb,
  link        text,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Combien de fois ce modèle a servi : permet de remonter les plus utiles.
  use_count   integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_templates_channel
  ON public.message_templates (channel, updated_at DESC);

-- ── 2. Campagnes e-mail et destinataires ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaigns (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     varchar(200) NOT NULL,
  channel     varchar(10)  NOT NULL DEFAULT 'email' CHECK (channel IN ('inapp', 'email')),
  template_id uuid REFERENCES public.message_templates(id) ON DELETE SET NULL,
  sent_count  integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email       varchar(255) NOT NULL,
  sent_at     timestamptz NOT NULL DEFAULT now(),
  -- Renseigné au premier chargement du pixel. Reste NULL si le destinataire
  -- n'ouvre pas — ou si son client de messagerie bloque les images.
  opened_at   timestamptz,
  open_count  integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign
  ON public.campaign_recipients (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_opened
  ON public.campaign_recipients (campaign_id) WHERE opened_at IS NOT NULL;

-- ── 3. RLS : réservé au back-office ────────────────────────────────────────
-- Aucune politique de lecture pour `authenticated` : ces tables ne sont
-- accessibles qu'au service role, donc au back-office. Un membre n'a pas à
-- savoir qui d'autre a reçu quoi.
ALTER TABLE public.message_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients  ENABLE ROW LEVEL SECURITY;

-- ── 4. Enregistrement d'une ouverture ──────────────────────────────────────
-- Appelée par le pixel de suivi, sans authentification : d'où SECURITY DEFINER
-- et une écriture strictement limitée aux deux colonnes de comptage.
-- La première ouverture fait foi ; les suivantes n'incrémentent qu'un compteur.
CREATE OR REPLACE FUNCTION public.record_email_open(p_recipient_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.campaign_recipients
     SET opened_at  = COALESCE(opened_at, now()),
         open_count = open_count + 1
   WHERE id = p_recipient_id;
$$;

GRANT EXECUTE ON FUNCTION public.record_email_open(uuid) TO anon, authenticated;

-- ── 5. Statistiques d'une campagne ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.campaign_stats(p_campaign_id uuid)
RETURNS TABLE(total bigint, opened bigint, not_opened bigint, open_rate numeric)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)                                              AS total,
         count(*) FILTER (WHERE opened_at IS NOT NULL)         AS opened,
         count(*) FILTER (WHERE opened_at IS NULL)             AS not_opened,
         CASE WHEN count(*) = 0 THEN 0
              ELSE round(100.0 * count(*) FILTER (WHERE opened_at IS NOT NULL) / count(*), 1)
         END                                                   AS open_rate
  FROM public.campaign_recipients
  WHERE campaign_id = p_campaign_id;
$$;

SELECT '✅ Modèles réutilisables et suivi des campagnes prêts.' AS status;
