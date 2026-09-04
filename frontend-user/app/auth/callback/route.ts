/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Callback d'authentification interceptant la réinitialisation du code PIN
 * @created 2026-04-11
 * @updated 2026-05-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/ // ──────────────────────────────────

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard-user"
  const resetPin = searchParams.get("reset_pin") === "true"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      // Réinitialisation PIN — chemin spécifique, sans passage par la création de profil
      if (resetPin && user) {
        // eslint-disable-next-line no-restricted-syntax -- accès authentifié à SA propre ligne (RLS OK)
        await supabase
          .from("user_profiles")
          .update({
            pin_enabled: false,
            pin_code: null,
            pin_attempts: 0,
            is_locked: false,
            locked_at: null,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id)
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Détection nouvel utilisateur : pas de profil ou has_profile = false.
      // Il est envoyé DIRECTEMENT à la création de profil. Le carrousel de
      // présentation (/onboarding) qui s'intercalait ici a été retiré : trois
      // écrans qui ne collectaient rien, entre l'authentification et le seul
      // écran qui compte. Le compte se crée d'autant plus vite.
      //
      // `has_profile` reste posé — updateMyProfile (backend) l'écrit en dur à
      // chaque enregistrement de profil, donc dès la première sauvegarde du
      // tunnel. Le marquage que faisait le carrousel était redondant.
      if (user) {
        // eslint-disable-next-line no-restricted-syntax -- accès authentifié à SA propre ligne (RLS OK)
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("has_profile")
          .eq("user_id", user.id)
          .maybeSingle()

        const isNewUser = !profile || !profile.has_profile
        if (isNewUser) {
          return NextResponse.redirect(`${origin}/creer-profil`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
