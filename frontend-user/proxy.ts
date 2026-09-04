import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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

  // --- VERROU DE SUSPENSION ---
  // Un compte suspendu (et non expiré) est verrouillé : aucune action possible,
  // toute navigation est renvoyée vers /suspendu. Vérifié à chaque requête.
  let isSuspended = false
  if (user) {
    // eslint-disable-next-line no-restricted-syntax -- accès authentifié à SA PROPRE ligne (RLS OK) pour lire l'état de suspension
    const { data: prof } = await supabase
      .from('user_profiles')
      .select('is_suspended, suspended_until')
      .eq('user_id', user.id)
      .maybeSingle()
    isSuspended = !!prof?.is_suspended &&
      (!prof.suspended_until || new Date(prof.suspended_until as string).getTime() > Date.now())
  }

  if (path.startsWith('/api')) {
    // Un compte suspendu ne peut effectuer AUCUNE action via l'API.
    if (isSuspended) {
      return NextResponse.json({ error: 'ACCOUNT_SUSPENDED' }, { status: 403 })
    }
    return response
  }

  if (isSuspended) {
    // Seules la page /suspendu et le callback d'auth (déconnexion) restent accessibles.
    if (path !== '/suspendu' && path !== '/auth/callback') {
      url.pathname = '/suspendu'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return response
  }

  // Un utilisateur NON suspendu ne doit jamais rester bloqué sur /suspendu.
  if (path === '/suspendu') {
    url.pathname = user ? '/dashboard-user' : '/login'
    return NextResponse.redirect(url)
  }

  if (user?.user_metadata?.account_disabled) {
    if (path !== '/' && path !== '/login') {
      await supabase.auth.signOut()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // --- ROUTING ---
  // Public sans session: racine, login, callback auth, dashboard public (redirigé), annuaire et profils publics directs, assets PWA/SEO.
  // /profil seul reste privé car il redirige vers le profil du compte connecté.
  const publicRoutes = new Set([
    '/',
    '/login',
    '/auth/callback',
    '/dashboard-public',
    '/conditions',
    '/confidentialite',
    '/manifest.webmanifest',
    '/site.webmanifest',
    '/sw.js',
    '/robots.txt',
    '/sitemap.xml',
  ])
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
  // S'il essaie de retourner sur la racine (/) ou le Login (/login)
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

// Configuration : On exclut les fichiers statiques (images, polices, JS, manifest, Service Worker) du middleware.
// Important : les polices woff/woff2/ttf/otf/eot doivent y figurer. Un @font-face est chargé par le
// navigateur en mode CORS anonyme (sans cookie) ; sans cette exclusion, la requête de police est vue
// comme non authentifiée et redirigée vers /login, renvoyant du HTML → « Failed to decode font ».
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|site.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|webmanifest|json|js|woff|woff2|ttf|otf|eot)$).*)',
  ],
}

export default proxy
export { proxy as middleware }
