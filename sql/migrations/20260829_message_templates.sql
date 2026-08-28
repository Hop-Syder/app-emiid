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
-- Le suivi porte sur les CLICS, pas sur les ouvertures. Le pixel invisible est
-- devenu ininterprétable : Apple Mail précharge toutes les images (ouvertures
-- fictives) tandis que d'autres clients les bloquent (lectures jamais comptées).
-- Un clic, lui, est un acte délibéré : le chiffre est vrai, même s'il est plus
-- petit.
--
-- Les notifications internes ont déjà leur mesure : notifications.is_read,
-- agrégée par getBroadcastReadCounts().
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
  -- Renseigné au premier clic sur un lien de la campagne.
  clicked_at  timestamptz,
  click_count integer NOT NULL DEFAULT 0
);

-- Liens d'une campagne. La destination est STOCKÉE ici, jamais transmise dans
-- l'URL de suivi : une redirection pilotée par un paramètre ouvrirait une
-- redirection arbitraire, exploitable pour de l'hameçonnage depuis notre
-- propre domaine.
CREATE TABLE IF NOT EXISTS public.campaign_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  url         text NOT NULL,
  label       varchar(200),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_links_campaign
  ON public.campaign_links (campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign
  ON public.campaign_recipients (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_clicked
  ON public.campaign_recipients (campaign_id) WHERE clicked_at IS NOT NULL;

-- ── 3. RLS : réservé au back-office ────────────────────────────────────────
-- Aucune politique de lecture pour `authenticated` : ces tables ne sont
-- accessibles qu'au service role, donc au back-office. Un membre n'a pas à
-- savoir qui d'autre a reçu quoi.
ALTER TABLE public.message_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_links       ENABLE ROW LEVEL SECURITY;

-- ── 4. Enregistrement d'un clic ────────────────────────────────────────────
-- Appelée par la route de redirection, sans authentification : d'où
-- SECURITY DEFINER et une écriture limitée aux deux colonnes de comptage.
-- Le premier clic fait foi ; les suivants n'incrémentent qu'un compteur.
--
-- Renvoie la destination stockée, ce qui permet à l'appelant de rediriger sans
-- jamais faire confiance à un paramètre d'URL.
CREATE OR REPLACE FUNCTION public.record_email_click(p_recipient_id uuid, p_link_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target text;
BEGIN
  SELECT url INTO target FROM public.campaign_links WHERE id = p_link_id;
  IF target IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.campaign_recipients
     SET clicked_at  = COALESCE(clicked_at, now()),
         click_count = click_count + 1
   WHERE id = p_recipient_id;

  RETURN target;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_email_click(uuid, uuid) TO anon, authenticated;

-- ── 5. Statistiques d'une campagne ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.campaign_stats(p_campaign_id uuid)
RETURNS TABLE(total bigint, clicked bigint, not_clicked bigint, click_rate numeric)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)                                              AS total,
         count(*) FILTER (WHERE clicked_at IS NOT NULL)        AS clicked,
         count(*) FILTER (WHERE clicked_at IS NULL)            AS not_clicked,
         CASE WHEN count(*) = 0 THEN 0
              ELSE round(100.0 * count(*) FILTER (WHERE clicked_at IS NOT NULL) / count(*), 1)
         END                                                   AS click_rate
  FROM public.campaign_recipients
  WHERE campaign_id = p_campaign_id;
$$;

GRANT EXECUTE ON FUNCTION public.campaign_stats(uuid) TO authenticated;

SELECT '✅ Modèles réutilisables et suivi des clics prêts.' AS status;
