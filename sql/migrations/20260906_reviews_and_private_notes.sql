/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Avis publics et notes privées sur les profils, plus les services
 *              enfin exposés au public.
 *
 *   ── Pourquoi ────────────────────────────────────────────────────────────
 *   Les trois sections du profil étaient des maquettes en React : services en
 *   dur dans le fichier, avis en dur, note perdue au rechargement. Cette
 *   migration leur donne un socle réel.
 *
 *   ① `get_public_profile` ne renvoyait NI `services` NI `opening_hours` :
 *      pour tout visiteur, le profil arrivait sans services et l'écran
 *      affichait des tarifs inventés. Deux clés ajoutées, le reste intact.
 *
 *   ② `profile_reviews` — un avis par personne et par profil. Le droit de
 *      déposer un avis est refusé par défaut : il faut avoir RÉELLEMENT
 *      échangé avec le professionnel (voir can_review_profile).
 *
 *   ③ `profile_notes` — pense-bête privé. La RLS ne laisse jamais personne
 *      lire la note d'un autre, pas même le professionnel concerné.
 *
 *   Idempotent.
 * @created 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

-- ─── ① Exposer les services au public ──────────────────────────────────────
--     Corps repris à l'identique ; seules `services` et `opening_hours` sont
--     ajoutées. Ce sont des informations commerciales, publiques par nature —
--     contrairement à l'email et au téléphone, qui gardent leur double garde.
CREATE OR REPLACE FUNCTION public.get_public_profile(identifier text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT jsonb_build_object(
        'id', up.id,
        'user_id', up.user_id,
        'first_name', up.first_name,
        'last_name', up.last_name,
        'business_name', up.business_name,
        'bio', up.bio,
        'district', up.district,
        'city', up.city,
        'avatar_url', up.avatar_url,
        'cover_url', up.cover_url,
        'specialty', up.specialty,
        'category', up.category,
        'slug', up.slug,
        'is_published', up.is_published,
        'is_verified', up.is_verified,
        'is_premium', up.is_premium,
        'followers_count', up.followers_count,
        'created_at', up.created_at,
        'email', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN up.email ELSE NULL END,
        'phone', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN up.phone ELSE NULL END,
        'has_contact', up.show_contact AND (up.email IS NOT NULL OR up.phone IS NOT NULL),
        'website', up.website,
        'role', up.role,
        -- Nouveau : la vitrine commerciale, jusque-là invisible des visiteurs.
        'services', COALESCE(up.services, '[]'::jsonb),
        'opening_hours', COALESCE(up.opening_hours, '[]'::jsonb),
        'countries', CASE WHEN c.id IS NOT NULL
            THEN jsonb_build_object('name', c.name)
            ELSE NULL END,
        'profile_tags', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('tags', jsonb_build_object('name', t.name)))
            FROM public.profile_tags pt
            JOIN public.tags t ON t.id = pt.tag_id
            WHERE pt.profile_id = up.id
        ), '[]'::jsonb)
    )
    FROM public.user_profiles up
    LEFT JOIN public.countries c ON c.id = up.country_id
    WHERE up.is_published = TRUE
      AND COALESCE(up.is_suspended, FALSE) = FALSE
      AND (
            up.slug = lower(identifier)
         OR up.id::text = lower(identifier)
         OR up.user_id::text = lower(identifier)
      )
    LIMIT 1;
$function$;

-- ─── ② Qui a le droit de noter ─────────────────────────────────────────────
--     Règle métier : il faut avoir tenu une VRAIE conversation privée avec le
--     professionnel — plus de dix messages au total, ET au moins un message de
--     chaque côté. Le second critère n'est pas cosmétique : sans lui, onze
--     messages envoyés dans le vide suffiraient à ouvrir le droit d'avis, ce
--     qui en ferait une arme plutôt qu'un témoignage.
--
--     Les groupes et communautés sont exclus : un avis atteste d'un échange
--     direct, pas d'une présence commune dans un salon.
CREATE OR REPLACE FUNCTION public.can_review_profile(
  p_reviewer_id uuid,
  p_profile_owner_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.conversations c
        JOIN public.messages m ON m.conversation_id = c.id
        WHERE COALESCE(c.is_group, false) = false
          AND COALESCE(c.is_community, false) = false
          AND (
                (c.participant1_id = p_reviewer_id AND c.participant2_id = p_profile_owner_id)
             OR (c.participant2_id = p_reviewer_id AND c.participant1_id = p_profile_owner_id)
          )
        GROUP BY c.id
        HAVING count(*) > 10
           AND count(*) FILTER (WHERE m.sender_id = p_reviewer_id)      > 0
           AND count(*) FILTER (WHERE m.sender_id = p_profile_owner_id) > 0
    );
$$;

REVOKE ALL ON FUNCTION public.can_review_profile(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_review_profile(uuid, uuid) TO authenticated;

-- ─── ③ Les avis ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_reviews (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Le profil noté, par son user_id : c'est la clé exposée au client.
  profile_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating       smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      text NOT NULL CHECK (length(btrim(comment)) BETWEEN 10 AND 2000),
  -- Réponse du professionnel, rédigée par lui seul (cf. politique plus bas).
  owner_reply  text CHECK (owner_reply IS NULL OR length(btrim(owner_reply)) BETWEEN 1 AND 2000),
  replied_at   timestamptz,
  is_hidden    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  -- Un seul avis par personne et par profil : on modifie le sien, on n'en empile pas.
  UNIQUE (profile_id, reviewer_id),
  -- On ne se note pas soi-même.
  CONSTRAINT profile_reviews_no_self CHECK (reviewer_id <> profile_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_reviews_profile
  ON public.profile_reviews (profile_id, created_at DESC)
  WHERE is_hidden = false;

ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "avis visibles de tous" ON public.profile_reviews;
CREATE POLICY "avis visibles de tous"
  ON public.profile_reviews FOR SELECT
  USING (is_hidden = false);

-- L'éligibilité est vérifiée DANS la politique, pas seulement côté serveur :
-- une clé publique volée ne doit pas permettre d'écrire un avis de complaisance.
DROP POLICY IF EXISTS "déposer un avis après un vrai échange" ON public.profile_reviews;
CREATE POLICY "déposer un avis après un vrai échange"
  ON public.profile_reviews FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND public.can_review_profile(auth.uid(), profile_id)
  );

DROP POLICY IF EXISTS "modifier son propre avis" ON public.profile_reviews;
CREATE POLICY "modifier son propre avis"
  ON public.profile_reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "supprimer son propre avis" ON public.profile_reviews;
CREATE POLICY "supprimer son propre avis"
  ON public.profile_reviews FOR DELETE TO authenticated
  USING (reviewer_id = auth.uid());

-- Le professionnel répond sans pouvoir toucher à la note ni au texte reçu :
-- la garde porte sur les colonnes, via un déclencheur (une politique RLS ne
-- sait pas restreindre les colonnes modifiables).
CREATE OR REPLACE FUNCTION public.profile_reviews_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $$
BEGIN
  IF auth.uid() = OLD.profile_id THEN
    -- Le propriétaire du profil : réponse uniquement.
    IF NEW.rating <> OLD.rating OR NEW.comment <> OLD.comment
       OR NEW.reviewer_id <> OLD.reviewer_id OR NEW.profile_id <> OLD.profile_id THEN
      RAISE EXCEPTION 'Le professionnel ne peut que répondre à un avis, pas le modifier';
    END IF;
    NEW.replied_at := CASE WHEN NEW.owner_reply IS DISTINCT FROM OLD.owner_reply
                           THEN now() ELSE OLD.replied_at END;
  ELSE
    -- L'auteur : son texte et sa note, jamais la réponse d'en face.
    NEW.owner_reply := OLD.owner_reply;
    NEW.replied_at  := OLD.replied_at;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_reviews_guard ON public.profile_reviews;
CREATE TRIGGER trg_profile_reviews_guard
  BEFORE UPDATE ON public.profile_reviews
  FOR EACH ROW EXECUTE FUNCTION public.profile_reviews_guard();

DROP POLICY IF EXISTS "répondre aux avis reçus" ON public.profile_reviews;
CREATE POLICY "répondre aux avis reçus"
  ON public.profile_reviews FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

GRANT SELECT ON public.profile_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_reviews TO authenticated;

-- ─── ④ Les notes privées ───────────────────────────────────────────────────
--     Un pense-bête que SON SEUL AUTEUR peut lire. Le professionnel concerné
--     n'y a aucun accès : c'est la différence avec un avis.
CREATE TABLE IF NOT EXISTS public.profile_notes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content      text NOT NULL DEFAULT '',
  -- Renseigné quand le texte provient d'une dictée : l'écran le signale.
  is_voice     boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (author_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_notes_author
  ON public.profile_notes (author_id, updated_at DESC);

ALTER TABLE public.profile_notes ENABLE ROW LEVEL SECURITY;

-- Une seule politique, tous verbes confondus : personne d'autre que l'auteur,
-- jamais, sous aucun angle.
DROP POLICY IF EXISTS "note lisible et modifiable par son seul auteur" ON public.profile_notes;
CREATE POLICY "note lisible et modifiable par son seul auteur"
  ON public.profile_notes FOR ALL TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

REVOKE ALL ON public.profile_notes FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_notes TO authenticated;

-- ─── ⑤ Synthèse des avis ───────────────────────────────────────────────────
--     Moyenne et distribution en un aller-retour : l'écran les affiche côte à
--     côte, les demander séparément coûterait deux allers-retours de plus.
CREATE OR REPLACE FUNCTION public.get_profile_review_stats(p_profile_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path TO public, pg_temp
AS $$
    SELECT jsonb_build_object(
        'count',   COALESCE(count(*), 0),
        'average', COALESCE(round(avg(rating)::numeric, 1), 0),
        'distribution', jsonb_build_object(
            '5', count(*) FILTER (WHERE rating = 5),
            '4', count(*) FILTER (WHERE rating = 4),
            '3', count(*) FILTER (WHERE rating = 3),
            '2', count(*) FILTER (WHERE rating = 2),
            '1', count(*) FILTER (WHERE rating = 1)
        )
    )
    FROM public.profile_reviews
    WHERE profile_id = p_profile_id AND is_hidden = false;
$$;

GRANT EXECUTE ON FUNCTION public.get_profile_review_stats(uuid) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

SELECT '✅ Services exposés · profile_reviews et profile_notes créées avec leur RLS.' AS status;
