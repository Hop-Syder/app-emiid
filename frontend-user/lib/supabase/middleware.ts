import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() est plus sûr que getSession() pour le middleware
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Les routes qui ne nécessitent PAS de connexion
  // Note: La page de login est à la racine '/'
  const isPublicRoute = pathname === '/' || 
                        pathname === '/auth/callback' ||
                        pathname.startsWith('/api/') ||
                        pathname.startsWith('/_next') ||
                        pathname === '/favicon.ico'

  // Protection : Si on n'est pas sur une route publique et pas connecté -> redirection vers '/'
  if (!isPublicRoute && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Si on est déjà connecté et qu'on tente d'aller sur la page de login ('/') -> redirection vers '/dashboard-user'
  if (pathname === '/' && user) {
     return NextResponse.redirect(new URL('/dashboard-user', request.url))
  }

  return response
}
