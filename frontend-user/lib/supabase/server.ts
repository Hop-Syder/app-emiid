/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Client Supabase côté serveur avec gestion double source :
 *              cookies de session SSR + en-tête Authorization Bearer.
 * @created 2026-04-11
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

/**
 * Crée un client Supabase serveur.
 * Si un customToken (JWT) est fourni, crée un client authentifié avec ce Bearer token.
 * Sinon, se base sur les cookies HTTP de session Next.js.
 */
export async function createClient(customToken?: string | null): Promise<SupabaseClient<Database>> {
  if (customToken) {
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${customToken}`,
          },
        },
      }
    )
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
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
              cookieStore.set(name, value, options)
            )
          } catch {
            // Le contexte Server Component ou réponse figée peut ignorer
          }
        },
      },
    }
  ) as unknown as SupabaseClient<Database>
}

/**
 * Récupère l'utilisateur connecté de façon résiliente :
 * 1. Priorité au Bearer token dans Authorization si fourni
 * 2. Repli automatique sur les cookies de session SSR
 */
export async function getAuthenticatedUser(request?: NextRequest | Request) {
  const authHeader = request?.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  if (bearerToken) {
    try {
      const clientWithToken = await createClient(bearerToken)
      const { data: { user }, error } = await clientWithToken.auth.getUser(bearerToken)
      if (!error && user) {
        return { user, supabase: clientWithToken }
      }
    } catch (e) {
      console.warn('[auth] Échec vérification Bearer token, repli cookies:', e)
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { user, supabase }
}

