/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de connexion social media avec authentification Supabase (WOW Edition)
 * @created 2025-12-24
 * @updated 2025-12-27
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Globe, Loader2, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Provider = "google" | "linkedin" | "apple"

export default function LoginPage() {
  const supabase = createClient()

  const [providerLoading, setProviderLoading] = useState<Provider | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleLogin = async (provider: Provider) => {
    if (!acceptedTerms) return
    try {
      setProviderLoading(provider)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (e) {
      console.error(e)
      setProviderLoading(null)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/connexion/background.jpg')" }}
    >
      {/* LEFT — Branding (TOUJOURS VISIBLE) */}
      <section
        className="relative w-full lg:w-1/2 h-[40vh] lg:h-auto 
                   flex flex-col justify-between px-6 py-8 lg:p-12 text-white"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/logo/logo-2.png"
            alt="Nexus Connect Logo"
            width={20}
            height={20}
            className="h-auto w-auto object-contain"
          />
        </div>

        <blockquote className="relative z-10 max-w-md space-y-3">
          <p className="text-lg lg:text-2xl leading-relaxed">
            &ldquo;Connecter les talents, les visions et les opportunités en Afrique de l’Ouest.&rdquo;
          </p>
          <footer className="text-sm text-zinc-300">
            — Nexus Partners
          </footer>
        </blockquote>

        <p className="relative z-10 text-xs lg:text-sm text-zinc-400">
          © 2025 Nexus Partners
        </p>
      </section>

      {/* RIGHT — Auth */}
      <section className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-10 rounded-3xl 
                        bg-white/70 backdrop-blur-xl p-8 
                        shadow-xl border border-white/50">

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Accès membre
            </h2>
            <p className="text-gray-500">
              Connexion rapide et sécurisée
            </p>
          </div>

          {/* OAuth */}
          <div className="flex justify-center gap-6">
            {(["google", "linkedin", "apple"] as Provider[]).map((provider) => (
              <div key={provider} className="flex flex-col items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={!acceptedTerms || providerLoading !== null}
                  onClick={() => handleLogin(provider)}
                  className="h-16 w-16 rounded-2xl 
                             transition-all hover:scale-105 hover:shadow-xl
                             active:scale-95 disabled:opacity-40
                             bg-white/80 backdrop-blur-md
                             hover:bg-[#022753] hover:text-white hover:border-[#022753]"
                >
                  {providerLoading === provider ? (
                    <Loader2 className="animate-spin text-primary" />
                  ) : (
                    <OAuthIcon provider={provider} />
                  )}
                </Button>
                <span className="text-xs text-gray-500 capitalize">
                  {provider}
                </span>
              </div>
            ))}
          </div>

          {providerLoading && (
            <p className="text-center text-sm text-gray-500 animate-pulse">
              Connexion sécurisée en cours…
            </p>
          )}

          {/* Terms */}
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(v) => setAcceptedTerms(!!v)}
            />
            <label htmlFor="terms" className="cursor-pointer leading-relaxed">
              J’accepte les{" "}
              <Link href="#" className="underline hover:text-primary">
                conditions d’utilisation
              </Link>{" "}
              et la{" "}
              <Link href="#" className="underline hover:text-primary">
                politique de confidentialité
              </Link>
              .
            </label>
          </div>

          {/* Trust */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="size-4 text-primary" />
            Connexion 100 % sécurisée
          </div>
        </div>
      </section>
    </div>
  )
}

/* ---------- ICONS ---------- */

function OAuthIcon({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg className="h-7 w-7" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    )
  }

  if (provider === "linkedin") {
    return (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#0077B5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455z" />
        <path d="M5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065z" />
        <path d="M7.119 20.452H3.555V9h3.564z" />
      </svg>
    )
  }

  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.67-1.02 1.25.1 2.91.82 3.33 1.39-4.22 2.37-3.22 7.74 1.1 9.49-1.39 3.07-3.4 4.54-3.18 2.37z" />
    </svg>
  )
}
