/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de connexion de l'application utilisateur (EmiID).
 *              Layout deux colonnes (formulaire / illustration) sur desktop,
 *              empilé avec bannière image en tête sur mobile.
 * @created 2026-05-27
 * @updated 2026-08-28
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
// ──────────────────────────────────
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Turnstile } from "@marsidev/react-turnstile"

type Provider = "google" | "linkedin_oidc" | "apple"

const providers = [
  { id: "google" as const,        name: "Google",   icon: "/login/google-icon.svg", soon: false },
  { id: "linkedin_oidc" as const, name: "LinkedIn", icon: "/login/linkedin.svg",     soon: false },
  // Apple désactivé tant que le provider n'est pas configuré (Apple Developer + Supabase).
  // Réactivation : passer `soon` à false.
  { id: "apple" as const,         name: "Apple",    icon: "/login/apple.svg",        soon: true  },
]

/**
 * Clé publique du widget Cloudflare Turnstile.
 *
 * Publique par nature : elle identifie le widget côté navigateur. C'est la
 * SECRET key qui vérifie les jetons, et elle n'appartient pas à ce dépôt —
 * elle est renseignée dans le tableau de bord Supabase, qui valide chaque
 * jeton au moment de l'authentification.
 */
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEalZMK_1GPBD0mo"

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleLogin = async (provider: Provider) => {
    if (!accepted || !captchaToken) return
    setError(null)
    setLoading(provider)
    try {
      const callbackUrl = `${location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl },
      })
      if (error) throw error
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-8">

        {/* ── Illustration — bannière sur mobile, colonne droite sur desktop ── */}
        <div className="w-full lg:w-1/2 lg:order-2">
          <div className="relative w-full h-56 sm:h-72 lg:h-full lg:min-h-[640px] rounded-[24px] overflow-hidden bg-[#0C1421]">
            <Image
              src="/login/background.avif"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* ── Bloc d'authentification ─────────────────────────────────── */}
        <div className="w-full lg:w-1/2 lg:order-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-[388px] mx-auto"
          >
            <Link href="/" className="inline-flex items-center w-fit mb-10">
              <Image
                src="/logo/logo-emiid.png"
                alt="EmiID"
                width={160}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>

            <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-[#0C1421] leading-[1.15]">
              Bon retour 👋
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[#313957] leading-relaxed">
              Aujourd&apos;hui est un nouveau jour. C&apos;est votre jour, à vous de le façonner. Connectez-vous pour continuer à gérer vos projets.
            </p>

            {/* Erreur */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center font-medium"
              >
                {error}
              </motion.p>
            )}

            {/* Case à cocher CGU — obligatoire */}
            <motion.button
              type="button"
              onClick={() => setAccepted(v => !v)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex items-start gap-3 w-full text-left mt-7 group"
            >
              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                accepted
                  ? "bg-[#1E4AE9] border-[#1E4AE9]"
                  : "bg-white border-[#CFDFE2] group-hover:border-[#1E4AE9]"
              }`}>
                {accepted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <p className="text-[13px] text-[#313957] leading-relaxed">
                J&apos;accepte les{" "}
                <Link
                  href="/conditions"
                  onClick={e => e.stopPropagation()}
                  className="text-[#1E4AE9] hover:underline underline-offset-2 transition-colors"
                >
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href="/confidentialite"
                  onClick={e => e.stopPropagation()}
                  className="text-[#1E4AE9] hover:underline underline-offset-2 transition-colors"
                >
                  politique de confidentialité
                </Link>{" "}
                d&apos;EmiID.
              </p>
            </motion.button>

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center mt-6">
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                options={{ theme: "light" }}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
              />
            </div>

            {/* Boutons providers */}
            <div className="flex flex-col gap-4 mt-7">
              {providers.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="relative"
                >
                  {p.soon && (
                    <span className="absolute -top-2 right-3 z-20 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#0C1421] shadow-sm">
                      Bientôt
                    </span>
                  )}
                  <Button
                    variant="outline"
                    disabled={loading !== null || !accepted || !captchaToken || p.soon}
                    onClick={() => !p.soon && handleLogin(p.id)}
                    aria-disabled={p.soon}
                    title={p.soon ? "Indisponible pour l'instant" : undefined}
                    className="relative w-full h-[52px] rounded-xl bg-[#F3F9FA] border border-[#CFDFE2] hover:bg-[#E9F2F4] text-[#313957] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                  >
                    <span className="flex items-center justify-center gap-3">
                      {loading === p.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Image
                          src={p.icon}
                          alt=""
                          width={22}
                          height={22}
                          className="object-contain"
                        />
                      )}
                      <span className="font-semibold text-[15px] text-[#313957]">
                        Continuer avec {p.name}
                      </span>
                    </span>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-[#313957]">
              Vous n&apos;avez pas de compte ?{" "}
              <Link href="/login" className="text-[#1E4AE9] font-semibold hover:underline underline-offset-2">
                Inscrivez-vous
              </Link>
            </p>

            <p className="mt-10 text-center text-xs text-[#959CB6]">
              © 2023 TOUS DROITS RÉSERVÉS
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
