-- ============================================================================
-- Monétisation — Phase 1 : Abonnement Pro + Paiements + Analytics profil
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-23
--
-- Implémente en Supabase (PAS de Prisma) la première tranche du modèle éco :
--   • subscriptions        : forfait Pro (mensuel/annuel/B2B), source de vérité ;
--   • payment_transactions : traçabilité paiements Mobile Money (FedaPay/KKiaPay) ;
--   • profile_analytics     : compteurs vues / clics WhatsApp / appels / partages.
--
-- + Dérivation automatique de user_profiles.is_premium depuis l'abonnement actif
--   (le classement de recherche lit déjà is_premium → priorité « Pro Vérifié »).
-- + RPC increment_profile_metric() : tracking public sans droit d'écriture (RLS).
-- + expire_subscriptions() : à planifier (pg_cron / endpoint) pour clôturer les
--   abonnements échus.
--
-- Les BOOSTS géolocalisés (Phase 2) et le B2B/NFC/ONG (Phase 3) ne sont PAS ici.
-- Idempotent. Montants en entier FCFA (devise XOF, sans décimales).
-- ============================================================================

-- ── 1. Types énumérés ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.subscription_tier AS ENUM ('FREE', 'PRO_MONTHLY', 'PRO_ANNUAL', 'B2B');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_provider AS ENUM ('FEDAPAY', 'KKIAPAY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_type AS ENUM ('SUBSCRIPTION_PRO', 'PROFILE_BOOST');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. Abonnements (une ligne par utilisateur) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier       public.subscription_tier   NOT NULL DEFAULT 'FREE',
  status     public.subscription_status NOT NULL DEFAULT 'ACTIVE',
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date   timestamptz,               -- NULL = pas d'échéance (FREE)
  auto_renew boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status_end
  ON public.subscriptions (status, end_date);

-- ── 3. Transactions de paiement ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount        integer NOT NULL CHECK (amount >= 0),   -- FCFA
  currency      char(3) NOT NULL DEFAULT 'XOF',
  provider      public.payment_provider NOT NULL,
  provider_ref  text UNIQUE,                            -- référence opérateur (idempotence)
  type          public.payment_type NOT NULL,
  status        public.payment_status NOT NULL DEFAULT 'PENDING',
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_tx_user_status
  ON public.payment_transactions (user_id, status);

-- ── 4. Analytics par profil (compteurs) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  profile_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  views_count     integer NOT NULL DEFAULT 0,
  whatsapp_clicks integer NOT NULL DEFAULT 0,
  call_clicks     integer NOT NULL DEFAULT 0,
  shares_count    integer NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── 5. RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics    ENABLE ROW LEVEL SECURITY;

-- Lecture de ses propres données uniquement. Les écritures passent par le
-- service role (webhook de paiement) ou la RPC dédiée → jamais par le client.
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payment_tx_select_own" ON public.payment_transactions;
CREATE POLICY "payment_tx_select_own" ON public.payment_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_analytics_select_own" ON public.profile_analytics;
CREATE POLICY "profile_analytics_select_own" ON public.profile_analytics
  FOR SELECT TO authenticated USING (auth.uid() = profile_id);

-- ── 6. Dérivation de user_profiles.is_premium depuis l'abonnement ──────────
--     Le classement de recherche lit is_premium → « Pro Vérifié » (Score 2).
CREATE OR REPLACE FUNCTION public.sync_is_premium()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_pro boolean;
BEGIN
  is_pro := (
    NEW.status = 'ACTIVE'
    AND NEW.tier IN ('PRO_MONTHLY', 'PRO_ANNUAL', 'B2B')
    AND (NEW.end_date IS NULL OR NEW.end_date > now())
  );
  UPDATE public.user_profiles
     SET is_premium = is_pro
   WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_is_premium ON public.subscriptions;
CREATE TRIGGER trg_sync_is_premium
  AFTER INSERT OR UPDATE OF tier, status, end_date ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_is_premium();

-- ── 7. Clôture des abonnements échus (à planifier via pg_cron / endpoint) ───
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  UPDATE public.subscriptions
     SET status = 'EXPIRED', updated_at = now()
   WHERE status = 'ACTIVE'
     AND end_date IS NOT NULL
     AND end_date <= now();
  GET DIAGNOSTICS n = ROW_COUNT;   -- le trigger sync_is_premium remet is_premium=false
  RETURN n;
END;
$$;

-- ── 8. Tracking public des métriques (sans droit d'écriture direct) ─────────
--     Whiteliste les métriques ; upsert atomique. Appelable par anon.
CREATE OR REPLACE FUNCTION public.increment_profile_metric(p_profile_id uuid, p_metric text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_metric NOT IN ('views', 'whatsapp', 'call', 'share') THEN
    RAISE EXCEPTION 'Métrique invalide: %', p_metric;
  END IF;

  INSERT INTO public.profile_analytics (profile_id) VALUES (p_profile_id)
  ON CONFLICT (profile_id) DO NOTHING;

  UPDATE public.profile_analytics
     SET views_count     = views_count     + (p_metric = 'views')::int,
         whatsapp_clicks = whatsapp_clicks + (p_metric = 'whatsapp')::int,
         call_clicks     = call_clicks     + (p_metric = 'call')::int,
         shares_count    = shares_count    + (p_metric = 'share')::int,
         updated_at      = now()
   WHERE profile_id = p_profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_profile_metric(uuid, text) TO anon, authenticated;

SELECT '✅ Monétisation Phase 1 prête : subscriptions, payment_transactions, profile_analytics, is_premium auto.' AS status;
