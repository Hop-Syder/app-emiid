/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Correctif CRITIQUE d'exposition sur public.user_profiles.
 *
 *   Constat (audit RLS + grants, 2026-08-30) :
 *   1) Deux policies SELECT en `USING (true)` pour le rôle {public} — "Profils
 *      publics" et "Public Profiles Read" — court-circuitaient (OR permissif) le
 *      filtre is_published des autres policies. Résultat : lecture de TOUTES les
 *      lignes, y compris les profils NON publiés.
 *   2) Le rôle `authenticated` disposait d'un SELECT sur des colonnes secrètes /
 *      PII : pin_code (secret d'auth), email, phone, secondary_phone, ainsi que
 *      des flags de modération (is_admin, suspended_by, is_locked...). Combiné au
 *      point 1, tout utilisateur connecté pouvait lire, pour n'importe quel
 *      profil, le pin_code / l'email / le téléphone via un simple GET PostgREST.
 *
 *   Correctif :
 *   A) Suppression des deux policies `USING (true)`. La lecture publique reste
 *      assurée par "Public Read Profiles" (is_published = true OR owner).
 *   B) Restriction des colonnes lisibles par `authenticated` (et défensivement
 *      `anon`) : plus de pin_code / email / phone / secondary_phone / flags de
 *      modération. Le contact passe désormais UNIQUEMENT par la RPC gated
 *      get_public_profile (opt-in show_contact) ; les données propres au compte
 *      (email/phone/pin en écriture, complétude) transitent par le backend
 *      /api/users/me (service_role).
 *
 *   Le double REVOKE (table puis colonnes) rend la migration robuste que le
 *   GRANT initial ait été posé au niveau table ou au niveau colonne.
 * @created 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

-- ─── A) Supprimer les policies SELECT trop larges (USING true) ──────────────
DROP POLICY IF EXISTS "Profils publics"      ON public.user_profiles;
DROP POLICY IF EXISTS "Public Profiles Read" ON public.user_profiles;

-- (Optionnel — hygiène : "Profils publiés : lecture" devient redondante avec
--  "Public Read Profiles". On la garde pour ne rien casser ; à consolider plus
--  tard si souhaité.)

-- ─── B) Restreindre les colonnes lisibles par authenticated ────────────────
--  1. Retire un éventuel GRANT SELECT au niveau TABLE (cas grant table-level).
REVOKE SELECT ON public.user_profiles FROM authenticated;

--  2. Retire les GRANT au niveau COLONNE sur les colonnes sensibles (cas
--     grant column-level — inoffensif si déjà absent).
REVOKE SELECT (
  pin_code, pin_attempts, email, phone, secondary_phone,
  is_admin, suspended_by, is_locked, locked_at, search_vector
) ON public.user_profiles FROM authenticated;

--  3. Ré-accorde explicitement les colonnes SÛRES à authenticated
--     (restaure l'accès légitime si l'étape 1 a retiré un grant table-level).
GRANT SELECT (
  activity_domain, address, avatar_url, bio, business_name, card_variant,
  category, city, commune_id, country_id, cover_url, created_at, district,
  facebook_url, first_name, followers_count, has_profile, id, identity_verified,
  industry, instagram_url, is_demo, is_nomad, is_premium, is_published,
  is_suspended, is_verified, job_title, last_name, latitude, linkedin_url,
  longitude, opening_hours, phone_verified, pin_enabled, public_email, role,
  services, show_contact, slogan, slug, specialty, suspended_at,
  suspended_reason, suspended_until, tiktok_url, two_factor_enabled, updated_at,
  user_id, website, years_experience
) ON public.user_profiles TO authenticated;

-- ─── B bis) Défense en profondeur : mêmes retraits pour anon ───────────────
--  anon avait déjà été restreint (migration 20260829_gate_contact_by_auth) ;
--  ce REVOKE colonne est idempotent et verrouille explicitement les secrets.
REVOKE SELECT (
  pin_code, pin_attempts, email, phone, secondary_phone,
  is_admin, suspended_by, is_locked, locked_at, search_vector
) ON public.user_profiles FROM anon;

-- ─── Recharger le cache de schéma PostgREST ────────────────────────────────
NOTIFY pgrst, 'reload schema';

SELECT '✅ user_profiles : policies USING(true) supprimées + colonnes secrètes (pin_code/email/phone/…) retirées d''anon et authenticated. Contact désormais servi uniquement par get_public_profile.' AS status;
