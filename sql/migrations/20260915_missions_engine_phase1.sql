-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Moteur Missions Courtes — Phase 1 (fondations).
--  *              Module ADDITIF au socle app-emiid existant (réseau pro vérifié +
--  *              abonnements/boosts) : aucune table Mission/Escrow/CreditWallet
--  *              n'existait avant cette migration (vérifié sur les 65 migrations
--  *              précédentes + MASTER_EMIID_SCHEMA.sql, 2026-09-15).
--  *
--  *              Principe transversal : JAMAIS de commission sur le montant de la
--  *              prestation — uniquement crédits d'accès (candidature), séquestre
--  *              optionnel (Phase 3), forfait B2B Sourcing Express (Phase 5).
--  *              Prolonge la culture déjà en place (subscriptions + boosts, sans
--  *              commission) plutôt que de l'inventer.
--  *
--  *              Corrections apportées par rapport au brouillon de
--  *              docs/business-plan-missions.md §5/§5bis, après relecture du code
--  *              réel (voir aussi memory missions-engine-plan-2026-09) :
--  *                1. Ordre de création des tables corrigé (credit_transactions
--  *                   référençait missions avant sa création).
--  *                2. FK corrigée : payment_transactions (la table réelle),
--  *                   pas "payments" (qui n'existe pas dans ce schéma).
--  *                3. FAILLE IDOR corrigée : consume_credit_for_application()
--  *                   prenait p_user_id en paramètre — n'importe quel utilisateur
--  *                   authentifié aurait pu vider le portefeuille d'un autre et
--  *                   soumettre des candidatures en son nom. L'identité vient
--  *                   maintenant uniquement de auth.uid().
--  *                4. RLS credit_wallets restreinte à SELECT (propriétaire) —
--  *                   le brouillon utilisait FOR ALL, permettant à un client
--  *                   d'écrire directement son propre solde. Tous les écritures
--  *                   passent désormais par des fonctions SECURITY DEFINER ou le
--  *                   webhook (service role), jamais par un UPDATE direct client.
--  *                5. RLS missions/mission_applications réécrite avec des
--  *                   politiques séparées par commande (au lieu d'un FOR ALL trop
--  *                   permissif) + trigger de garde empêchant un client de
--  *                   modifier directement les champs machine-à-états (status,
--  *                   selected_pro_id, has_escrow, escrow_fee_bps, delivered_at,
--  *                   auto_release_at, client_confirmed_at, max_applications) —
--  *                   ces champs sont réservés aux RPC dédiées (Phase 1 : la
--  *                   candidature et la réouverture ; Phase 2/3 : sélection,
--  *                   livraison, séquestre — pas encore construites).
--  *                6. CHECK constraints ajoutées : escrow_fee_bps cohérent avec
--  *                   has_escrow (3-5% si activé, 0 sinon), budget_min <= budget_max.
--  *
--  *              Hors périmètre de cette migration (Phases suivantes de la
--  *              roadmap, voir docs/business-plan-missions.md §6) : cadrage IA,
--  *              sélection/attribution d'un prestataire, statut DELIVERED réel
--  *              posé par le pro, séquestre effectif, paliers de confiance,
--  *              parrainage, réservation directe d'offres (Phase 6). Les colonnes
--  *              existent déjà (pour éviter une migration ALTER TABLE plus tard)
--  *              mais aucune RPC ne les manipule encore.
--  * @created 2026-09-15
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

-- ── 0. Extension du type payment_type existant (réutilise FedaPay tel quel) ─
ALTER TYPE public.payment_type ADD VALUE IF NOT EXISTS 'CREDIT_PACK';
ALTER TYPE public.payment_type ADD VALUE IF NOT EXISTS 'MISSION_ESCROW';

-- ── 1. Types énumérés du module Missions ────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.mission_status AS ENUM
    ('DRAFT','PUBLISHED','APPLICATIONS_OPEN','APPLICATIONS_CLOSED','ASSIGNED',
     'IN_PROGRESS','DELIVERED','COMPLETED','DISPUTED','CANCELLED','EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('PENDING','ACCEPTED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. Portefeuille de crédits (une ligne par utilisateur) ─────────────────
CREATE TABLE IF NOT EXISTS public.credit_wallets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance     integer NOT NULL DEFAULT 3 CHECK (balance >= 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Missions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.missions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid NOT NULL REFERENCES auth.users(id),
  title                text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  description          text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 5000),
  category             text,
  budget_min           integer CHECK (budget_min IS NULL OR budget_min >= 0),
  budget_max           integer CHECK (budget_max IS NULL OR budget_max >= 0),
  -- Verrouillé sur XOF pour le pilote (zone UEMOA / Mobile Money) : pas de
  -- gestion multi-devise en v1 (voir docs/business-plan-missions.md §5bis).
  currency             char(3) NOT NULL DEFAULT 'XOF' CHECK (currency = 'XOF'),
  deadline             timestamptz,
  location             text,
  -- Géolocalisation : mêmes colonnes que user_profiles (pas de PostGIS dans ce
  -- projet, cf. 20260828_add_gps_location.sql) + même fonction Haversine que
  -- search_profiles_by_proximity, dupliquée pour les missions plus bas.
  latitude             decimal(10,8),
  longitude            decimal(11,8),
  status               public.mission_status NOT NULL DEFAULT 'PUBLISHED',
  has_escrow           boolean NOT NULL DEFAULT false,
  escrow_fee_bps       integer NOT NULL DEFAULT 0,
  selected_pro_id      uuid REFERENCES auth.users(id),
  max_applications     integer NOT NULL DEFAULT 2 CHECK (max_applications >= 1),
  started_at           timestamptz,
  delivered_at         timestamptz,
  auto_release_at      timestamptz,
  client_confirmed_at  timestamptz,
  expires_at           timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max),
  CHECK (
    (has_escrow = false AND escrow_fee_bps = 0)
    OR (has_escrow = true AND escrow_fee_bps BETWEEN 300 AND 500)
  )
);

CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions (status);
CREATE INDEX IF NOT EXISTS idx_missions_client ON public.missions (client_id);

-- ── 4. Candidatures ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mission_applications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id     uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  pro_id         uuid NOT NULL REFERENCES auth.users(id),
  proposed_price integer NOT NULL CHECK (proposed_price >= 0),
  pitch          text,
  status         public.application_status NOT NULL DEFAULT 'PENDING',
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mission_id, pro_id)
);

CREATE INDEX IF NOT EXISTS idx_mission_applications_pro ON public.mission_applications (pro_id);

-- ── 5. Transactions de crédits (journal, créé après missions/wallets) ──────
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id    uuid NOT NULL REFERENCES public.credit_wallets(id) ON DELETE CASCADE,
  amount       integer NOT NULL,
  type         text NOT NULL CHECK (type IN ('WELCOME_BONUS','PURCHASE','APPLICATION_FEE','REFUND')),
  mission_id   uuid REFERENCES public.missions(id),
  payment_id   uuid REFERENCES public.payment_transactions(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_wallet ON public.credit_transactions (wallet_id);

-- ── 6. RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.credit_wallets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- credit_wallets : lecture seule pour le propriétaire. Aucune écriture client
-- directe — tout passe par handle_new_user (bonus), les RPC SECURITY DEFINER
-- ci-dessous, ou le webhook de paiement (service role, hors RLS).
DROP POLICY IF EXISTS "credit_wallets_select_own" ON public.credit_wallets;
CREATE POLICY "credit_wallets_select_own" ON public.credit_wallets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- credit_transactions : lecture des transactions de son propre portefeuille.
DROP POLICY IF EXISTS "credit_transactions_select_own" ON public.credit_transactions;
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.credit_wallets cw WHERE cw.id = wallet_id AND cw.user_id = auth.uid())
  );

-- missions : lecture publique des missions ouvertes, + le client sur ses
-- propres missions (tous statuts), + le pro sélectionné, + tout candidat
-- ayant postulé (pour suivre l'issue même après fermeture des candidatures).
DROP POLICY IF EXISTS "missions_select" ON public.missions;
CREATE POLICY "missions_select" ON public.missions
  FOR SELECT USING (
    status IN ('PUBLISHED','APPLICATIONS_OPEN')
    OR auth.uid() = client_id
    OR auth.uid() = selected_pro_id
    OR EXISTS (
      SELECT 1 FROM public.mission_applications ma
      WHERE ma.mission_id = missions.id AND ma.pro_id = auth.uid()
    )
  );

-- missions : création par le client authentifié, état initial sain uniquement
-- (pas moyen de pré-remplir un état avancé à la création).
DROP POLICY IF EXISTS "missions_insert" ON public.missions;
CREATE POLICY "missions_insert" ON public.missions
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = client_id
    AND status IN ('DRAFT','PUBLISHED')
    AND selected_pro_id IS NULL
    AND started_at IS NULL AND delivered_at IS NULL
    AND auto_release_at IS NULL AND client_confirmed_at IS NULL
  );

-- missions : mise à jour par le client propriétaire — les champs machine-à-
-- états restent protégés par le trigger ci-dessous (RLS ne peut pas filtrer
-- colonne par colonne).
DROP POLICY IF EXISTS "missions_update_own" ON public.missions;
CREATE POLICY "missions_update_own" ON public.missions
  FOR UPDATE TO authenticated USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);

-- missions : suppression réservée aux brouillons jamais publiés.
DROP POLICY IF EXISTS "missions_delete_draft" ON public.missions;
CREATE POLICY "missions_delete_draft" ON public.missions
  FOR DELETE TO authenticated USING (auth.uid() = client_id AND status = 'DRAFT');

-- mission_applications : lecture par le candidat lui-même ou le client de la
-- mission concernée. Pas de politique INSERT/UPDATE/DELETE — toute écriture
-- passe par consume_credit_for_application() (SECURITY DEFINER), même
-- convention que increment_profile_metric() dans 20260823_monetization_phase1.sql.
DROP POLICY IF EXISTS "mission_applications_select" ON public.mission_applications;
CREATE POLICY "mission_applications_select" ON public.mission_applications
  FOR SELECT TO authenticated USING (
    auth.uid() = pro_id
    OR EXISTS (SELECT 1 FROM public.missions m WHERE m.id = mission_applications.mission_id AND m.client_id = auth.uid())
  );

-- ── 7. Trigger de garde : verrouille les champs machine-à-états de missions ─
--     contre une écriture directe par le client. Seules les fonctions ci-
--     dessous (qui posent app.bypass_mission_guard avant d'écrire) peuvent les
--     modifier. Nécessaire car la politique RLS "missions_update_own" ne peut
--     pas restreindre colonne par colonne.
CREATE OR REPLACE FUNCTION public.protect_mission_state_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('app.bypass_mission_guard', true) = 'true' THEN
    RETURN NEW;
  END IF;

  IF NEW.selected_pro_id     IS DISTINCT FROM OLD.selected_pro_id
     OR NEW.has_escrow       IS DISTINCT FROM OLD.has_escrow
     OR NEW.escrow_fee_bps   IS DISTINCT FROM OLD.escrow_fee_bps
     OR NEW.started_at       IS DISTINCT FROM OLD.started_at
     OR NEW.delivered_at     IS DISTINCT FROM OLD.delivered_at
     OR NEW.auto_release_at  IS DISTINCT FROM OLD.auto_release_at
     OR NEW.client_confirmed_at IS DISTINCT FROM OLD.client_confirmed_at
     OR NEW.max_applications IS DISTINCT FROM OLD.max_applications
  THEN
    RAISE EXCEPTION 'Ces champs ne peuvent être modifiés que via les fonctions dédiées (candidature, réouverture, sélection, livraison, séquestre)'
      USING ERRCODE = 'P0004';
  END IF;

  -- Le client ne peut faire transiter le statut lui-même que vers CANCELLED.
  -- Toute autre transition (ASSIGNED, DELIVERED, COMPLETED, ...) exige une
  -- fonction dédiée des phases suivantes.
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'CANCELLED' THEN
    RAISE EXCEPTION 'Transition de statut non autorisée directement : % -> %', OLD.status, NEW.status
      USING ERRCODE = 'P0005';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_mission_state_fields ON public.missions;
CREATE TRIGGER trg_protect_mission_state_fields
  BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.protect_mission_state_fields();

-- SÉCURITÉ : fonction de trigger, jamais appelable directement via /rest/v1/rpc
-- (même règle que handle_new_user() et les autres fonctions de trigger listées
-- dans 20260709_security_lints_hardening.sql). Le trigger continue de
-- l'exécuter normalement (contexte propriétaire, non affecté par ce REVOKE).
REVOKE EXECUTE ON FUNCTION public.protect_mission_state_fields() FROM PUBLIC, anon, authenticated;

-- ── 8. Provisioning à l'inscription : portefeuille + bonus de bienvenue ────
--     Redéfinit handle_new_user() en conservant intégralement la logique de
--     20260622_auto_slug_handle_new_user.sql (dernière version en date) et en y
--     ajoutant la création du portefeuille de crédits.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_first     text;
    v_base      text;
    v_slug      text;
    v_wallet_id uuid;
BEGIN
    v_first := COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
        'membre'
    );

    v_base := trim(both '-' from lower(regexp_replace(v_first, '[^a-zA-Z0-9]+', '-', 'g')));
    IF v_base IS NULL OR v_base = '' THEN
        v_base := 'membre';
    END IF;

    v_slug := v_base || '-' || substr(md5(NEW.id::text), 1, 8);

    INSERT INTO public.user_profiles (user_id, first_name, last_name, email, avatar_url, role, slug)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        '',
        v_slug
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Moteur Missions : 3 crédits offerts à l'inscription (bonus de bienvenue),
    -- journalisés pour traçabilité. ON CONFLICT DO NOTHING rend l'opération
    -- idempotente ; le bonus n'est journalisé que si le portefeuille est
    -- réellement neuf (évite un doublon en cas de re-déclenchement).
    INSERT INTO public.credit_wallets (user_id, balance)
    VALUES (NEW.id, 3)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_wallet_id;

    IF v_wallet_id IS NOT NULL THEN
        INSERT INTO public.credit_transactions (wallet_id, amount, type)
        VALUES (v_wallet_id, 3, 'WELCOME_BONUS');
    END IF;

    RETURN NEW;
END;
$$;

-- Backfill : portefeuille + bonus pour les comptes déjà existants qui n'en ont pas.
DO $$
DECLARE
  r record;
  v_wallet_id uuid;
BEGIN
  FOR r IN SELECT id FROM auth.users WHERE id NOT IN (SELECT user_id FROM public.credit_wallets)
  LOOP
    INSERT INTO public.credit_wallets (user_id, balance) VALUES (r.id, 3)
    RETURNING id INTO v_wallet_id;
    INSERT INTO public.credit_transactions (wallet_id, amount, type)
    VALUES (v_wallet_id, 3, 'WELCOME_BONUS');
  END LOOP;
END $$;

-- ── 9. Recherche de proximité pour les missions (même formule que les profils) ─
CREATE OR REPLACE FUNCTION public.search_missions_by_proximity(
    p_lat numeric,
    p_lng numeric,
    p_radius_km numeric DEFAULT 50
)
RETURNS TABLE (mission_id uuid, distance_km numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT mission_id, distance_km
    FROM (
        SELECT
            id AS mission_id,
            (
                6371 * acos(
                    cos(radians(p_lat)) * cos(radians(latitude))
                    * cos(radians(longitude) - radians(p_lng))
                    + sin(radians(p_lat)) * sin(radians(latitude))
                )
            )::numeric AS distance_km
        FROM public.missions
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND status IN ('PUBLISHED','APPLICATIONS_OPEN')
    ) d
    WHERE d.distance_km <= p_radius_km
    ORDER BY distance_km ASC;
$$;

GRANT EXECUTE ON FUNCTION public.search_missions_by_proximity(numeric, numeric, numeric) TO anon, authenticated;

-- ── 10. Candidature atomique et payante ─────────────────────────────────────
--      SÉCURITÉ : l'identité du candidat vient uniquement de auth.uid(), jamais
--      d'un paramètre — sinon n'importe quel appelant authentifié pourrait
--      vider le portefeuille d'un tiers et postuler en son nom (IDOR).
--      Verrouille la mission (FOR UPDATE) avant le portefeuille, même ordre à
--      chaque appel, pour ne jamais provoquer de deadlock entre deux appels
--      concurrents ; applique le plafond max_applications de façon atomique en
--      plus du verrou anti-double-candidature sur le solde de crédits.
CREATE OR REPLACE FUNCTION public.consume_credit_for_application(
  p_mission_id uuid,
  p_price      integer,
  p_pitch      text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id          uuid := auth.uid();
  v_client_id        uuid;
  v_wallet_id        uuid;
  v_balance          integer;
  v_app_id           uuid;
  v_current_apps_cnt integer;
  v_max_apps         integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentification requise' USING ERRCODE = 'P0001';
  END IF;

  IF p_price < 0 THEN
    RAISE EXCEPTION 'Prix proposé invalide' USING ERRCODE = 'P0006';
  END IF;

  -- 1. Verrouiller la mission pour figer le quota de candidatures.
  SELECT max_applications, client_id INTO v_max_apps, v_client_id
  FROM public.missions
  WHERE id = p_mission_id AND status IN ('PUBLISHED','APPLICATIONS_OPEN')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cette mission n''accepte plus de candidatures' USING ERRCODE = 'P0002';
  END IF;

  IF v_client_id = v_user_id THEN
    RAISE EXCEPTION 'Vous ne pouvez pas postuler à votre propre mission' USING ERRCODE = 'P0007';
  END IF;

  SELECT count(*) INTO v_current_apps_cnt
  FROM public.mission_applications
  WHERE mission_id = p_mission_id;

  IF v_current_apps_cnt >= v_max_apps THEN
    PERFORM set_config('app.bypass_mission_guard', 'true', true);
    UPDATE public.missions SET status = 'APPLICATIONS_CLOSED', updated_at = now() WHERE id = p_mission_id;
    RAISE EXCEPTION 'Le quota de candidatures est déjà atteint pour cette mission' USING ERRCODE = 'P0003';
  END IF;

  -- 2. Verrouiller le portefeuille du candidat et vérifier le solde.
  SELECT id, balance INTO v_wallet_id, v_balance
  FROM public.credit_wallets
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_wallet_id IS NULL OR v_balance < 1 THEN
    RAISE EXCEPTION 'Solde de crédits insuffisant' USING ERRCODE = 'P0001';
  END IF;

  -- 3. Débiter le crédit et journaliser.
  UPDATE public.credit_wallets
    SET balance = balance - 1, updated_at = now()
    WHERE id = v_wallet_id;

  INSERT INTO public.credit_transactions (wallet_id, amount, type, mission_id)
    VALUES (v_wallet_id, -1, 'APPLICATION_FEE', p_mission_id);

  -- 4. Enregistrer la candidature (UNIQUE(mission_id, pro_id) fait échouer tout
  --    doublon, annulant alors toute la transaction, y compris le débit ci-dessus).
  INSERT INTO public.mission_applications (mission_id, pro_id, proposed_price, pitch)
    VALUES (p_mission_id, v_user_id, p_price, p_pitch)
    RETURNING id INTO v_app_id;

  -- 5. Si c'était la dernière place disponible, fermer la mission.
  IF (v_current_apps_cnt + 1) >= v_max_apps THEN
    PERFORM set_config('app.bypass_mission_guard', 'true', true);
    UPDATE public.missions SET status = 'APPLICATIONS_CLOSED', updated_at = now() WHERE id = p_mission_id;
  END IF;

  RETURN v_app_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_credit_for_application(uuid, integer, text) TO authenticated;

-- ── 11. Soupape de sortie : réouvrir une mission fermée sans candidat retenu ─
CREATE OR REPLACE FUNCTION public.reopen_mission_applications(p_mission_id uuid, p_extra_slots integer DEFAULT 2)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_extra_slots < 1 THEN
    RAISE EXCEPTION 'p_extra_slots doit être >= 1' USING ERRCODE = 'P0006';
  END IF;

  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET max_applications = max_applications + p_extra_slots,
        status = 'APPLICATIONS_OPEN',
        updated_at = now()
    WHERE id = p_mission_id
      AND client_id = auth.uid()
      AND status = 'APPLICATIONS_CLOSED';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable, non fermée aux candidatures, ou vous n''en êtes pas le client' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reopen_mission_applications(uuid, integer) TO authenticated;

-- ── 12. Remboursement des crédits pour une mission non résolue ─────────────
--      Recrédite chaque candidat PENDING. Appelée par process_expired_missions()
--      ci-dessous ou directement par un admin/job. Pas de GRANT à authenticated
--      : réservée au service role / propriétaire de la fonction (comme
--      expire_subscriptions() dans 20260823_monetization_phase1.sql).
CREATE OR REPLACE FUNCTION public.refund_credits_for_unresolved_mission(p_mission_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT ma.pro_id, cw.id AS wallet_id
    FROM public.mission_applications ma
    JOIN public.credit_wallets cw ON cw.user_id = ma.pro_id
    WHERE ma.mission_id = p_mission_id AND ma.status = 'PENDING'
    FOR UPDATE OF cw
  LOOP
    UPDATE public.credit_wallets SET balance = balance + 1, updated_at = now() WHERE id = r.wallet_id;
    INSERT INTO public.credit_transactions (wallet_id, amount, type, mission_id)
      VALUES (r.wallet_id, 1, 'REFUND', p_mission_id);
  END LOOP;
END;
$$;

-- SÉCURITÉ : par défaut Postgres accorde EXECUTE à PUBLIC sur toute nouvelle
-- fonction — sans ce REVOKE explicite, n'importe quel utilisateur authentifié
-- pourrait appeler cette fonction via /rest/v1/rpc et rembourser des crédits
-- arbitrairement. Même pattern que 20260709_security_lints_hardening.sql.
REVOKE EXECUTE ON FUNCTION public.refund_credits_for_unresolved_mission(uuid) FROM PUBLIC, anon, authenticated;

-- ── 13. Traitement des missions expirées (à planifier via pg_cron / endpoint,
--       même statut que expire_subscriptions() : fonction prête, non encore
--       ordonnancée automatiquement) ────────────────────────────────────────
--      Couvre les 3 cas d'angle mort identifiés en §5bis : mission CANCELLED
--      sans sélection, mission expirée (expires_at dépassé) sans candidat
--      retenu, ou bloquée en APPLICATIONS_CLOSED sans réouverture ni sélection
--      au-delà de expires_at.
CREATE OR REPLACE FUNCTION public.process_expired_missions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r record;
  n integer := 0;
BEGIN
  FOR r IN
    SELECT id FROM public.missions
    WHERE selected_pro_id IS NULL
      AND status IN ('PUBLISHED','APPLICATIONS_OPEN','APPLICATIONS_CLOSED')
      AND expires_at <= now()
    FOR UPDATE
  LOOP
    PERFORM public.refund_credits_for_unresolved_mission(r.id);

    PERFORM set_config('app.bypass_mission_guard', 'true', true);
    UPDATE public.missions SET status = 'EXPIRED', updated_at = now() WHERE id = r.id;

    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;

-- SÉCURITÉ : voir REVOKE de refund_credits_for_unresolved_mission ci-dessus —
-- même raison (fonction réservée au service role / job planifié).
REVOKE EXECUTE ON FUNCTION public.process_expired_missions() FROM PUBLIC, anon, authenticated;

-- ── 14. Crédit atomique du portefeuille suite à un paiement (webhook, service
--       role uniquement) — SÉCURITÉ : REVOKE explicite ci-dessous, sans quoi
--       PostgreSQL accorde EXECUTE à PUBLIC par défaut sur toute nouvelle
--       fonction et n'importe quel utilisateur authentifié pourrait appeler
--       cette RPC via /rest/v1/rpc pour fabriquer des crédits gratuitement. ──
--      Index unique partiel sur payment_id : un paiement ne peut créditer le
--      portefeuille qu'une seule fois, même si le webhook FedaPay est rejoué
--      en concurrence (cas réel : deux livraisons du même événement avant que
--      la première n'ait eu le temps de committer). Remplace un premier jet
--      côté Node (lecture-puis-écriture sur credit_wallets.balance) repéré en
--      auto-review comme non atomique — corrigé ici en verrouillant la ligne
--      (FOR UPDATE) et en s'appuyant sur cette contrainte pour l'idempotence,
--      au lieu d'un check-then-act côté application.
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_payment_unique
  ON public.credit_transactions (payment_id) WHERE payment_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.credit_wallet_for_payment(
  p_user_id    uuid,
  p_amount     integer,
  p_payment_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_wallet_id uuid;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'p_amount doit être positif' USING ERRCODE = 'P0006';
  END IF;

  -- Défense en profondeur : l'index unique partiel ne protège que les
  -- payment_id non NULL — sans cette vérification, un appelant pourrait
  -- passer payment_id NULL pour contourner l'idempotence (moins critique
  -- une fois le REVOKE ci-dessous en place, mais coûte une ligne).
  IF p_payment_id IS NULL THEN
    RAISE EXCEPTION 'p_payment_id est obligatoire' USING ERRCODE = 'P0006';
  END IF;

  SELECT id INTO v_wallet_id FROM public.credit_wallets WHERE user_id = p_user_id FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    INSERT INTO public.credit_wallets (user_id, balance) VALUES (p_user_id, 0)
      RETURNING id INTO v_wallet_id;
  END IF;

  UPDATE public.credit_wallets SET balance = balance + p_amount, updated_at = now() WHERE id = v_wallet_id;

  -- Si un appel concurrent a déjà journalisé ce paiement, cet INSERT échoue
  -- sur l'index unique (23505) et annule toute la transaction, y compris le
  -- crédit ci-dessus — le portefeuille n'est donc jamais crédité deux fois
  -- pour le même paiement.
  INSERT INTO public.credit_transactions (wallet_id, amount, type, payment_id)
    VALUES (v_wallet_id, p_amount, 'PURCHASE', p_payment_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.credit_wallet_for_payment(uuid, integer, uuid) FROM PUBLIC, anon, authenticated;

SELECT '✅ Moteur Missions Phase 1 prêt : credit_wallets, missions, mission_applications, credit_transactions, RLS, RPC.' AS status;
