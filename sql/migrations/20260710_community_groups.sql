-- ════════════════════════════════════════════════════════════════════════════
--  GROUPES DE DISCUSSION COMMUNAUTAIRES & BADGES — Schéma de messagerie générique
--
--  Additif et NON destructif : les DM binaires (participant1/2_id) continuent de
--  fonctionner ; ils sont rétro-remplis dans le nouveau modèle de participants.
--
--  Phasage (déployable en une fois, mais l'EXPOSITION des badges est Phase 2) :
--    • Phase 1 : conversations génériques + conversation_participants + backfill + RLS
--    • Phase 2 : badges communautaires (fonctions + vue annuaire des communautés)
--    • Phase 3 : vérification EmiID (is_verified) + modération (content_reports 'room')
--  À exécuter dans le SQL Editor Supabase. Idempotent.
-- ════════════════════════════════════════════════════════════════════════════


-- ══════════════════ PHASE 1 — MESSAGERIE GÉNÉRIQUE ══════════════════════════

-- ─── 1.1 Généraliser la table conversations ────────────────────────────────
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS is_group     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS name         text,
  ADD COLUMN IF NOT EXISTS description  text,
  ADD COLUMN IF NOT EXISTS avatar_url   text,
  ADD COLUMN IF NOT EXISTS created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Communauté / badge
  ADD COLUMN IF NOT EXISTS is_community boolean NOT NULL DEFAULT false,  -- génère un badge public
  ADD COLUMN IF NOT EXISTS is_verified  boolean NOT NULL DEFAULT false,  -- validé par EmiID (institution officielle)
  ADD COLUMN IF NOT EXISTS badge_style  text,                            -- preset contrôlé (pas de free-form)
  ADD COLUMN IF NOT EXISTS join_policy  text NOT NULL DEFAULT 'invite',  -- invite | request | open
  ADD COLUMN IF NOT EXISTS slug         text,                            -- lien public / annuaire des communautés
  ADD COLUMN IF NOT EXISTS member_count integer NOT NULL DEFAULT 0;      -- dénormalisé (maj par trigger)

-- Les groupes n'ont pas de participant1/2 → on rend ces colonnes nullables (legacy DM only)
ALTER TABLE public.conversations ALTER COLUMN participant1_id DROP NOT NULL;
ALTER TABLE public.conversations ALTER COLUMN participant2_id DROP NOT NULL;

-- Contraintes de domaine (idempotentes)
DO $$ BEGIN
  ALTER TABLE public.conversations ADD CONSTRAINT conversations_join_policy_chk
    CHECK (join_policy IN ('invite','request','open'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.conversations ADD CONSTRAINT conversations_badge_style_chk
    CHECK (badge_style IS NULL OR badge_style IN ('blue','cyan','navy','emerald','amber','violet','rose','slate'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS conversations_slug_uidx
  ON public.conversations (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS conversations_community_idx
  ON public.conversations (is_community) WHERE is_community = true;


-- ─── 1.2 Table de jonction : conversation_participants ──────────────────────
--     Remplace participant1/2_id. Un DM = un groupe à 2 (is_group=false).
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member'  CHECK (role   IN ('owner','admin','member')),
  status          text NOT NULL DEFAULT 'joined'  CHECK (status IN ('invited','requested','joined','banned','left')),
  show_on_profile boolean NOT NULL DEFAULT true,   -- opt-out membre : afficher le badge sur SA carte
  last_read_at    timestamptz,                     -- lecture par participant (remplace messages.is_read en groupe)
  invited_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS cp_user_joined_idx  ON public.conversation_participants (user_id) WHERE status = 'joined';
CREATE INDEX IF NOT EXISTS cp_conversation_idx ON public.conversation_participants (conversation_id);
CREATE INDEX IF NOT EXISTS cp_status_idx       ON public.conversation_participants (conversation_id, status);


-- ─── 1.3 Backfill : injecter les 2 participants de chaque DM existant ───────
INSERT INTO public.conversation_participants (conversation_id, user_id, role, status, joined_at)
SELECT id, participant1_id, 'member', 'joined', COALESCE(created_at, now())
FROM public.conversations WHERE participant1_id IS NOT NULL
ON CONFLICT (conversation_id, user_id) DO NOTHING;

INSERT INTO public.conversation_participants (conversation_id, user_id, role, status, joined_at)
SELECT id, participant2_id, 'member', 'joined', COALESCE(created_at, now())
FROM public.conversations WHERE participant2_id IS NOT NULL
ON CONFLICT (conversation_id, user_id) DO NOTHING;


-- ─── 1.4 Helpers SECURITY DEFINER (anti-récursion RLS) ──────────────────────
--     Utilisés dans les policies pour éviter la récursion infinie sur
--     conversation_participants qui se référencerait elle-même.
CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conv uuid, p_user uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conv AND user_id = p_user AND status = 'joined'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_admin(p_conv uuid, p_user uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conv AND user_id = p_user
      AND status = 'joined' AND role IN ('owner','admin')
  );
$$;

-- Ces helpers ne doivent PAS être des RPC publics (uniquement usage interne RLS).
REVOKE EXECUTE ON FUNCTION public.is_conversation_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_conversation_admin(uuid, uuid)  FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_conversation_member(uuid, uuid) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_conversation_admin(uuid, uuid)  TO authenticated;


-- ─── 1.5 RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations             ENABLE ROW LEVEL SECURITY;

-- conversation_participants -------------------------------------------------
-- Voir : les membres du salon voient le roster ; on voit toujours sa propre ligne.
DROP POLICY IF EXISTS "cp_select" ON public.conversation_participants;
CREATE POLICY "cp_select" ON public.conversation_participants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_conversation_member(conversation_id, auth.uid()));

-- S'inscrire soi-même : uniquement en 'requested' ou 'left' (le passage à 'joined'
-- et l'acceptation passent par les RPC ci-dessous qui vérifient join_policy/rôle).
DROP POLICY IF EXISTS "cp_self_insert" ON public.conversation_participants;
CREATE POLICY "cp_self_insert" ON public.conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status IN ('requested','left'));

-- Modifier sa propre ligne (quitter, marquer lu, masquer le badge) OU être admin du salon.
DROP POLICY IF EXISTS "cp_update" ON public.conversation_participants;
CREATE POLICY "cp_update" ON public.conversation_participants
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_conversation_admin(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "cp_delete" ON public.conversation_participants;
CREATE POLICY "cp_delete" ON public.conversation_participants
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_conversation_admin(conversation_id, auth.uid()));

-- Garde-fou : un membre ne peut pas s'auto-élever (role) ni s'auto-valider (status).
-- Seuls les admins (via is_conversation_admin) peuvent changer role/status d'autrui.
CREATE OR REPLACE FUNCTION public.enforce_participant_self_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() = NEW.user_id AND NOT public.is_conversation_admin(NEW.conversation_id, auth.uid()) THEN
    -- Un non-admin ne modifie que : show_on_profile, last_read_at, et status→'left'.
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Modification du rôle non autorisée';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'left' THEN
      RAISE EXCEPTION 'Modification du statut non autorisée';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_cp_self_update ON public.conversation_participants;
CREATE TRIGGER trg_cp_self_update
  BEFORE UPDATE ON public.conversation_participants
  FOR EACH ROW EXECUTE FUNCTION public.enforce_participant_self_update();

-- conversations -------------------------------------------------------------
-- Voir : ses salons (membre). La découverte publique des communautés passe par
-- la VUE public_communities (colonnes sûres), pas par la table.
DROP POLICY IF EXISTS "conv_select" ON public.conversations;
CREATE POLICY "conv_select" ON public.conversations
  FOR SELECT TO authenticated
  USING (public.is_conversation_member(id, auth.uid()));

-- Créer : n'importe quel authentifié, en tant que créateur.
DROP POLICY IF EXISTS "conv_insert" ON public.conversations;
CREATE POLICY "conv_insert" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Modifier : owner/admin du salon uniquement.
DROP POLICY IF EXISTS "conv_update" ON public.conversations;
CREATE POLICY "conv_update" ON public.conversations
  FOR UPDATE TO authenticated
  USING (public.is_conversation_admin(id, auth.uid()));


-- ─── 1.6 Maj automatique de member_count ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_member_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid uuid;
BEGIN
  cid := COALESCE(NEW.conversation_id, OLD.conversation_id);
  UPDATE public.conversations c
  SET member_count = (
    SELECT count(*) FROM public.conversation_participants
    WHERE conversation_id = cid AND status = 'joined'
  )
  WHERE c.id = cid;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_member_count ON public.conversation_participants;
CREATE TRIGGER trg_member_count
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.conversation_participants
  FOR EACH ROW EXECUTE FUNCTION public.sync_member_count();


-- ══════════════════ PHASE 2 — BADGES COMMUNAUTAIRES ═════════════════════════

-- ─── 2.1 Badges d'un lot d'utilisateurs (annuaire : évite le N+1) ───────────
--     Retourne, par user_id, un tableau JSON de badges (communautés rejointes,
--     affichées, plafonné à 4, VÉRIFIÉS en premier). Intentionnellement public.
CREATE OR REPLACE FUNCTION public.get_community_badges(p_user_ids uuid[])
RETURNS TABLE (user_id uuid, badges jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH ranked AS (
    SELECT cp.user_id,
           c.id, c.name, c.avatar_url, c.slug, c.badge_style, c.is_verified, c.member_count,
           row_number() OVER (
             PARTITION BY cp.user_id
             ORDER BY c.is_verified DESC, c.member_count DESC
           ) AS rn
    FROM public.conversation_participants cp
    JOIN public.conversations c ON c.id = cp.conversation_id
    WHERE cp.user_id = ANY(p_user_ids)
      AND cp.status = 'joined' AND cp.show_on_profile = true
      AND c.is_community = true
  )
  SELECT r.user_id,
         jsonb_agg(
           jsonb_build_object(
             'id', r.id, 'name', r.name, 'avatar_url', r.avatar_url,
             'slug', r.slug, 'badge_style', r.badge_style, 'is_verified', r.is_verified
           )
           ORDER BY r.is_verified DESC, r.member_count DESC
         ) AS badges
  FROM ranked r
  WHERE r.rn <= 4
  GROUP BY r.user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_community_badges(uuid[]) TO anon, authenticated;

-- ─── 2.2 Annuaire public des communautés (colonnes sûres) ───────────────────
CREATE OR REPLACE VIEW public.public_communities AS
SELECT id, name, description, avatar_url, slug, badge_style, is_verified, member_count, created_at
FROM public.conversations
WHERE is_community = true;

GRANT SELECT ON public.public_communities TO anon, authenticated;

-- ─── 2.3 RPC — rejoindre / demander à rejoindre une communauté ──────────────
--     Respecte join_policy : open → 'joined', request/invite → 'requested'.
CREATE OR REPLACE FUNCTION public.request_join_community(p_slug text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_conv public.conversations; v_status text; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'auth'); END IF;
  SELECT * INTO v_conv FROM public.conversations WHERE slug = p_slug AND is_community = true;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'not_found'); END IF;

  v_status := CASE WHEN v_conv.join_policy = 'open' THEN 'joined' ELSE 'requested' END;

  INSERT INTO public.conversation_participants (conversation_id, user_id, role, status, joined_at)
  VALUES (v_conv.id, v_uid, 'member', v_status, CASE WHEN v_status='joined' THEN now() END)
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET status = CASE WHEN public.conversation_participants.status = 'left'
                              THEN EXCLUDED.status ELSE public.conversation_participants.status END;

  RETURN jsonb_build_object('ok', true, 'status', v_status, 'conversation_id', v_conv.id);
END $$;

GRANT EXECUTE ON FUNCTION public.request_join_community(text) TO authenticated;

-- ─── 2.4 RPC — un admin accepte / bannit un participant ─────────────────────
CREATE OR REPLACE FUNCTION public.set_participant_status(p_conv uuid, p_user uuid, p_status text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_conversation_admin(p_conv, auth.uid()) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;
  IF p_status NOT IN ('joined','banned','invited') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_status');
  END IF;

  UPDATE public.conversation_participants
  SET status = p_status,
      joined_at = CASE WHEN p_status = 'joined' AND joined_at IS NULL THEN now() ELSE joined_at END
  WHERE conversation_id = p_conv AND user_id = p_user;

  RETURN jsonb_build_object('ok', true);
END $$;

GRANT EXECUTE ON FUNCTION public.set_participant_status(uuid, uuid, text) TO authenticated;


-- ══════════════════ PHASE 3 — VÉRIFICATION & MODÉRATION (notes) ═════════════
--  • is_verified : réservé à l'équipe EmiID (via le back-office admin / service role).
--    Le rendu carte DOIT distinguer badge vérifié (coche bleue) vs auto-déclaré (neutre).
--  • Signalements : content_reports.subject_type peut désormais valoir 'room'
--    → réutilise l'écran Signalements + actOnReport (aucune migration nécessaire).
--  • Cascade : ON DELETE CASCADE supprime les participations si le salon est supprimé ;
--    les badges disparaissent alors automatiquement des cartes (dérivés à la lecture).

SELECT '✅ Schéma communautés & badges appliqué (messagerie générique + participants + RLS + badges).' AS status;


-- ─── 1.7 RPC — trouver/créer un DM (dual-write atomique) ────────────────────
--     Appelée par le frontend à la place de l'INSERT direct : garantit que les
--     lignes conversation_participants existent (sinon getConversations, qui lit
--     désormais via les participants, ne verrait pas les nouveaux DM).
CREATE OR REPLACE FUNCTION public.get_or_create_dm(p_other uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_me uuid := auth.uid(); v_conv uuid; v_p1 uuid; v_p2 uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF p_other IS NULL OR p_other = v_me THEN RAISE EXCEPTION 'invalid recipient'; END IF;

  v_p1 := LEAST(v_me, p_other);
  v_p2 := GREATEST(v_me, p_other);

  -- 1) DM existant via les participants (source de vérité)
  SELECT c.id INTO v_conv
  FROM public.conversations c
  WHERE c.is_group = false
    AND EXISTS (SELECT 1 FROM public.conversation_participants a WHERE a.conversation_id = c.id AND a.user_id = v_me)
    AND EXISTS (SELECT 1 FROM public.conversation_participants b WHERE b.conversation_id = c.id AND b.user_id = p_other)
  LIMIT 1;
  IF v_conv IS NOT NULL THEN RETURN v_conv; END IF;

  -- 2) Repli : DM legacy via participant1/2 (au cas où non backfillé) → on complète les participants
  SELECT id INTO v_conv FROM public.conversations
  WHERE is_group = false AND participant1_id = v_p1 AND participant2_id = v_p2 LIMIT 1;
  IF v_conv IS NOT NULL THEN
    INSERT INTO public.conversation_participants (conversation_id, user_id, role, status, joined_at)
    VALUES (v_conv, v_me, 'member', 'joined', now()), (v_conv, p_other, 'member', 'joined', now())
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
    RETURN v_conv;
  END IF;

  -- 3) Créer (dual-write : participant1/2 legacy + participants)
  INSERT INTO public.conversations (participant1_id, participant2_id, is_group)
  VALUES (v_p1, v_p2, false) RETURNING id INTO v_conv;

  INSERT INTO public.conversation_participants (conversation_id, user_id, role, status, joined_at)
  VALUES (v_conv, v_me, 'member', 'joined', now()), (v_conv, p_other, 'member', 'joined', now())
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  RETURN v_conv;
END $$;

GRANT EXECUTE ON FUNCTION public.get_or_create_dm(uuid) TO authenticated;
