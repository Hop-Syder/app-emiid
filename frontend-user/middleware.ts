import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Initialisation de la réponse
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 2. Configuration du client Supabase (Lecture des Cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 3. Vérification de l'utilisateur (Appel rapide à Supabase)
  const { data: { user } } = await supabase.auth.getUser()
  
  const url = request.nextUrl.clone()
  const path = url.pathname

  if (path.startsWith('/api')) {
    return response
  }

  if (user?.user_metadata?.account_disabled) {
    if (path !== '/' && path !== '/login') {
      await supabase.auth.signOut()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // --- ROUTING ---
  // Public (toujours accessibles)
  const publicRoutes = new Set(['/', '/login', '/auth/callback', '/dashboard-public'])
  const publicPrefixes = ['/annuaire', '/profil', '/auth/']

  // Protected (doivent être authentifiés)
  const protectedPrefixes = ['/dashboard-user', '/messages', '/parametres', '/portefeuille', '/creer-profil']

  const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix))

  // --- LOGIQUE DE REDIRECTION ---

  // CAS 1 : L'utilisateur est DÉJÀ CONNECTÉ (Connu)
  // S'il essaie de retourner sur l'Onboarding (/) ou le Login (/login)
  // -> On le force à aller sur le dashboard-user.
  if (user && (path === '/' || path === '/login')) {
    url.pathname = '/dashboard-user'
    return NextResponse.redirect(url)
  }

  // CAS 2 : L'utilisateur N'EST PAS CONNECTÉ (Inconnu)
  // S'il essaie d'aller sur une page privée (ex: /dashboard-user, /messages, /parametres...)
  // -> On le force à aller sur l'Onboarding (/)
  if (!user && isProtected) {
    url.pathname = '/login'
    url.searchParams.set('next', `${path}${url.search}`)
    return NextResponse.redirect(url)
  }

  // Si aucun des cas ci-dessus, on laisse passer (ex: User connecté va sur dashboard-user)
  return response
}

// Configuration : On exclut les fichiers statiques (images, CSS, JS) du middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
