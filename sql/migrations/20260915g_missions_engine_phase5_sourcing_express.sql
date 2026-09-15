-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Moteur Missions Courtes — Phase 5, volet Sourcing Express B2B.
--  *              Une entreprise paie 15 000 FCFA, décrit un besoin, et un admin
--  *              sélectionne 3 profils vérifiés sous 24h. Réutilise FedaPay tel
--  *              quel (comme le reste du moteur Missions) — aucune nouvelle
--  *              intégration paiement.
--  *
--  *              HORS PÉRIMÈTRE DE CETTE PHASE (décision actée avec l'utilisateur
--  *              le 2026-09-15) : la bascule vers un déblocage AUTOMATIQUE du
--  *              séquestre n'est PAS construite ici — elle contredirait la
--  *              décision déjà prise en Phase 3 (aucune API de payout n'existe
--  *              dans ce dépôt ; "automatique" impliquerait un vrai virement
--  *              automatisé qu'on n'a pas). Les "comptes organisation" ne sont
--  *              pas non plus construits (aucune spec produit réelle).
--  * @created 2026-09-15
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

ALTER TYPE public.payment_type ADD VALUE IF NOT EXISTS 'SOURCING_EXPRESS';

DO $$ BEGIN
  CREATE TYPE public.sourcing_request_status AS ENUM ('PENDING_PAYMENT','PAID','FULFILLED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.sourcing_requests (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id            uuid NOT NULL REFERENCES auth.users(id),
  company_name            text,
  title                   text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  description             text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 5000),
  category                text,
  commune_id              uuid REFERENCES public.communes(id),
  status                  public.sourcing_request_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  payment_transaction_id  uuid REFERENCES public.payment_transactions(id),
  due_at                  timestamptz,
  fulfilled_at            timestamptz,
  fulfilled_by            uuid REFERENCES auth.users(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sourcing_requests_status ON public.sourcing_requests (status);
CREATE INDEX IF NOT EXISTS idx_sourcing_requests_requester ON public.sourcing_requests (requester_id);

CREATE TABLE IF NOT EXISTS public.sourcing_request_candidates (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sourcing_request_id  uuid NOT NULL REFERENCES public.sourcing_requests(id) ON DELETE CASCADE,
  profile_user_id      uuid NOT NULL REFERENCES auth.users(id),
  note                 text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sourcing_request_id, profile_user_id)
);

ALTER TABLE public.sourcing_requests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sourcing_request_candidates  ENABLE ROW LEVEL SECURITY;

-- Lecture : le demandeur sur sa propre demande, ou un admin.
DROP POLICY IF EXISTS "sourcing_requests_select" ON public.sourcing_requests;
CREATE POLICY "sourcing_requests_select" ON public.sourcing_requests
  FOR SELECT TO authenticated USING (
    auth.uid() = requester_id
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_admin = true)
  );

-- Création : état initial sain uniquement (pas de pré-remplissage PAID/FULFILLED).
DROP POLICY IF EXISTS "sourcing_requests_insert" ON public.sourcing_requests;
CREATE POLICY "sourcing_requests_insert" ON public.sourcing_requests
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = requester_id
    AND status = 'PENDING_PAYMENT'
    AND payment_transaction_id IS NULL
    AND fulfilled_at IS NULL
  );

-- Pas de politique UPDATE/DELETE pour authenticated : PAID (webhook) et
-- FULFILLED (admin) passent uniquement par les RPC SECURITY DEFINER
-- ci-dessous — même discipline que missions/mission_applications.

DROP POLICY IF EXISTS "sourcing_candidates_select" ON public.sourcing_request_candidates;
CREATE POLICY "sourcing_candidates_select" ON public.sourcing_request_candidates
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.sourcing_requests sr WHERE sr.id = sourcing_request_id AND sr.requester_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_admin = true)
  );

-- Active la demande après paiement confirmé (webhook, service role uniquement).
-- Idempotente par transaction_id : un rejeu webhook pour le MÊME paiement est
-- un no-op silencieux — même exigence que credit_wallet_for_payment() /
-- activate_mission_escrow() dans les migrations précédentes du moteur Missions.
CREATE OR REPLACE FUNCTION public.activate_sourcing_request(p_request_id uuid, p_transaction_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.sourcing_requests
    SET status = 'PAID', payment_transaction_id = p_transaction_id, due_at = now() + interval '24 hours', updated_at = now()
    WHERE id = p_request_id AND status = 'PENDING_PAYMENT';

  IF NOT FOUND THEN
    IF EXISTS (
      SELECT 1 FROM public.sourcing_requests
      WHERE id = p_request_id AND status = 'PAID' AND payment_transaction_id = p_transaction_id
    ) THEN
      RETURN; -- déjà activée pour ce paiement précis : rejeu idempotent
    END IF;
    RAISE EXCEPTION 'Demande introuvable ou déjà traitée' USING ERRCODE = 'P0002';
  END IF;

  -- Notifie tous les admins : la demande doit être pourvue (3 profils) sous 24h.
  INSERT INTO public.notifications (user_id, type, title, content, link, is_read)
  SELECT up.user_id, 'sourcing_request', 'Nouvelle demande Sourcing Express',
         'Une entreprise a payé pour un Sourcing Express — 3 profils vérifiés à proposer sous 24h.',
         '/admin/sourcing/' || p_request_id::text, false
  FROM public.user_profiles up WHERE up.is_admin = true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_sourcing_request(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Un admin pourvoit la demande avec exactement 3 profils distincts. Le
-- contrôle "l'appelant est bien admin" se fait côté Express (requireAdmin,
-- backend/src/controllers/paymentController.ts) — cette fonction n'a aucun
-- GRANT public, elle n'est atteignable qu'à travers cet endpoint déjà protégé.
CREATE OR REPLACE FUNCTION public.fulfill_sourcing_request(
  p_request_id   uuid,
  p_profile_ids  uuid[],
  p_admin_id     uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status         public.sourcing_request_status;
  v_requester_id   uuid;
  v_title          text;
  v_distinct_count integer;
BEGIN
  IF p_profile_ids IS NULL OR array_length(p_profile_ids, 1) <> 3 THEN
    RAISE EXCEPTION 'Exactement 3 profils sont requis' USING ERRCODE = 'P0006';
  END IF;

  SELECT count(DISTINCT x) INTO v_distinct_count FROM unnest(p_profile_ids) AS x;
  IF v_distinct_count <> 3 THEN
    RAISE EXCEPTION 'Les 3 profils doivent être distincts' USING ERRCODE = 'P0006';
  END IF;

  SELECT status, requester_id, title INTO v_status, v_requester_id, v_title
  FROM public.sourcing_requests WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande introuvable' USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> 'PAID' THEN
    RAISE EXCEPTION 'La demande doit être au statut PAID pour être pourvue (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  INSERT INTO public.sourcing_request_candidates (sourcing_request_id, profile_user_id)
  SELECT p_request_id, x FROM unnest(p_profile_ids) AS x;

  UPDATE public.sourcing_requests
    SET status = 'FULFILLED', fulfilled_at = now(), fulfilled_by = p_admin_id, updated_at = now()
    WHERE id = p_request_id;

  INSERT INTO public.notifications (user_id, type, title, content, link, is_read)
  VALUES (
    v_requester_id, 'sourcing_fulfilled', 'Vos 3 profils Sourcing Express sont prêts',
    'Votre demande « ' || COALESCE(v_title, '') || ' » a été pourvue avec 3 profils vérifiés.',
    '/sourcing/' || p_request_id::text, false
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.fulfill_sourcing_request(uuid, uuid[], uuid) FROM PUBLIC, anon, authenticated;

-- Un admin peut annuler une demande payée mais jamais pourvue (ex. besoin
-- retiré par le client, délai dépassé sans profil disponible) — sans ça,
-- CANCELLED n'est atteignable qu'à la création (avant paiement), jamais après.
CREATE OR REPLACE FUNCTION public.cancel_sourcing_request(p_request_id uuid, p_admin_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status public.sourcing_request_status;
  v_requester_id uuid;
  v_title text;
BEGIN
  SELECT status, requester_id, title INTO v_status, v_requester_id, v_title
  FROM public.sourcing_requests WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande introuvable' USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> 'PAID' THEN
    RAISE EXCEPTION 'Seule une demande PAID peut être annulée (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  UPDATE public.sourcing_requests
    SET status = 'CANCELLED', updated_at = now()
    WHERE id = p_request_id;

  INSERT INTO public.notifications (user_id, type, title, content, link, is_read)
  VALUES (
    v_requester_id, 'sourcing_cancelled', 'Demande Sourcing Express annulée',
    'Votre demande « ' || COALESCE(v_title, '') || ' » a été annulée. Contactez le support pour un remboursement.',
    '/sourcing/' || p_request_id::text, false
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_sourcing_request(uuid, uuid) FROM PUBLIC, anon, authenticated;

SELECT '✅ Moteur Missions Phase 5 — Sourcing Express B2B prêt.' AS status;
