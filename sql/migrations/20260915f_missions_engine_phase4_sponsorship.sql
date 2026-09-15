-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Moteur Missions Courtes — Phase 4 (Parrainage à engagement partagé).
--  *              Met en œuvre la règle des 2 manquements (strikes) :
--  *                1. Un parrain (professionnel vérifié, trust_tier >= 2) peut parrainer
--  *                   un confrère (filleul). Un filleul ne peut avoir qu'un seul parrain actif.
--  *                2. Tout manquement grave d'un filleul sur une mission (litige avéré,
--  *                   abandon, malfaçon) est tracé dans sponsorship_strikes par un admin.
--  *                3. RÈGLE DES 2 MANQUEMENTS : dès le 2e strike, le parrainage du filleul
--  *                   est révoqué (REVOKED).
--  *                4. ENGAGEMENT PARTAGÉ (SANCTION PARRAIN) : le parrain qui cautionne
--  *                   des professionnels défaillants voit son compteur de pénalités
--  *                   incrémenté. Au 2e filleul révoqué, le parrain subit une rétrogradation
--  *                   de son propre palier de confiance (trust_tier - 1).
--  * @created 2026-09-15
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

-- ── 1. Colonne de traçabilité des pénalités parrain sur user_profiles ────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS sponsorship_penalty_count smallint NOT NULL DEFAULT 0 CHECK (sponsorship_penalty_count >= 0);

-- Redéfinit recompute_trust_tier() (même fonction que dans
-- 20260915e_missions_engine_phase4_trust_tiers.sql) pour intégrer la pénalité
-- de parrainage. CORRECTIF (auto-review) : la première version de ce fichier
-- appliquait la rétrogradation directement via un UPDATE trust_tier séparé
-- dans record_sponsorship_strike() — mais recompute_trust_tier() recalcule le
-- palier ENTIÈREMENT à partir des signaux (téléphone/identité/documents/avis)
-- à chaque déclencheur (nouveau document approuvé, nouvel avis...), donc ce
-- deuxième point d'écriture aurait silencieusement effacé la pénalité au
-- prochain recalcul. Une seule fonction doit rester la source de vérité du
-- palier : la pénalité y est maintenant lue et appliquée à chaque calcul, pas
-- seulement au moment du 2e manquement — 1 palier de moins tous les 2
-- pénalités, cumulatif et permanent tant que sponsorship_penalty_count reste
-- élevé (pas de "réhabilitation" automatique : décision produit à revoir).
CREATE OR REPLACE FUNCTION public.recompute_trust_tier(p_user_id uuid)
RETURNS smallint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_phone_verified    boolean;
  v_identity_verified boolean;
  v_business_doc_ok   boolean;
  v_completed_count   integer;
  v_avg_rating        numeric;
  v_penalty_count     smallint;
  v_tier              smallint := 0;
BEGIN
  SELECT phone_verified, identity_verified, COALESCE(sponsorship_penalty_count, 0)
    INTO v_phone_verified, v_identity_verified, v_penalty_count
  FROM public.user_profiles WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.verification_documents
    WHERE user_id = p_user_id AND status = 'approved' AND doc_type IN ('registre','ifu','atelier')
  ) INTO v_business_doc_ok;

  SELECT count(*), COALESCE(AVG(rating), 0) INTO v_completed_count, v_avg_rating
  FROM public.mission_reviews WHERE pro_id = p_user_id;

  IF COALESCE(v_phone_verified, false) THEN v_tier := 1; END IF;
  IF v_tier >= 1 AND COALESCE(v_identity_verified, false) THEN v_tier := 2; END IF;
  IF v_tier >= 2 AND v_business_doc_ok THEN v_tier := 3; END IF;
  IF v_tier >= 3 AND v_completed_count >= 3 AND v_avg_rating >= 4.5 THEN v_tier := 4; END IF;
  IF v_tier >= 4 AND v_completed_count >= 10 AND v_avg_rating >= 4.5 THEN v_tier := 5; END IF;

  -- Engagement partagé : 1 palier de moins tous les 2 filleuls révoqués.
  v_tier := GREATEST(0, v_tier - (v_penalty_count / 2));

  UPDATE public.user_profiles SET trust_tier = v_tier, updated_at = now() WHERE user_id = p_user_id;
  RETURN v_tier;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recompute_trust_tier(uuid) FROM PUBLIC, anon, authenticated;

-- ── 2. Table des parrainages ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sponsorships (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsored_id        uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status              text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED','SUSPENDED')),
  strikes_count       smallint NOT NULL DEFAULT 0 CHECK (strikes_count >= 0),
  revoked_at          timestamptz,
  revocation_reason   text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_referrer_differs CHECK (referrer_id <> sponsored_id)
);

CREATE INDEX IF NOT EXISTS idx_sponsorships_referrer ON public.sponsorships (referrer_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_sponsored ON public.sponsorships (sponsored_id);

-- ── 3. Table des manquements (strikes) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sponsorship_strikes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsorship_id  uuid NOT NULL REFERENCES public.sponsorships(id) ON DELETE CASCADE,
  sponsored_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id      uuid REFERENCES public.missions(id) ON DELETE SET NULL,
  reason          text NOT NULL CHECK (char_length(btrim(reason)) >= 10),
  recorded_by     uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsorship_strikes_sponsorship ON public.sponsorship_strikes (sponsorship_id);

-- ── 4. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.sponsorships         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_strikes ENABLE ROW LEVEL SECURITY;

-- Lecture publique des parrainages actifs (gage de crédibilité affichable sur le profil).
DROP POLICY IF EXISTS "sponsorships_select_public" ON public.sponsorships;
CREATE POLICY "sponsorships_select_public" ON public.sponsorships
  FOR SELECT USING (true);

-- Lecture des strikes : réservée au parrain, au filleul concerné, et aux administrateurs.
DROP POLICY IF EXISTS "sponsorship_strikes_select_participants" ON public.sponsorship_strikes;
CREATE POLICY "sponsorship_strikes_select_participants" ON public.sponsorship_strikes
  FOR SELECT TO authenticated USING (
    auth.uid() = sponsored_id
    OR EXISTS (SELECT 1 FROM public.sponsorships s WHERE s.id = sponsorship_id AND s.referrer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_admin = true)
  );

-- ── 5. RPC : Un parrain co-opte un confrère ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.sponsor_professional(p_sponsored_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_referrer_id    uuid := auth.uid();
  v_ref_tier       smallint;
  v_ref_penalties  smallint;
  v_sponsorship_id uuid;
BEGIN
  IF v_referrer_id IS NULL THEN
    RAISE EXCEPTION 'Authentification requise' USING ERRCODE = 'P0001';
  END IF;

  IF v_referrer_id = p_sponsored_id THEN
    RAISE EXCEPTION 'Vous ne pouvez pas vous parrainer vous-même' USING ERRCODE = 'P0007';
  END IF;

  -- Le parrain doit être au moins Palier 2 (identité vérifiée) et ne pas être saturé de pénalités.
  SELECT trust_tier, sponsorship_penalty_count INTO v_ref_tier, v_ref_penalties
  FROM public.user_profiles
  WHERE user_id = v_referrer_id;

  IF NOT FOUND OR v_ref_tier < 2 THEN
    RAISE EXCEPTION 'Vous devez avoir atteint au moins le Palier 2 (identité vérifiée) pour parrainer un professionnel'
      USING ERRCODE = 'P0005';
  END IF;

  IF v_ref_penalties >= 2 THEN
    RAISE EXCEPTION 'Vos droits de parrainage sont suspendus suite à des manquements répétés de vos filleuls'
      USING ERRCODE = 'P0005';
  END IF;

  -- Vérifier que le filleul existe.
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = p_sponsored_id) THEN
    RAISE EXCEPTION 'Profil du filleul introuvable' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.sponsorships (referrer_id, sponsored_id, status)
  VALUES (v_referrer_id, p_sponsored_id, 'ACTIVE')
  RETURNING id INTO v_sponsorship_id;

  RETURN v_sponsorship_id;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'Ce professionnel bénéficie déjà d''un parrainage enregistré' USING ERRCODE = '23505';
END;
$$;

GRANT EXECUTE ON FUNCTION public.sponsor_professional(uuid) TO authenticated;

-- ── 6. RPC Admin : Enregistrement d'un manquement (Strike) ────────────────────
--      Règle des 2 manquements : au 2e strike, révocation du parrainage et
--      pénalité sur l'engagement partagé du parrain.
CREATE OR REPLACE FUNCTION public.record_sponsorship_strike(
  p_sponsored_id uuid,
  p_mission_id   uuid,
  p_reason       text,
  p_admin_id     uuid
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sponsorship_id   uuid;
  v_referrer_id      uuid;
  v_current_strikes  smallint;
  v_new_strikes      smallint;
  v_parrain_penalties smallint;
  v_revoked          boolean := false;
  v_parrain_penalized boolean := false;
BEGIN
  IF p_reason IS NULL OR char_length(btrim(p_reason)) < 10 THEN
    RAISE EXCEPTION 'Un motif de manquement détaillé (au moins 10 caractères) est requis' USING ERRCODE = 'P0006';
  END IF;

  SELECT id, referrer_id, strikes_count INTO v_sponsorship_id, v_referrer_id, v_current_strikes
  FROM public.sponsorships
  WHERE sponsored_id = p_sponsored_id AND status = 'ACTIVE'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aucun parrainage actif trouvé pour ce professionnel' USING ERRCODE = 'P0002';
  END IF;

  v_new_strikes := v_current_strikes + 1;

  INSERT INTO public.sponsorship_strikes (sponsorship_id, sponsored_id, mission_id, reason, recorded_by)
  VALUES (v_sponsorship_id, p_sponsored_id, p_mission_id, trim(p_reason), p_admin_id);

  UPDATE public.sponsorships
  SET strikes_count = v_new_strikes, updated_at = now()
  WHERE id = v_sponsorship_id;

  -- Règle des 2 manquements : révocation automatique
  IF v_new_strikes >= 2 THEN
    v_revoked := true;
    UPDATE public.sponsorships
    SET status = 'REVOKED', revoked_at = now(), revocation_reason = trim(p_reason), updated_at = now()
    WHERE id = v_sponsorship_id;

    -- Sanction d'engagement partagé sur le parrain : incrémente le compteur,
    -- puis délègue le recalcul du palier à recompute_trust_tier() (seule
    -- source de vérité — voir le correctif documenté plus haut dans ce
    -- fichier). v_parrain_penalized reflète si CE strike vient de faire
    -- franchir un palier de pénalité (tous les 2 filleuls révoqués).
    UPDATE public.user_profiles
    SET sponsorship_penalty_count = sponsorship_penalty_count + 1, updated_at = now()
    WHERE user_id = v_referrer_id
    RETURNING sponsorship_penalty_count INTO v_parrain_penalties;

    v_parrain_penalized := (v_parrain_penalties % 2 = 0);
    PERFORM public.recompute_trust_tier(v_referrer_id);

    -- Notification in-app pour le parrain — message différent si son propre
    -- palier vient d'être rétrogradé (2e filleul révoqué), pour que la
    -- conséquence de l'engagement partagé soit explicite, pas juste devinée.
    INSERT INTO public.notifications (user_id, type, title, content, link, is_read)
    VALUES (
      v_referrer_id,
      'sponsorship_alert',
      'Parrainage révoqué pour manquement',
      CASE WHEN v_parrain_penalized
        THEN 'Votre filleul a atteint 2 manquements et son parrainage est révoqué. En vertu de l''engagement partagé, votre propre palier de confiance vient d''être rétrogradé (2e filleul révoqué).'
        ELSE 'Votre filleul a atteint 2 manquements. En vertu de l''engagement partagé, ce parrainage est révoqué.'
      END,
      '/profil/parametres',
      false
    );
  END IF;

  RETURN jsonb_build_object(
    'sponsorship_id', v_sponsorship_id,
    'strikes_count', v_new_strikes,
    'is_revoked', v_revoked,
    'parrain_penalized', v_parrain_penalized
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_sponsorship_strike(uuid, uuid, text, uuid) FROM PUBLIC, anon, authenticated;

SELECT '✅ Moteur Missions Phase 4 (Parrainage à engagement partagé & strikes) prêt.' AS status;
