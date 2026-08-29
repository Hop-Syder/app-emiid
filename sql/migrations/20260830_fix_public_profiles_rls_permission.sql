/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Correctif du 401 "permission denied for table user_profiles" sur la page
 *              d'accueil publique. Cause réelle : PostgREST résout les embeds imbriqués
 *              (`countries(...)`, `profile_tags(tags(...))`) via les contraintes FK réelles
 *              (ex. profile_tags.profile_id → user_profiles.id) — une vue ne pouvant pas
 *              être cible de FK, ce JOIN touche `user_profiles` directement, HORS du
 *              périmètre "owner bypass" de la vue `public_profiles`, et s'exécute donc
 *              avec les droits d'`anon`. Confirmé en SQL Editor sous SET ROLE anon :
 *                SELECT pp.id, pt.tag_id FROM public.public_profiles pp
 *                LEFT JOIN public.profile_tags pt ON pt.profile_id = pp.id LIMIT 1;
 *              → ERROR 42501: permission denied for table user_profiles
 *
 *              Le `REVOKE SELECT ON user_profiles FROM anon;` de la migration H2
 *              (20260829_gate_contact_by_auth.sql) reste intentionnel et correct — anon
 *              ne doit pas lire user_profiles en clair. On ne le défait donc PAS avec un
 *              GRANT SELECT complet (ça rouvrirait la fuite email/phone qui a motivé H2).
 *              À la place : un GRANT SELECT limité aux colonnes déjà exposées par la vue
 *              public_profiles — email/phone/pin_code restent hors de portée d'anon.
 *
 *              Aucun changement RLS n'est nécessaire ici : plusieurs policies PERMISSIVE
 *              préexistantes sur user_profiles (roles = {public}, donc anon inclus)
 *              couvrent déjà la lecture des lignes publiées (is_published = true).
 * @created 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ──────────────────────────────────

GRANT SELECT (
  id, user_id, first_name, last_name, avatar_url, cover_url, bio, category, job_title,
  industry, role, specialty, activity_domain, country_id, city, website, slug,
  is_published, is_verified, is_premium, card_variant, followers_count, created_at,
  latitude, longitude, is_nomad
) ON public.user_profiles TO anon;

NOTIFY pgrst, 'reload schema';

SELECT '✅ anon peut de nouveau résoudre les embeds PostgREST via user_profiles, sans accès à email/phone/pin_code.' AS status;
