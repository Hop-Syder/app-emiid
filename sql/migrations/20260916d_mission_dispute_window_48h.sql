/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Moteur Missions Courtes — raccourcit la fenêtre de recette /
 *              contestation client de 72h à 48h après livraison. Redéfinit
 *              mark_mission_delivered() : dernière version active en base
 *              étant celle de 20260915d_missions_engine_phase3_escrow.sql
 *              (garde séquestre incluse), on la reprend à l'identique ici,
 *              seul l'intervalle change. process_auto_release_missions() et
 *              open_mission_dispute() n'ont pas besoin d'être touchées : elles
 *              se contentent de comparer à auto_release_at / au statut
 *              DELIVERED, sans dépendre d'une durée codée en dur.
 * @created 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ──────────────────────────────────

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
        auto_release_at = now() + interval '48 hours',
        updated_at = now()
    WHERE id = p_mission_id;
END;
$$;
