-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Moteur Missions Courtes — Phase 3 (partie non-financière) :
--  *              cycle de vie ASSIGNED → DELIVERED → COMPLETED, avec fenêtre
--  *              de contestation de 72h et validation tacite automatique si le
--  *              client ne réagit pas (docs/business-plan-missions.md §4, point 6).
--  *
--  *              NE COUVRE PAS la collecte/le séquestre réel des fonds ni la
--  *              résolution des litiges (statut DISPUTED posé, mais aucune
--  *              fonction ne le résout) — ce sont des décisions produit/
--  *              financières qui restent à trancher avec l'utilisateur avant
--  *              d'écrire ce code (voir échange du 2026-09-15) :
--  *                - Comment les fonds du séquestre sont-ils réellement détenus
--  *                  et reversés au prestataire ? Aucune API de payout/transfert
--  *                  sortant n'existe dans ce dépôt (FedaPay n'y est utilisé
--  *                  qu'en encaissement entrant) — un versement manuel hors
--  *                  application (Mobile Money direct) est l'hypothèse la plus
--  *                  plausible pour cette phase, mais ce n'est qu'une hypothèse.
--  *                - Qui arbitre un DISPUTED, avec quelles règles (remboursement
--  *                  partiel ? total ? au prestataire malgré tout ?) ?
--  * @created 2026-09-15
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

-- Le prestataire sélectionné marque la mission comme livrée : ouvre la fenêtre
-- de 72h de contestation client (auto_release_at). Après ce délai sans
-- contestation ni confirmation, process_auto_release_missions() (ci-dessous)
-- valide tacitement.
CREATE OR REPLACE FUNCTION public.mark_mission_delivered(p_mission_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status public.mission_status;
BEGIN
  SELECT status INTO v_status
  FROM public.missions
  WHERE id = p_mission_id AND selected_pro_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable ou vous n''êtes pas le prestataire sélectionné' USING ERRCODE = 'P0002';
  END IF;

  IF v_status NOT IN ('ASSIGNED','IN_PROGRESS') THEN
    RAISE EXCEPTION 'La mission doit être en cours pour être marquée livrée (statut actuel : %)', v_status USING ERRCODE = 'P0005';
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

GRANT EXECUTE ON FUNCTION public.mark_mission_delivered(uuid) TO authenticated;

-- Le client confirme explicitement (avant l'échéance des 72h) que la
-- prestation est conforme.
CREATE OR REPLACE FUNCTION public.confirm_mission_completion(p_mission_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status public.mission_status;
BEGIN
  SELECT status INTO v_status
  FROM public.missions
  WHERE id = p_mission_id AND client_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable ou vous n''en êtes pas le client' USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> 'DELIVERED' THEN
    RAISE EXCEPTION 'La mission doit être au statut DELIVERED pour être confirmée (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET status = 'COMPLETED', client_confirmed_at = now(), updated_at = now()
    WHERE id = p_mission_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_mission_completion(uuid) TO authenticated;

-- Le client conteste dans la fenêtre de 72h : bloque la validation tacite.
-- N'ARBITRE RIEN — pose seulement le statut. La résolution (remboursement,
-- versement quand même, partage) n'est pas définie : décision produit à
-- prendre avec l'utilisateur avant d'écrire une fonction de résolution.
CREATE OR REPLACE FUNCTION public.open_mission_dispute(p_mission_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status public.mission_status;
BEGIN
  IF p_reason IS NULL OR char_length(trim(p_reason)) < 10 THEN
    RAISE EXCEPTION 'Un motif de contestation détaillé est requis' USING ERRCODE = 'P0006';
  END IF;

  SELECT status INTO v_status
  FROM public.missions
  WHERE id = p_mission_id AND client_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission introuvable ou vous n''en êtes pas le client' USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> 'DELIVERED' THEN
    RAISE EXCEPTION 'Seule une mission au statut DELIVERED peut être contestée (statut actuel : %)', v_status USING ERRCODE = 'P0005';
  END IF;

  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET status = 'DISPUTED', updated_at = now()
    WHERE id = p_mission_id;

  -- Notification à l'équipe : pas de table de tickets dédiée pour l'instant,
  -- journalisé comme notification admin (même table que les autres flux du
  -- moteur Missions) pour rester exploitable sans nouvelle infrastructure.
  INSERT INTO public.notifications (user_id, type, title, content, link, is_read)
  SELECT up.user_id, 'mission_dispute', 'Litige mission à arbitrer',
         'Mission ' || p_mission_id::text || ' contestée : ' || left(trim(p_reason), 200),
         '/admin/missions/' || p_mission_id::text, false
  FROM public.user_profiles up WHERE up.is_admin = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.open_mission_dispute(uuid, text) TO authenticated;

-- Validation tacite automatique : missions DELIVERED dont la fenêtre de 72h
-- est dépassée sans contestation ni confirmation explicite. À planifier via
-- pg_cron / endpoint (même statut "prêt mais non ordonnancé" que
-- expire_subscriptions() et process_expired_missions()).
CREATE OR REPLACE FUNCTION public.process_auto_release_missions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n integer;
BEGIN
  PERFORM set_config('app.bypass_mission_guard', 'true', true);
  UPDATE public.missions
    SET status = 'COMPLETED', client_confirmed_at = now(), updated_at = now()
    WHERE status = 'DELIVERED'
      AND auto_release_at IS NOT NULL
      AND auto_release_at <= now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

-- SÉCURITÉ : sans ce REVOKE explicite, PostgreSQL accorde EXECUTE à PUBLIC par
-- défaut sur toute nouvelle fonction — n'importe quel utilisateur authentifié
-- pourrait déclencher la validation tacite de missions à volonté via
-- /rest/v1/rpc. Réservée au service role / job planifié (voir aussi
-- 20260915_missions_engine_phase1.sql pour le même correctif).
REVOKE EXECUTE ON FUNCTION public.process_auto_release_missions() FROM PUBLIC, anon, authenticated;

SELECT '✅ Moteur Missions Phase 3 (cycle de vie, hors séquestre financier) prêt.' AS status;
