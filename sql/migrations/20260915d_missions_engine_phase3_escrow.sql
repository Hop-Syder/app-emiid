-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Moteur Missions Courtes — Phase 3 (séquestre, version manuelle).
--  *              Décision actée avec l'utilisateur le 2026-09-15 : aucune API de
--  *              payout/virement sortant n'existe dans ce dépôt (FedaPay n'y sert
--  *              qu'à encaisser), et il n'y en aura PAS dans cette phase — le
--  *              reversement au prestataire se fait à la main, hors application
--  *              (Mobile Money direct par un humain). Cette migration ne fait que
--  *              tracer l'état du séquestre (payé / détenu / reversé) ; elle ne
--  *              déplace jamais d'argent elle-même.
--  *
--  *              HYPOTHÈSE DE CALCUL (à confirmer, pas une certitude métier) :
--  *              le client paie le prix proposé par le prestataire retenu +
--  *              les frais de séquestre (3-5%, escrow_fee_bps) ; EmiID garde ces
--  *              frais, le prestataire reçoit le prix plein lors du versement
--  *              manuel. C'est un choix parmi d'autres (l'alternative : les frais
--  *              sont prélevés sur ce que touche le prestataire) — docs/business-
--  *              plan-missions.md ne tranche pas explicitement ce point.
--  * @created 2026-09-15
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.mission_escrow_status AS ENUM ('NONE','PENDING_PAYMENT','HELD','RELEASED','REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS escrow_status public.mission_escrow_status NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS escrow_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS escrow_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS escrow_released_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS escrow_transaction_id uuid REFERENCES public.payment_transactions(id);

-- Redéfinit protect_mission_state_fields() (même fonction que dans
-- 20260915_missions_engine_phase1.sql) pour verrouiller aussi ces nouveaux
-- champs contre une écriture directe par le client — seules les RPC ci-dessous
-- (ou l'admin via release_mission_escrow) peuvent les modifier.
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
     OR NEW.escrow_status         IS DISTINCT FROM OLD.escrow_status
     OR NEW.escrow_paid_at        IS DISTINCT FROM OLD.escrow_paid_at
     OR NEW.escrow_released_at    IS DISTINCT FROM OLD.escrow_released_at
     OR NEW.escrow_released_by    IS DISTINCT FROM OLD.escrow_released_by
     OR NEW.escrow_transaction_id IS DISTINCT FROM OLD.escrow_transaction_id
  THEN
    RAISE EXCEPTION 'Ces champs ne peuvent être modifiés que via les fonctions dédiées (candidature, réouverture, sélection, livraison, séquestre)'
      USING ERRCODE = 'P0004';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'CANCELLED' THEN
    RAISE EXCEPTION 'Transition de statut non autorisée directement : % -> %', OLD.status, NEW.status
      USING ERRCODE = 'P0005';
  END IF;

  RETURN NEW;
END;
$$;

-- Redéfinit select_mission_applicant() (même fonction que dans
-- 20260915b_missions_engine_phase2_selection.sql) pour ouvrir le séquestre
-- (PENDING_PAYMENT) dès l'attribution si la mission en a un.
CREATE OR REPLACE FUNCTION public.select_mission_applicant(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_mission_id uuid;
  v_pro_id     uuid;
  v_client_id  uuid;
  v_status     public.mission_status;
  v_has_escrow boolean;
BEGIN
  SELECT ma.mission_id, ma.pro_id INTO v_mission_id, v_pro_id
  FROM public.mission_applications ma
  WHERE ma.id = p_application_id AND ma.status = 'PENDING'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Candidature introuvable ou déjà traitée' USING ERRCODE = 'P0002';
  END IF;

  SELECT client_id, status, has_escrow INTO v_client_id, v_status, v_has_escrow
  FROM public.missions
  WHERE id = v_mission_id
  FOR UPDATE;

  IF v_client_id IS NULL OR v_client_id <> auth.uid() THEN
    RAISE EXCEPTION 'Vous n''êtes pas le client de cette mission' USING ERRCODE = 'P0007';
  END IF;

  IF v_status NOT IN ('PUBLISHED','APPLICATIONS_OPEN','APPLICATIONS_CLOSED') THEN
    RAISE EXCEPTION 'Cette mission n''est plus au stade de la sélection' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.mission_applications SET status = 'ACCEPTED' WHERE id = p_application_id;
  UPDATE public.mission_applications SET status = 'REJECTED'
    WHERE mission_id = v_mission_id AND id <> p_application_id AND status = 'PENDING';

  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET status = 'ASSIGNED', selected_pro_id = v_pro_id, started_at = now(), updated_at = now(),
        escrow_status = CASE WHEN v_has_escrow THEN 'PENDING_PAYMENT' ELSE escrow_status END
    WHERE id = v_mission_id;
END;
$$;

-- Marque le séquestre comme détenu après paiement confirmé (appelée depuis le
-- webhook de paiement, service role uniquement — jamais par le client, sinon
-- il pourrait se déclarer "payé" sans avoir réellement payé). Idempotente par
-- p_transaction_id : un rejeu webhook pour le MÊME paiement est un no-op
-- silencieux, pas une erreur — même exigence de sûreté au rejeu que
-- credit_wallet_for_payment() dans 20260915_missions_engine_phase1.sql,
-- nécessaire pour pouvoir activer AVANT de marquer la transaction SUCCESS
-- côté Node (voir paymentController.ts).
CREATE OR REPLACE FUNCTION public.activate_mission_escrow(p_mission_id uuid, p_transaction_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status      public.mission_escrow_status;
  v_existing_tx uuid;
BEGIN
  SELECT escrow_status, escrow_transaction_id INTO v_status, v_existing_tx
  FROM public.missions WHERE id = p_mission_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable' USING ERRCODE = 'P0002';
  END IF;

  IF v_status = 'HELD' AND v_existing_tx = p_transaction_id THEN
    RETURN; -- déjà activé pour ce paiement précis : rejeu idempotent
  END IF;

  IF v_status <> 'PENDING_PAYMENT' THEN
    RAISE EXCEPTION 'Séquestre pas en attente de paiement (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET escrow_status = 'HELD',
        escrow_paid_at = now(),
        escrow_transaction_id = p_transaction_id,
        status = CASE WHEN status = 'ASSIGNED' THEN 'IN_PROGRESS'::public.mission_status ELSE status END,
        updated_at = now()
    WHERE id = p_mission_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_mission_escrow(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Démarrage officiel de la mission (ASSIGNED -> IN_PROGRESS) par le prestataire sélectionné.
-- Si un séquestre est configuré (has_escrow = true), le prestataire ne peut démarrer
-- que si les fonds sont effectivement détenus (escrow_status = 'HELD').
CREATE OR REPLACE FUNCTION public.start_mission_work(p_mission_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status        public.mission_status;
  v_has_escrow    boolean;
  v_escrow_status public.mission_escrow_status;
BEGIN
  SELECT status, has_escrow, escrow_status INTO v_status, v_has_escrow, v_escrow_status
  FROM public.missions
  WHERE id = p_mission_id AND selected_pro_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable ou vous n''êtes pas le prestataire sélectionné' USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> 'ASSIGNED' THEN
    RAISE EXCEPTION 'La mission doit être au statut ASSIGNED pour être démarrée (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  IF v_has_escrow AND v_escrow_status <> 'HELD' THEN
    RAISE EXCEPTION 'Le séquestre doit être approvisionné par le client avant de démarrer la prestation' USING ERRCODE = 'P0005';
  END IF;

  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET status = 'IN_PROGRESS',
        started_at = COALESCE(started_at, now()),
        updated_at = now()
    WHERE id = p_mission_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_mission_work(uuid) TO authenticated;

-- Redéfinit mark_mission_delivered() (même fonction que dans
-- 20260915c_missions_engine_phase3_lifecycle.sql) pour ajouter une défense en
-- profondeur : sans ce garde-fou, un prestataire pourrait ignorer
-- start_mission_work() et livrer directement depuis ASSIGNED, sans que le
-- client ait jamais payé le séquestre — la mission finirait COMPLETED (via
-- validation tacite à 72h) sans qu'aucun paiement n'ait eu lieu. La fonction
-- elle-même ne déplace pas d'argent (release_mission_escrow exige déjà
-- escrow_status = 'HELD'), mais laisser une mission se conclure sans paiement
-- alors qu'un séquestre était requis est un défaut de workflow à bloquer tôt.
CREATE OR REPLACE FUNCTION public.mark_mission_delivered(p_mission_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status        public.mission_status;
  v_has_escrow    boolean;
  v_escrow_status public.mission_escrow_status;
BEGIN
  SELECT status, has_escrow, escrow_status INTO v_status, v_has_escrow, v_escrow_status
  FROM public.missions
  WHERE id = p_mission_id AND selected_pro_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable ou vous n''êtes pas le prestataire sélectionné' USING ERRCODE = 'P0002';
  END IF;

  IF v_status NOT IN ('ASSIGNED','IN_PROGRESS') THEN
    RAISE EXCEPTION 'La mission doit être en cours pour être marquée livrée (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  IF v_has_escrow AND v_escrow_status <> 'HELD' THEN
    RAISE EXCEPTION 'Le séquestre doit être approvisionné par le client avant de livrer la prestation' USING ERRCODE = 'P0005';
  END IF;

  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET status = 'DELIVERED',
        delivered_at = now(),
        auto_release_at = now() + interval '72 hours',
        updated_at = now()
    WHERE id = p_mission_id;
END;
$$;

-- Enregistre le versement MANUEL (hors application) au prestataire, une fois
-- la mission COMPLETED. p_admin_id est journalisé pour traçabilité ; le
-- contrôle "l'appelant est bien admin" se fait côté Express (requireAdmin,
-- backend/src/controllers/paymentController.ts), pas ici — cette fonction
-- n'a aucun GRANT public, elle n'est atteignable qu'à travers cet endpoint
-- déjà protégé (service role uniquement, comme les autres fonctions internes
-- du moteur Missions).
CREATE OR REPLACE FUNCTION public.release_mission_escrow(p_mission_id uuid, p_admin_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status public.mission_status;
BEGIN
  SELECT status INTO v_status FROM public.missions WHERE id = p_mission_id AND escrow_status = 'HELD' FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable ou séquestre pas au statut HELD' USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> 'COMPLETED' THEN
    RAISE EXCEPTION 'La mission doit être COMPLETED avant de reverser le séquestre (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET escrow_status = 'RELEASED', escrow_released_at = now(), escrow_released_by = p_admin_id, updated_at = now()
    WHERE id = p_mission_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.release_mission_escrow(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Enregistre le remboursement MANUEL (hors application) du séquestre au client,
-- pour une mission annulée ou un litige résolu en faveur du client.
-- p_admin_id est journalisé pour traçabilité ; protégé par requireAdmin côté Express.
CREATE OR REPLACE FUNCTION public.refund_mission_escrow(p_mission_id uuid, p_admin_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status        public.mission_status;
  v_escrow_status public.mission_escrow_status;
BEGIN
  SELECT status, escrow_status INTO v_status, v_escrow_status
  FROM public.missions WHERE id = p_mission_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable' USING ERRCODE = 'P0002';
  END IF;

  IF v_escrow_status <> 'HELD' THEN
    RAISE EXCEPTION 'Le séquestre n''est pas au statut HELD (statut actuel : %)', v_escrow_status USING ERRCODE = 'P0005';
  END IF;

  IF v_status NOT IN ('CANCELLED', 'DISPUTED') THEN
    RAISE EXCEPTION 'La mission doit être annulée ou contestée pour rembourser le séquestre (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET escrow_status = 'REFUNDED',
        escrow_released_at = now(),
        escrow_released_by = p_admin_id,
        updated_at = now()
    WHERE id = p_mission_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refund_mission_escrow(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Arbitrage d'un litige (statut DISPUTED) par un administrateur.
-- Résolutions acceptées :
--   • 'RELEASE_TO_PRO' : travail jugé conforme -> passage à COMPLETED.
--                        L'admin pourra ensuite appeler release_mission_escrow().
--   • 'REFUND_CLIENT'  : le prestataire a failli -> passage à CANCELLED.
--                        Si un séquestre est HELD, passage à REFUNDED.
CREATE OR REPLACE FUNCTION public.resolve_mission_dispute(
  p_mission_id   uuid,
  p_resolution   text,
  p_admin_id     uuid,
  p_admin_notes  text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status        public.mission_status;
  v_has_escrow    boolean;
  v_escrow_status public.mission_escrow_status;
  v_client_id     uuid;
  v_pro_id        uuid;
  v_title         text;
BEGIN
  IF p_resolution NOT IN ('RELEASE_TO_PRO', 'REFUND_CLIENT') THEN
    RAISE EXCEPTION 'Résolution invalide : doit être RELEASE_TO_PRO ou REFUND_CLIENT' USING ERRCODE = 'P0006';
  END IF;

  SELECT status, has_escrow, escrow_status, client_id, selected_pro_id, title
    INTO v_status, v_has_escrow, v_escrow_status, v_client_id, v_pro_id, v_title
  FROM public.missions WHERE id = p_mission_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable' USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> 'DISPUTED' THEN
    RAISE EXCEPTION 'La mission doit être au statut DISPUTED pour être arbitrée (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  PERFORM set_config('app.bypass_mission_guard', 'true', true);

  IF p_resolution = 'RELEASE_TO_PRO' THEN
    UPDATE public.missions
      SET status = 'COMPLETED',
          updated_at = now()
      WHERE id = p_mission_id;
  ELSIF p_resolution = 'REFUND_CLIENT' THEN
    UPDATE public.missions
      SET status = 'CANCELLED',
          escrow_status = CASE WHEN v_escrow_status = 'HELD' THEN 'REFUNDED'::public.mission_escrow_status ELSE escrow_status END,
          escrow_released_at = CASE WHEN v_escrow_status = 'HELD' THEN now() ELSE escrow_released_at END,
          escrow_released_by = CASE WHEN v_escrow_status = 'HELD' THEN p_admin_id ELSE escrow_released_by END,
          updated_at = now()
      WHERE id = p_mission_id;
  END IF;

  -- Notifie les deux parties de l'issue de l'arbitrage — sans ça, ni le client
  -- ni le prestataire n'apprend jamais comment le litige a été tranché.
  INSERT INTO public.notifications (user_id, type, title, content, link, is_read)
  VALUES
    (v_client_id, 'mission_dispute_resolved',
     CASE WHEN p_resolution = 'RELEASE_TO_PRO' THEN 'Litige tranché en faveur du prestataire' ELSE 'Litige tranché en votre faveur' END,
     CASE WHEN p_resolution = 'RELEASE_TO_PRO'
       THEN 'Le litige sur la mission « ' || COALESCE(v_title, '') || ' » a été tranché : la prestation est jugée conforme.'
       ELSE 'Le litige sur la mission « ' || COALESCE(v_title, '') || ' » a été tranché en votre faveur' ||
            CASE WHEN v_escrow_status = 'HELD' THEN ' ; le séquestre vous sera remboursé.' ELSE '.' END
     END,
     '/missions/' || p_mission_id::text, false),
    (v_pro_id, 'mission_dispute_resolved',
     CASE WHEN p_resolution = 'RELEASE_TO_PRO' THEN 'Litige tranché en votre faveur' ELSE 'Litige tranché en faveur du client' END,
     CASE WHEN p_resolution = 'RELEASE_TO_PRO'
       THEN 'Le litige sur la mission « ' || COALESCE(v_title, '') || ' » a été tranché en votre faveur.'
       ELSE 'Le litige sur la mission « ' || COALESCE(v_title, '') || ' » a été tranché en faveur du client ; la mission est annulée.'
     END,
     '/missions/' || p_mission_id::text, false);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resolve_mission_dispute(uuid, text, uuid, text) FROM PUBLIC, anon, authenticated;

SELECT '✅ Moteur Missions Phase 3 (séquestre, cycle de vie, arbitrage litiges & remboursement) prêt.' AS status;
