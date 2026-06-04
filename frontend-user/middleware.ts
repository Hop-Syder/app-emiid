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

  // Rediriger le dashboard public vers la racine pour centraliser le trafic public
  if (path === '/dashboard-public') {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

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
  // Public sans session: racine, login, callback auth, dashboard public (redirigé), annuaire et profils publics directs.
  // /profil seul reste privé car il redirige vers le profil du compte connecté.
  const publicRoutes = new Set(['/', '/login', '/auth/callback', '/dashboard-public', '/conditions', '/confidentialite'])
  const publicPrefixes = ['/auth/', '/annuaire']
  const isPublicProfileDetail = /^\/profil\/[^/]+\/?$/.test(path)

  // Protected (doivent être authentifiés)
  const protectedPrefixes = [
    '/dashboard-user',
    '/messages',
    '/notifications',
    '/parametres',
    '/portefeuille',
    '/creer-profil',
  ]

  const isExplicitPublic = publicRoutes.has(path) || publicPrefixes.some((prefix) => path.startsWith(prefix)) || isPublicProfileDetail
  const isProtected = path === '/profil' || protectedPrefixes.some((prefix) => path.startsWith(prefix))

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
  // -> On le force à aller sur l'Onboarding (/) ou le Login
  if (!user && (isProtected || !isExplicitPublic)) {
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
