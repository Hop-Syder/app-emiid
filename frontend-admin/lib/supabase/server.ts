import { createServerClient } from '@supabase/ssr'
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
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('user_id, role, first_name, last_name, email, avatar_url')
    .eq('user_id', user.id)
    .single()

  if (error || !profile || !profile.role?.toLowerCase().includes('admin')) {
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

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}
