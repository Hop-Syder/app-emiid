-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Moteur Missions Courtes — Phase 4 (paliers de confiance 0-5).
--  *              Branché sur le système de vérification RÉEL déjà en place
--  *              (vérifié en base, pas deviné) : user_profiles.phone_verified,
--  *              user_profiles.identity_verified, verification_documents
--  *              (doc_type cni/cip/passeport/ifu/registre/atelier, status
--  *              pending/approved/rejected). Aucune de ces colonnes n'était
--  *              mentionnée précisément dans docs/business-plan-missions.md —
--  *              qui ne parlait que de "pin_reset_verifications,
--  *              is_admin_authorization" (des exemples, pas la bonne table).
--  *
--  *              MANQUE COMBLÉ : aucune table d'avis liée à une mission
--  *              n'existait (profile_reviews est un avis généraliste de
--  *              profil, jamais rattaché à une mission précise) — impossible
--  *              de vérifier "missions tests notées ≥ 4,5/5" sans elle. Ajout
--  *              de mission_reviews, un avis par mission COMPLETED, posé par
--  *              le client.
--  *
--  *              HYPOTHÈSES DE CALIBRAGE (à ajuster librement, ce sont de
--  *              simples constantes SQL, pas des décisions structurantes) :
--  *                Palier 1 : téléphone vérifié
--  *                Palier 2 : identité vérifiée (CNI/CIP/passeport approuvé)
--  *                Palier 3 : document professionnel approuvé (registre/IFU/atelier)
--  *                Palier 4 : ≥ 3 missions complétées, note moyenne ≥ 4,5
--  *                Palier 5 : ≥ 10 missions complétées, note moyenne ≥ 4,5
--  *              Progression strictement séquentielle (palier N exige palier
--  *              N-1). Recalcul automatique par trigger — jamais posé à la main.
--  * @created 2026-09-15
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  */
-- ──────────────────────────────────

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS trust_tier smallint NOT NULL DEFAULT 0 CHECK (trust_tier BETWEEN 0 AND 5);

-- ── Avis de mission (un par mission COMPLETED, posé par le client) ─────────
CREATE TABLE IF NOT EXISTS public.mission_reviews (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL UNIQUE REFERENCES public.missions(id) ON DELETE CASCADE,
  client_id  uuid NOT NULL REFERENCES auth.users(id),
  pro_id     uuid NOT NULL REFERENCES auth.users(id),
  rating     smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    text CHECK (comment IS NULL OR char_length(btrim(comment)) BETWEEN 10 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mission_reviews_pro ON public.mission_reviews (pro_id);

ALTER TABLE public.mission_reviews ENABLE ROW LEVEL SECURITY;

-- Public : les avis de mission sont un signal de confiance, comme profile_reviews.
DROP POLICY IF EXISTS "mission_reviews_select_public" ON public.mission_reviews;
CREATE POLICY "mission_reviews_select_public" ON public.mission_reviews
  FOR SELECT USING (true);

-- Le client ne peut noter que SA mission, une fois COMPLETED, et seulement le
-- prestataire réellement sélectionné (UNIQUE(mission_id) empêche un doublon).
-- Pas de politique UPDATE/DELETE : un avis posté est définitif (même logique
-- de rigueur que les autres systèmes d'avis de ce projet).
DROP POLICY IF EXISTS "mission_reviews_insert_client" ON public.mission_reviews;
CREATE POLICY "mission_reviews_insert_client" ON public.mission_reviews
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1 FROM public.missions m
      WHERE m.id = mission_id AND m.client_id = auth.uid()
        AND m.status = 'COMPLETED' AND m.selected_pro_id = pro_id
    )
  );

-- ── Calcul du palier (0-5), toujours dérivé — jamais éditable à la main ────
CREATE OR REPLACE FUNCTION public.recompute_trust_tier(p_user_id uuid)
RETURNS smallint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_phone_verified    boolean;
  v_identity_verified boolean;
  v_business_doc_ok   boolean;
  v_completed_count   integer;
  v_avg_rating        numeric;
  v_tier              smallint := 0;
BEGIN
  SELECT phone_verified, identity_verified INTO v_phone_verified, v_identity_verified
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

  UPDATE public.user_profiles SET trust_tier = v_tier, updated_at = now() WHERE user_id = p_user_id;
  RETURN v_tier;
END;
$$;

-- SÉCURITÉ : réservée aux triggers ci-dessous (contexte propriétaire) — sans
-- ce REVOKE, n'importe quel utilisateur authentifié pourrait déclencher un
-- recalcul de palier pour n'importe qui via /rest/v1/rpc (inoffensif en soi
-- puisque déterministe et sans paramètre libre, mais aucune raison de
-- l'exposer : même discipline que le reste du moteur Missions).
REVOKE EXECUTE ON FUNCTION public.recompute_trust_tier(uuid) FROM PUBLIC, anon, authenticated;

-- Déclencheurs : le palier se recalcule tout seul quand un des signaux change.
CREATE OR REPLACE FUNCTION public.trg_trust_tier_from_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recompute_trust_tier(NEW.pro_id);
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.trg_trust_tier_from_review() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_recompute_trust_tier_review ON public.mission_reviews;
CREATE TRIGGER trg_recompute_trust_tier_review
  AFTER INSERT ON public.mission_reviews
  FOR EACH ROW EXECUTE FUNCTION public.trg_trust_tier_from_review();

CREATE OR REPLACE FUNCTION public.trg_trust_tier_from_docs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN
    PERFORM public.recompute_trust_tier(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.trg_trust_tier_from_docs() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_recompute_trust_tier_docs ON public.verification_documents;
CREATE TRIGGER trg_recompute_trust_tier_docs
  AFTER INSERT OR UPDATE ON public.verification_documents
  FOR EACH ROW EXECUTE FUNCTION public.trg_trust_tier_from_docs();

-- Trigger scopé aux colonnes phone_verified/identity_verified : ne se
-- redéclenche jamais sur le propre UPDATE de trust_tier fait ci-dessus
-- (recompute_trust_tier ne touche pas ces deux colonnes) — pas de boucle.
CREATE OR REPLACE FUNCTION public.trg_trust_tier_from_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.phone_verified IS DISTINCT FROM OLD.phone_verified
     OR NEW.identity_verified IS DISTINCT FROM OLD.identity_verified THEN
    PERFORM public.recompute_trust_tier(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.trg_trust_tier_from_profile() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_recompute_trust_tier_profile ON public.user_profiles;
CREATE TRIGGER trg_recompute_trust_tier_profile
  AFTER UPDATE OF phone_verified, identity_verified ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_trust_tier_from_profile();

SELECT '✅ Moteur Missions Phase 4 (paliers de confiance) prêt : trust_tier, mission_reviews, recalcul automatique.' AS status;
