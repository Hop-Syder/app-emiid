/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Expose `updated_at` sur la vue public_profiles, pour que le
 *              sitemap publie la fraîcheur RÉELLE de chaque profil.
 *
 *   ── Contexte ────────────────────────────────────────────────────────────
 *   Le sitemap (frontend-user/app/sitemap.ts) renseigne <lastmod> à partir de
 *   `updated_at` : Google recrawle ainsi en priorité les profils dont la bio,
 *   le rôle ou l'avatar ont changé, au lieu de se fier à la seule date de
 *   création — qui, elle, ne bouge jamais.
 *
 *   Or la vue public_profiles n'exposait pas cette colonne. PostgREST
 *   répondait « column public_profiles.updated_at does not exist » (42703) et
 *   la requête entière échouait : le sitemap se retrouvait SANS AUCUN PROFIL,
 *   silencieusement, à chaque régénération. Le code porte désormais un repli
 *   sur created_at, mais c'est un filet — cette migration rétablit l'intention.
 *
 *   ── Sécurité ────────────────────────────────────────────────────────────
 *   `updated_at` est un horodatage de modification : aucune donnée personnelle,
 *   rien d'exploitable. La vue conserve `security_invoker = false` et ses deux
 *   filtres (is_published = true, non suspendu) : le périmètre des lignes
 *   visibles est strictement inchangé, seule une colonne technique s'ajoute.
 *   Aucun privilège nouveau n'est accordé sur la table user_profiles.
 *
 *   ── Note d'implémentation ───────────────────────────────────────────────
 *   CREATE OR REPLACE VIEW n'autorise ni la suppression, ni le réordonnancement
 *   des colonnes existantes : `updated_at` est donc ajoutée EN FIN de liste, et
 *   les 26 colonnes précédentes sont reprises dans leur ordre exact (défini par
 *   20260829_gate_contact_by_auth.sql). Ne pas réordonner cette liste.
 *
 *   Idempotent.
 * @created 2026-09-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false)
AS
SELECT
    id, user_id, first_name, last_name, avatar_url, cover_url, bio, category, job_title,
    industry, role, specialty, activity_domain, country_id, city, website, slug,
    is_published, is_verified, is_premium, card_variant, followers_count, created_at,
    latitude, longitude, is_nomad,
    -- Nouvelle colonne (ajoutée en fin de liste, cf. note ci-dessus).
    updated_at
FROM public.user_profiles
WHERE is_published = TRUE
  AND COALESCE(is_suspended, FALSE) = FALSE;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ─── Recharger le cache de schéma PostgREST ────────────────────────────────
--     Sans cela, PostgREST continue d'ignorer la colonne et le sitemap reste
--     sur son repli created_at jusqu'au prochain redémarrage.
NOTIFY pgrst, 'reload schema';

SELECT '✅ public_profiles expose updated_at : le sitemap publie désormais la date de dernière modification de chaque profil.' AS status;
