-- ============================================================================
-- Monétisation — Phase 2 : référentiel territorial + Boosts communaux
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-24
--
-- Prérequis du ciblage géographique : `user_profiles` ne portait que `city` et
-- `district` en TEXTE LIBRE — « Cotonou », « cotonou » et « COTONOU » ne se
-- rapprochaient pas. Un boost communal exige un référentiel stable.
--
-- Cette migration :
--   • crée le référentiel des 12 départements et 77 communes du Bénin ;
--   • ajoute user_profiles.commune_id et RATTACHE automatiquement les profils
--     existants par comparaison de noms normalisés (sans accents, minuscules) ;
--   • crée profile_boosts (portée COMMUNE ; DEPARTMENT prévu mais non exploité) ;
--   • expose active_boosted_profile_ids() pour le classement de recherche.
--
-- Les profils dont la ville n'est pas reconnue gardent commune_id = NULL : ils
-- restent visibles, seulement non ciblables par un boost tant que l'utilisateur
-- n'a pas choisi sa commune.
--
-- Idempotent. Jouer après 20260823_monetization_phase1.sql.
-- ============================================================================

-- ── 1. Référentiel territorial ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.departments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       varchar(80) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          varchar(80) NOT NULL,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, department_id)
);

CREATE INDEX IF NOT EXISTS idx_communes_department ON public.communes (department_id);

-- Clé de rapprochement : nom sans accents, en minuscules, séparateurs retirés.
--
-- On N'UTILISE PAS unaccent() : sur Supabase l'extension vit dans le schéma
-- `extensions`, hors du search_path appliqué lors de l'inlining d'une fonction
-- SQL — d'où « function unaccent(text) does not exist ». translate() couvre le
-- français et reste IMMUTABLE sans aucune dépendance d'extension.
--
-- L'index dépend de cette fonction : on le retire avant toute redéfinition.
DROP INDEX IF EXISTS public.idx_communes_normalized;

CREATE OR REPLACE FUNCTION public.normalize_place(txt text)
RETURNS text
LANGUAGE sql IMMUTABLE
SET search_path = pg_catalog, public
AS $$
  SELECT regexp_replace(
           translate(
             lower(coalesce(txt, '')),
             'àáâãäåçèéêëìíîïñòóôõöùúûüýÿœæ',
             'aaaaaaceeeeiiiinooooouuuuyyoa'
           ),
           '[^a-z0-9]+', '', 'g');
$$;

CREATE INDEX IF NOT EXISTS idx_communes_normalized
  ON public.communes (public.normalize_place(name));

-- ── 2. Seed : 12 départements, 77 communes ─────────────────────────────────
INSERT INTO public.departments (name) VALUES
  ('Alibori'), ('Atacora'), ('Atlantique'), ('Borgou'), ('Collines'), ('Couffo'),
  ('Donga'), ('Littoral'), ('Mono'), ('Ouémé'), ('Plateau'), ('Zou')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.communes (name, department_id)
SELECT c.name, d.id
FROM (VALUES
  -- Alibori (6)
  ('Banikoara','Alibori'), ('Gogounou','Alibori'), ('Kandi','Alibori'),
  ('Karimama','Alibori'), ('Malanville','Alibori'), ('Ségbana','Alibori'),
  -- Atacora (9)
  ('Boukoumbé','Atacora'), ('Cobly','Atacora'), ('Kérou','Atacora'),
  ('Kouandé','Atacora'), ('Matéri','Atacora'), ('Natitingou','Atacora'),
  ('Péhunco','Atacora'), ('Tanguiéta','Atacora'), ('Toucountouna','Atacora'),
  -- Atlantique (8)
  ('Abomey-Calavi','Atlantique'), ('Allada','Atlantique'), ('Kpomassè','Atlantique'),
  ('Ouidah','Atlantique'), ('Sô-Ava','Atlantique'), ('Toffo','Atlantique'),
  ('Tori-Bossito','Atlantique'), ('Zè','Atlantique'),
  -- Borgou (8)
  ('Bembèrèkè','Borgou'), ('Kalalé','Borgou'), ('N''Dali','Borgou'),
  ('Nikki','Borgou'), ('Parakou','Borgou'), ('Pèrèrè','Borgou'),
  ('Sinendé','Borgou'), ('Tchaourou','Borgou'),
  -- Collines (6)
  ('Bantè','Collines'), ('Dassa-Zoumè','Collines'), ('Glazoué','Collines'),
  ('Ouèssè','Collines'), ('Savalou','Collines'), ('Savè','Collines'),
  -- Couffo (6)
  ('Aplahoué','Couffo'), ('Djakotomey','Couffo'), ('Dogbo','Couffo'),
  ('Klouékanmè','Couffo'), ('Lalo','Couffo'), ('Toviklin','Couffo'),
  -- Donga (4)
  ('Bassila','Donga'), ('Copargo','Donga'), ('Djougou','Donga'), ('Ouaké','Donga'),
  -- Littoral (1)
  ('Cotonou','Littoral'),
  -- Mono (6)
  ('Athiémé','Mono'), ('Bopa','Mono'), ('Comè','Mono'),
  ('Grand-Popo','Mono'), ('Houéyogbé','Mono'), ('Lokossa','Mono'),
  -- Ouémé (9)
  ('Adjarra','Ouémé'), ('Adjohoun','Ouémé'), ('Aguégués','Ouémé'),
  ('Akpro-Missérété','Ouémé'), ('Avrankou','Ouémé'), ('Bonou','Ouémé'),
  ('Dangbo','Ouémé'), ('Porto-Novo','Ouémé'), ('Sèmè-Kpodji','Ouémé'),
  -- Plateau (5)
  ('Adja-Ouèrè','Plateau'), ('Ifangni','Plateau'), ('Kétou','Plateau'),
  ('Pobè','Plateau'), ('Sakété','Plateau'),
  -- Zou (9)
  ('Abomey','Zou'), ('Agbangnizoun','Zou'), ('Bohicon','Zou'),
  ('Covè','Zou'), ('Djidja','Zou'), ('Ouinhi','Zou'),
  ('Za-Kpota','Zou'), ('Zagnanado','Zou'), ('Zogbodomey','Zou')
) AS c(name, dept)
JOIN public.departments d ON d.name = c.dept
ON CONFLICT (name, department_id) DO NOTHING;

-- ── 3. Rattachement des profils ────────────────────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS commune_id uuid REFERENCES public.communes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_commune ON public.user_profiles (commune_id);

-- Rattachement automatique par nom normalisé. N'écrase jamais un choix déjà fait.
UPDATE public.user_profiles p
   SET commune_id = c.id
  FROM public.communes c
 WHERE p.commune_id IS NULL
   AND p.city IS NOT NULL
   AND public.normalize_place(p.city) = public.normalize_place(c.name);

-- ── 4. Boosts de visibilité ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.boost_scope AS ENUM ('COMMUNE', 'DEPARTMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.boost_status AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profile_boosts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope          public.boost_scope  NOT NULL DEFAULT 'COMMUNE',
  commune_id     uuid REFERENCES public.communes(id)    ON DELETE CASCADE,
  department_id  uuid REFERENCES public.departments(id) ON DELETE CASCADE,
  starts_at      timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz NOT NULL,
  status         public.boost_status NOT NULL DEFAULT 'PENDING',
  price_paid     integer NOT NULL CHECK (price_paid >= 0),   -- FCFA
  transaction_id uuid UNIQUE REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  -- La cible doit correspondre à la portée.
  CONSTRAINT boost_target_matches_scope CHECK (
    (scope = 'COMMUNE'    AND commune_id    IS NOT NULL) OR
    (scope = 'DEPARTMENT' AND department_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_boosts_lookup
  ON public.profile_boosts (scope, commune_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_boosts_profile
  ON public.profile_boosts (profile_id, status);

ALTER TABLE public.profile_boosts ENABLE ROW LEVEL SECURITY;

-- Lecture : ses propres boosts. Les boosts actifs sont exposés au public via la
-- fonction ci-dessous (SECURITY DEFINER), jamais par un SELECT direct.
DROP POLICY IF EXISTS "boosts_select_own" ON public.profile_boosts;
CREATE POLICY "boosts_select_own" ON public.profile_boosts
  FOR SELECT TO authenticated USING (auth.uid() = profile_id);

-- ── 5. Boosts actifs pour le classement de recherche ───────────────────────
--     Renvoie les profils boostés dans une commune donnée (Score 4 du cadrage).
--     L'expiration est évaluée à la lecture : aucun cron n'est indispensable.
CREATE OR REPLACE FUNCTION public.active_boosted_profile_ids(p_commune_id uuid)
RETURNS TABLE(profile_id uuid)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT b.profile_id
  FROM public.profile_boosts b
  JOIN public.user_profiles p ON p.id = b.profile_id AND p.is_published = true
  WHERE b.status = 'ACTIVE'
    AND b.starts_at <= now()
    AND b.expires_at > now()
    AND b.scope = 'COMMUNE'
    AND b.commune_id = p_commune_id;
$$;

GRANT EXECUTE ON FUNCTION public.active_boosted_profile_ids(uuid) TO anon, authenticated;

-- Résout une commune à partir d'un libellé libre (filtre ville de l'annuaire).
-- Tolère accents, casse et séparateurs : « porto novo » → Porto-Novo.
CREATE OR REPLACE FUNCTION public.resolve_commune_id(p_label text)
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT c.id
  FROM public.communes c
  WHERE public.normalize_place(c.name) = public.normalize_place(p_label)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_commune_id(text) TO anon, authenticated;

-- Clôture des boosts échus (à planifier, comme expire_subscriptions()).
CREATE OR REPLACE FUNCTION public.expire_boosts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  UPDATE public.profile_boosts
     SET status = 'EXPIRED', updated_at = now()
   WHERE status = 'ACTIVE' AND expires_at <= now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

-- ── 6. Référentiel lisible publiquement (sélecteur de commune) ─────────────
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communes    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "departments_public_read" ON public.departments;
CREATE POLICY "departments_public_read" ON public.departments
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "communes_public_read" ON public.communes;
CREATE POLICY "communes_public_read" ON public.communes
  FOR SELECT TO anon, authenticated USING (true);

SELECT
  (SELECT count(*) FROM public.departments)                                AS departements,
  (SELECT count(*) FROM public.communes)                                   AS communes,
  (SELECT count(*) FROM public.user_profiles WHERE commune_id IS NOT NULL) AS profils_rattaches,
  '✅ Référentiel territorial + profile_boosts prêts.'                      AS status;
