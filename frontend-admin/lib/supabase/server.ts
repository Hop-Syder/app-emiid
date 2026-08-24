import { createServerClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } from './env';
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyAdminAccess } from '@/lib/admin-auth'

export interface AdminSessionProfile {
  userId: string
  role: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  avatarUrl: string | null
}

const ADMIN_ROLE_PATTERN = /^(admin|administrator|administrateur|superadmin)$/i

function isAdminFromAuthMetadata(user: any) {
  const metadata = user?.app_metadata || {}
  const roles = [
    metadata.role,
    metadata.app_role,
    ...(Array.isArray(metadata.roles) ? metadata.roles : []),
  ].filter(Boolean)

  return roles.some((role) => typeof role === 'string' && ADMIN_ROLE_PATTERN.test(role.trim()))
}

function isAdminFromAllowlist(email?: string | null) {
  const configuredEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return !!email && configuredEmails.includes(email.toLowerCase())
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

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('user_id, role, first_name, last_name, email, avatar_url')
    .eq('user_id', user.id)
    .single()

  // Use centralized admin verification
  const isAdmin = await verifyAdminAccess(user, profile)

  if (error || !profile || !isAdmin) {
    return null
  }

  return {
    userId: profile.user_id,
    role: profile.role,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
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
