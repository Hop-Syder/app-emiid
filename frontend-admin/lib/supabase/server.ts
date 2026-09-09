import { createServerClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } from './env';
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export interface AdminSessionProfile {
  userId: string
  role: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  avatarUrl: string | null
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
          }
        },
      },
    },
  )
}

export async function requireAdminSession(): Promise<AdminSessionProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Check account disabled
  if (user.user_metadata?.account_disabled) {
    return null
  }

  // email n'est PAS demandée ici : cette colonne est verrouillée (REVOKE) pour
  // authenticated depuis 20260830_fix_user_profiles_exposure.sql. Une seule
  // colonne interdite fait échouer TOUTE la requête PostgREST — c'est resté
  // invisible car requireAdminSession avalait l'erreur en la traitant comme
  // "non admin", provoquant une redirection silencieuse vers /login pour
  // TOUT administrateur (confirmé en testant le flux de bout en bout).
  // L'email de session vient de auth.users (user.email), jamais de la table.
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('user_id, role, first_name, last_name, avatar_url')
    .eq('user_id', user.id)
    .single()

  if (error || !profile) {
    return null
  }

  // is_admin est verrouillée (REVOKE) pour authenticated : le client lié à la
  // session ne peut pas la lire, même la sienne. On la vérifie via service
  // role, exactement comme le backend Express (requireAdmin) — is_admin est
  // la seule source de vérité pour l'autorisation admin, cohérente avec le
  // bouton Accorder/Révoquer Admin du cockpit (toggleAdmin).
  const { data: adminRow, error: adminError } = await createServiceRoleClient()
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (adminError || !adminRow?.is_admin) {
    return null
  }

  return {
    userId: profile.user_id,
    role: profile.role,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: user.email ?? null,
    avatarUrl: profile.avatar_url,
  }
}

export async function createAdminClient() {
  const adminSession = await requireAdminSession()

  if (!adminSession) {
    throw new Error('UNAUTHORIZED_ADMIN')
  }

  // Additional safety check - log admin access
  console.log(`[ADMIN ACCESS] User ${adminSession.userId} (${adminSession.email}) accessing admin panel at ${new Date().toISOString()}`)

  return createSupabaseClient(
    supabaseUrl(),
    supabaseServiceRoleKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}

/**
 * Client service-role SANS vérification de session admin.
 * ⚠️ Réservé aux traitements de confiance non-interactifs (ex. cron protégé
 * par CRON_SECRET). Ne JAMAIS l'exposer à une entrée utilisateur directe.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(
    supabaseUrl(),
    supabaseServiceRoleKey(),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
