-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description H2 — Fuite de contact via accès direct à user_profiles.
--  *
--  *              La policy RLS SELECT sur user_profiles ("Profils publiés :
--  *              lecture publique", USING (is_published = TRUE), sans
--  *              restriction de rôle ni de propriétaire) permettait à N'IMPORTE
--  *              QUEL visiteur anonyme ou connecté de lire email/phone (et
--  *              toute autre colonne non explicitement révoquée) de N'IMPORTE
--  *              QUEL profil publié, en interrogeant directement la table —
--  *              cf. frontend-user/hooks/use-profile-data.ts et
--  *              app/profil/[id]/page.tsx, qui tentent tous deux cette lecture
--  *              directe en premier. Chaque AUTRE accès direct à user_profiles
--  *              dans le code filtre déjà explicitement sur `auth.uid() =
--  *              user_id` (cf. commentaires "RLS OK" dans use-personal-hero.ts,
--  *              use-boost.ts, use-portefeuille.ts, proxy.ts, suspendu/page.tsx,
--  *              auth/callback/route.ts) : la policy ne reflétait donc plus
--  *              l'intention réelle du code depuis longtemps.
--  *
--  *              1. On resserre la policy à la ligne du propriétaire
--  *                 uniquement — la lecture d'un profil publié par un AUTRE
--  *                 visiteur doit obligatoirement passer par la vue
--  *                 public_profiles (sans contact) ou par get_public_profile()
--  *                 (SECURITY DEFINER, contact conditionnel).
--  *              2. get_public_profile() contourne la RLS (SECURITY DEFINER) :
--  *                 son propre contact n'était conditionné qu'au choix du
--  *                 propriétaire (show_contact), jamais à l'état de connexion
--  *                 du visiteur. On ajoute auth.uid() IS NOT NULL : le contact
--  *                 n'est renvoyé qu'à un visiteur authentifié.
--  * @created 2026-08-29
--  * 🌐 ceo.nexuspartners.xyz
--  */
-- ──────────────────────────────────

-- 1. RLS : lecture directe de user_profiles réservée au propriétaire de la ligne.
--    (Les autres profils publiés restent lisibles via public_profiles / get_public_profile.)
DROP POLICY IF EXISTS "Profils publiés : lecture publique" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

REVOKE SELECT ON public.user_profiles FROM anon;

-- 2. RPC : contact conditionné en plus à l'authentification du visiteur.
CREATE OR REPLACE FUNCTION public.get_public_profile(identifier text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
        -- Contact renvoyé UNIQUEMENT si le propriétaire l'a laissé visible (R7)
        -- ET si le visiteur est authentifié (H2 — anti-fuite anonyme).
        'email', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN up.email ELSE NULL END,
        'phone', CASE WHEN up.show_contact AND auth.uid() IS NOT NULL THEN up.phone ELSE NULL END,
        -- Indique qu'un contact existe et serait visible une fois connecté,
        -- sans jamais divulguer sa valeur à un visiteur anonyme (H2).
        'has_contact', up.show_contact AND (up.email IS NOT NULL OR up.phone IS NOT NULL),
        'website', up.website,
        'role', up.role,
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
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;

SELECT '✅ H2 : lecture directe de user_profiles resserrée au propriétaire + contact de get_public_profile() réservé aux visiteurs connectés.' AS status;
