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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Routes publiques (ajouter ici si besoin)
  const isPublicRoute = request.nextUrl.pathname === '/login' || 
                        request.nextUrl.pathname === '/auth/callback' ||
                        request.nextUrl.pathname.startsWith('/api/') // L'API a sa propre auth

  // Protection des routes privées
  const isPrivateRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                         request.nextUrl.pathname.startsWith('/annuaire') ||
                         request.nextUrl.pathname.startsWith('/portefeuille') ||
                         request.nextUrl.pathname.startsWith('/creer-') ||
                         request.nextUrl.pathname.startsWith('/market-projets') ||
                         request.nextUrl.pathname.startsWith('/messages') ||
                         request.nextUrl.pathname.startsWith('/parametres')

  if (isPrivateRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rediriger vers dashboard si déjà connecté et tente d'aller sur login
  if (request.nextUrl.pathname === '/login' && user) {
     return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
