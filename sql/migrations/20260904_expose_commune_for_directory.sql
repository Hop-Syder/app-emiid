/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Rend la commune exploitable par l'annuaire et le tableau de bord.
 *
 *   ── Pourquoi ────────────────────────────────────────────────────────────
 *   `user_profiles.commune_id` existe depuis 20260824 (rattachement automatique
 *   depuis la ville) et sert déjà aux boosts communaux. Mais rien de tout cela
 *   n'était lisible côté client :
 *     • la vue `public_profiles` n'exposait pas `commune_id` — impossible donc
 *       de lister les profils d'une commune ;
 *     • la table `communes` n'avait AUCUN grant — impossible d'afficher le nom
 *       de la commune à l'écran.
 *   La section « Talents dans votre commune » du tableau de bord a besoin des
 *   deux.
 *
 *   ── Sécurité ────────────────────────────────────────────────────────────
 *   Aucune donnée personnelle n'est ouverte ici.
 *   • `commune_id` est un rattachement géographique, au même titre que `city`
 *     et `country_id` déjà exposés par la vue — et moins précis que les
 *     `latitude`/`longitude` qui y figurent déjà.
 *   • `communes` et `departments` sont des tables de référence : le découpage
 *     administratif du Bénin. Elles ne contiennent aucune donnée d'utilisateur,
 *     seulement des noms de lieux et leur hiérarchie.
 *   La vue conserve `security_invoker = false` et ses deux filtres
 *   (is_published = true, non suspendu) : le périmètre des LIGNES visibles est
 *   strictement inchangé, seule une colonne technique s'ajoute.
 *
 *   ── Note d'implémentation ───────────────────────────────────────────────
 *   CREATE OR REPLACE VIEW n'autorise ni la suppression ni le réordonnancement
 *   des colonnes existantes : `commune_id` est ajoutée EN FIN de liste, après
 *   `updated_at` (20260903). Ne pas réordonner cette liste.
 *
 *   Idempotent.
 * @created 2026-09-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Exposer commune_id dans la vue ─────────────────────────────────────
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false)
AS
SELECT
    id, user_id, first_name, last_name, avatar_url, cover_url, bio, category, job_title,
    industry, role, specialty, activity_domain, country_id, city, website, slug,
    is_published, is_verified, is_premium, card_variant, followers_count, created_at,
    latitude, longitude, is_nomad, updated_at,
    -- Nouvelle colonne (ajoutée en fin de liste, cf. note ci-dessus).
    commune_id
FROM public.user_profiles
WHERE is_published = TRUE
  AND COALESCE(is_suspended, FALSE) = FALSE;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ─── 2. Rendre le découpage administratif lisible ──────────────────────────
--     Nécessaire pour afficher « votre commune : Akpakpa » plutôt qu'un UUID.
--     Lecture seule : ces tables sont alimentées par les migrations, jamais
--     par les utilisateurs.
GRANT SELECT ON public.communes    TO anon, authenticated;
GRANT SELECT ON public.departments TO anon, authenticated;

-- ─── 3. Index de listing par commune ───────────────────────────────────────
--     La section du tableau de bord filtre sur (commune_id, is_published) et
--     trie par date : sans index, chaque affichage impose un parcours complet.
CREATE INDEX IF NOT EXISTS idx_user_profiles_commune_published
  ON public.user_profiles (commune_id, created_at DESC)
  WHERE is_published = true;

-- ─── Recharger le cache de schéma PostgREST ────────────────────────────────
NOTIFY pgrst, 'reload schema';

SELECT '✅ commune_id exposé par public_profiles, tables communes/departments lisibles, index de listing créé.' AS status;
