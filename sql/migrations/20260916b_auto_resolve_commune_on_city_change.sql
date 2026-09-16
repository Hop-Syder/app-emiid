-- ─────────────────────────────────────────────────────────────────────────
-- Rattachement automatique et continu de user_profiles.commune_id
--
-- La migration 20260824_boosts_phase2 a rattaché les profils à leur commune
-- UNE FOIS, par correspondance de nom entre `city` et `communes.name`. Aucun
-- déclencheur ne l'entretenait depuis : tout profil créé ou dont la ville a
-- changé depuis restait avec commune_id = NULL, donc absent de
-- « Talents de votre commune » et hors de portée des mises en avant
-- communales — sans lien avec un quelconque statut premium/pro, juste une
-- date de création. Voir le commentaire de LocationSection
-- (frontend-user/components/parametre-content/location-section.tsx).
--
-- Cette migration :
--   1. rattrape les profils déjà orphelins (même logique que le backfill
--      initial, donc idempotente et sans effet sur ceux déjà rattachés) ;
--   2. entretient ce rattachement à chaque INSERT et à chaque changement de
--      `city`, tant que l'utilisateur n'a pas choisi explicitement une
--      commune dans les paramètres — ce choix explicite (LocationSection)
--      n'est jamais écrasé, exactement comme le backfill d'origine.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Rattrapage des profils orphelins créés/modifiés depuis le 24/08.
UPDATE public.user_profiles p
   SET commune_id = c.id
  FROM public.communes c
 WHERE p.commune_id IS NULL
   AND p.city IS NOT NULL
   AND public.normalize_place(p.city) = public.normalize_place(c.name);

-- 2. Entretien continu, via la même résolution tolérante que le sélecteur
--    de l'annuaire (accents/casse/séparateurs).
CREATE OR REPLACE FUNCTION public.auto_resolve_commune_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.commune_id IS NULL AND NEW.city IS NOT NULL THEN
    NEW.commune_id := public.resolve_commune_id(NEW.city);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_resolve_commune_id ON public.user_profiles;
CREATE TRIGGER trg_auto_resolve_commune_id
  BEFORE INSERT OR UPDATE OF city ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_resolve_commune_id();

SELECT
  (SELECT count(*) FROM public.user_profiles WHERE commune_id IS NOT NULL) AS profils_rattaches,
  '✅ Rattachement à la commune entretenu automatiquement.'                 AS status;
