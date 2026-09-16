/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Moteur Missions Courtes — permet au candidat de modifier son
 *              offre (prix/pitch) ou de retirer sa candidature tant qu'elle
 *              est PENDING. Le retrait recrédite le crédit consommé, même
 *              logique de journalisation que refund_credits_for_unresolved_mission()
 *              (sql/migrations/20260915_missions_engine_phase1.sql).
 * @created 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ──────────────────────────────────

-- ── 1. Modifier son offre ───────────────────────────────────────────────
--      Restreint à PENDING : une candidature ACCEPTED est déjà engagée dans
--      le cycle de vie de la mission (prix figé pour le séquestre), une
--      REJECTED n'a plus lieu d'être éditée. Le statut de la mission n'a pas
--      besoin d'être revérifié séparément : select_mission_applicant() passe
--      immédiatement les candidatures perdantes à REJECTED dès la sélection
--      (20260915d_missions_engine_phase3_escrow.sql), donc PENDING implique
--      déjà que la mission est encore au stade de la sélection.
CREATE OR REPLACE FUNCTION public.update_mission_application(
  p_application_id uuid,
  p_price          integer,
  p_pitch          text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_price < 0 THEN
    RAISE EXCEPTION 'Prix proposé invalide' USING ERRCODE = 'P0006';
  END IF;

  UPDATE public.mission_applications
    SET proposed_price = p_price,
        pitch = p_pitch
    WHERE id = p_application_id
      AND pro_id = auth.uid()
      AND status = 'PENDING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Candidature introuvable, déjà traitée, ou vous n''en êtes pas l''auteur' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_mission_application(uuid, integer, text) TO authenticated;

-- ── 2. Retirer sa candidature (recrédite le crédit consommé) ───────────────
--      Garde explicite sur le statut de la MISSION (contrairement à l'édition
--      ci-dessus) : après expiration, refund_credits_for_unresolved_mission()
--      recrédite déjà chaque candidature PENDING sans jamais changer son
--      statut (process_expired_missions(), même fichier que consume_credit_-
--      for_application) — sans cette garde, un candidat pourrait appeler ce
--      retrait sur une mission EXPIRED déjà remboursée et être recrédité une
--      seconde fois. On n'autorise donc le retrait que tant que la mission
--      est encore réellement au stade des candidatures.
CREATE OR REPLACE FUNCTION public.withdraw_mission_application(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_mission_id  uuid;
  v_wallet_id   uuid;
  v_status      public.mission_status;
  v_max_apps    integer;
  v_apps_left   integer;
BEGIN
  DELETE FROM public.mission_applications
    WHERE id = p_application_id
      AND pro_id = auth.uid()
      AND status = 'PENDING'
    RETURNING mission_id INTO v_mission_id;

  IF v_mission_id IS NULL THEN
    RAISE EXCEPTION 'Candidature introuvable, déjà traitée, ou vous n''en êtes pas l''auteur' USING ERRCODE = 'P0002';
  END IF;

  SELECT status, max_applications INTO v_status, v_max_apps
  FROM public.missions
  WHERE id = v_mission_id
  FOR UPDATE;

  IF v_status NOT IN ('PUBLISHED','APPLICATIONS_OPEN','APPLICATIONS_CLOSED') THEN
    RAISE EXCEPTION 'Cette mission n''est plus au stade des candidatures' USING ERRCODE = 'P0002';
  END IF;

  -- Recrédite le portefeuille du candidat.
  SELECT id INTO v_wallet_id FROM public.credit_wallets WHERE user_id = auth.uid() FOR UPDATE;

  IF v_wallet_id IS NOT NULL THEN
    UPDATE public.credit_wallets SET balance = balance + 1, updated_at = now() WHERE id = v_wallet_id;
    INSERT INTO public.credit_transactions (wallet_id, amount, type, mission_id)
      VALUES (v_wallet_id, 1, 'REFUND', v_mission_id);
  END IF;

  -- Une place vient de se libérer : si la mission avait été fermée par
  -- atteinte du quota, on la rouvre automatiquement (même intention que
  -- reopen_mission_applications(), mais implicite ici, sans action du client).
  IF v_status = 'APPLICATIONS_CLOSED' THEN
    SELECT count(*) INTO v_apps_left FROM public.mission_applications WHERE mission_id = v_mission_id;
    IF v_apps_left < v_max_apps THEN
      PERFORM set_config('app.bypass_mission_guard', 'true', true);
      UPDATE public.missions SET status = 'APPLICATIONS_OPEN', updated_at = now() WHERE id = v_mission_id;
    END IF;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.withdraw_mission_application(uuid) TO authenticated;
