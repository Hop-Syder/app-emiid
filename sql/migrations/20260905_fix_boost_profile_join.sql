/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Correctif BLOQUANT : aucun profil boosté n'était jamais mis en
 *              avant — la mise en avant payante ne produisait aucun effet.
 *
 *   ── Cause racine ────────────────────────────────────────────────────────
 *   `profile_boosts.profile_id` contient un identifiant d'AUTHENTIFICATION.
 *   Trois éléments concordent et le confirment :
 *     • la colonne est déclarée `REFERENCES auth.users(id)` (20260824, l.145) ;
 *     • la politique RLS filtre sur `auth.uid() = profile_id` (20260824, l.174) ;
 *     • le contrôleur de paiement y écrit `profile_id: user.id`, c'est-à-dire
 *       l'identifiant du jeton (backend paymentController.ts).
 *
 *   Or `active_boosted_profile_ids()` joignait :
 *       JOIN user_profiles p ON p.id = b.profile_id
 *   `user_profiles.id` est un uuid autonome (DEFAULT gen_random_uuid()) : seul
 *   `user_profiles.user_id` porte l'identifiant d'authentification, le trigger
 *   handle_new_user n'alimentant que celui-ci. La jointure ne rapprochait donc
 *   jamais deux valeurs comparables : la fonction renvoyait TOUJOURS zéro ligne.
 *
 *   Conséquence : ni l'annuaire ni le tableau de bord n'ont jamais remonté un
 *   profil boosté. Le boost était facturé, enregistré, activé au paiement — et
 *   sans effet visible. Aucune erreur nulle part : une liste vide se confond
 *   avec « personne n'a boosté ».
 *
 *   ── Correctif ───────────────────────────────────────────────────────────
 *   La donnée est correcte, c'est la fonction qui l'était pas. On corrige donc
 *   la jointure — `p.user_id = b.profile_id` — sans toucher à la table, à sa
 *   contrainte, à sa RLS, ni au parcours d'achat.
 *
 *   La fonction renvoie désormais `p.id` (l'identifiant de PROFIL) plutôt que
 *   `b.profile_id` (l'identifiant d'auth). C'est ce que ses deux consommateurs
 *   comparent déjà — `isBoosted(e.id)` dans /api/annuaire et `boosted.has(e.id)`
 *   dans /api/dashboard-user/commune — et c'est cohérent avec les autres RPC du
 *   projet, search_profile_ids() en tête, qui renvoient toutes un user_profiles.id.
 *   Aucun changement applicatif n'est donc nécessaire.
 *
 *   Le nom de la colonne de sortie (`profile_id`) et la signature sont
 *   inchangés : CREATE OR REPLACE suffit, et les types générés restent valides.
 *
 *   ── Vérifier l'effet ────────────────────────────────────────────────────
 *     -- Doit passer de 0 à N (N = boosts actifs rattachés à un profil publié) :
 *     SELECT count(*) FROM profile_boosts b
 *       JOIN user_profiles p ON p.user_id = b.profile_id;
 *     -- L'ancienne jointure, elle, renvoie 0 :
 *     SELECT count(*) FROM profile_boosts b
 *       JOIN user_profiles p ON p.id = b.profile_id;
 *
 *   Idempotent.
 * @created 2026-09-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.active_boosted_profile_ids(p_commune_id uuid)
RETURNS TABLE(profile_id uuid, scope text)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH target AS (
    SELECT c.id AS commune_id, c.department_id
    FROM public.communes c
    WHERE c.id = p_commune_id
  )
  -- Score 4 : boost sur la commune exacte.
  --   p.user_id = b.profile_id : la colonne porte un identifiant d'auth.
  --   On renvoie p.id, l'identifiant de profil attendu par les appelants.
  SELECT DISTINCT p.id, 'COMMUNE'::text AS scope
  FROM public.profile_boosts b
  JOIN public.user_profiles p ON p.user_id = b.profile_id AND p.is_published = true
  JOIN target t ON b.commune_id = t.commune_id
  WHERE b.status = 'ACTIVE'
    AND b.scope = 'COMMUNE'
    AND b.starts_at <= now()
    AND b.expires_at > now()

  UNION

  -- Score 3 : boost sur le département auquel appartient la commune.
  SELECT DISTINCT p.id, 'DEPARTMENT'::text AS scope
  FROM public.profile_boosts b
  JOIN public.user_profiles p ON p.user_id = b.profile_id AND p.is_published = true
  JOIN target t ON b.department_id = t.department_id
  WHERE b.status = 'ACTIVE'
    AND b.scope = 'DEPARTMENT'
    AND b.starts_at <= now()
    AND b.expires_at > now();
$$;

GRANT EXECUTE ON FUNCTION public.active_boosted_profile_ids(uuid) TO anon, authenticated;

-- ─── Recharger le cache de schéma PostgREST ────────────────────────────────
NOTIFY pgrst, 'reload schema';

SELECT '✅ Boosts réparés : active_boosted_profile_ids() joint désormais user_profiles.user_id et renvoie l''identifiant de profil.' AS status;
