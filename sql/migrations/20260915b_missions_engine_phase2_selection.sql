-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Moteur Missions Courtes — Phase 2 (sélection/attribution).
--  *              Le cadrage IA et les notifications sont traités côté
--  *              application (frontend-user/lib/mission-brief-assistant.ts,
--  *              même pattern que search-assistant.ts ; backend/src/api/routes/
--  *              webhookRoutes.ts, même pattern DB-webhook que messages/follows).
--  *              Cette migration ne couvre que la transition d'état "le client
--  *              choisit un candidat", qui doit rester atomique en base.
--  * @created 2026-09-15
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

-- Le client sélectionne un candidat parmi les mission_applications PENDING de
-- sa mission : la candidature choisie passe ACCEPTED, la mission passe ASSIGNED
-- (selected_pro_id + started_at), et toutes les autres candidatures PENDING de
-- cette mission passent REJECTED (aucun remboursement — le crédit a payé le
-- droit de candidater, pas une garantie de sélection ; cohérent avec
-- refund_credits_for_unresolved_mission, qui ne rembourse que si AUCUNE
-- sélection n'a jamais eu lieu).
CREATE OR REPLACE FUNCTION public.select_mission_applicant(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_mission_id uuid;
  v_pro_id     uuid;
  v_client_id  uuid;
  v_status     public.mission_status;
BEGIN
  SELECT ma.mission_id, ma.pro_id INTO v_mission_id, v_pro_id
  FROM public.mission_applications ma
  WHERE ma.id = p_application_id AND ma.status = 'PENDING'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Candidature introuvable ou déjà traitée' USING ERRCODE = 'P0002';
  END IF;

  SELECT client_id, status INTO v_client_id, v_status
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
    SET status = 'ASSIGNED', selected_pro_id = v_pro_id, started_at = now(), updated_at = now()
    WHERE id = v_mission_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.select_mission_applicant(uuid) TO authenticated;

SELECT '✅ Moteur Missions Phase 2 (sélection) prêt : select_mission_applicant().' AS status;
