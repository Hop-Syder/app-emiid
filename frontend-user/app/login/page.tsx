/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de connexion de l'application utilisateur (EmiID) - Design 2026 Ultra-Crafted.
 *              Disposition deux colonnes (formulaire glassmorphism / illustration avec badges flottants),
 *              fond enrichi #000616 avec orbes chromatiques et grille tech, salutation dynamique,
 *              citations interactives, boutons OAuth immersifs et vérification Cloudflare Turnstile.
 * @created 2026-05-27
 * @updated 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
// ─────────────────────────────────────────────────────────────────────────────
"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  Shield
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Turnstile } from "@marsidev/react-turnstile"

// ── Types & Constantes ───────────────────────────────────────────────────────

/** Fournisseurs OAuth pris en charge par l'infrastructure Supabase */
type Provider = "google" | "linkedin_oidc" | "apple"

/**
 * Collection de citations motivantes affichées de manière aléatoire
 * pour dynamiser les utilisateurs lors de leur connexion.
 */
const MOTIVATIONAL_QUOTES = [
  "Aujourd'hui est un nouveau jour. C'est votre moment de briller et de propulser vos projets.",
  "Chaque grand projet commence par un premier pas. Faites de cette journée une étape décisive.",
  "Votre réseau et vos compétences sont vos plus grands atouts. Continuez à bâtir votre succès.",
  "Le succès appartient à ceux qui osent passer à l'action. Donnez vie à vos ambitions aujourd'hui.",
  "Transformez vos idées en réussites concrètes. Chaque connexion crée de nouvelles opportunités.",
  "La persévérance est la clé des grandes réalisations. Restez concentré sur vos objectifs.",
  "Votre avenir professionnel s'écrit maintenant. Démarquez-vous avec passion et authenticité.",
  "Le talent ouvre des portes, mais la régularité et la vision forgent les accomplissements durables.",
  "Une nouvelle journée pour apprendre, grandir et atteindre vos sommets professionnels.",
  "L'excellence est une habitude quotidienne. Faites la différence aujourd'hui."
]

/** Configuration des boutons de connexion sociale (OAuth) */
const providers = [
  {
    id: "google" as const,
    name: "Google",
    icon: "/login/google-icon.svg",
    accentGlow: "rgba(66, 133, 244, 0.2)",
    borderHover: "hover:border-blue-400/50",
    soon: false
  },
  {
    id: "linkedin_oidc" as const,
    name: "LinkedIn",
    icon: "/login/linkedin.svg",
    accentGlow: "rgba(10, 102, 194, 0.25)",
    borderHover: "hover:border-[#0A66C2]/60",
    soon: false
  },
  {
    id: "apple" as const,
    name: "Apple",
    icon: "/login/apple.svg",
    accentGlow: "rgba(255, 255, 255, 0.15)",
    borderHover: "hover:border-white/40",
    soon: true
  },
]

/**
 * Clé publique du widget Cloudflare Turnstile.
 */
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEalZMK_1GPBD0mo"

// ── Composant Principal ─────────────────────────────────────────────────────

export default function LoginPage() {
  const supabase = createClient()

  // ── États locaux ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [greeting, setGreeting] = useState("Hello")

  // Salutation intelligente et tirage de citation lors du montage client
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
    setQuoteIndex(randomIndex)

    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting("Bonjour")
    else if (hour >= 12 && hour < 18) setGreeting("Bon après-midi")
    else setGreeting("Bonsoir")
  }, [])

  /** Déclenche la connexion OAuth auprès du fournisseur */
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
      setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.")
      setLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#000616] text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden selection:bg-[#013ff4] selection:text-white">

      {/* ── Conteneur Principal (Colonnes resserrées en desktop) ── */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 lg:gap-8">

        {/* ── Colonne Droite (Desktop) / Bannière Haut (Mobile) : Illustration & Badges ── */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="w-full lg:w-1/2 lg:order-2 flex flex-col justify-center"
        >
          <div className="relative w-full h-64 sm:h-80 lg:h-full lg:min-h-[590px] rounded-2xl overflow-hidden p-[1px] bg-gradient-to-b from-white/10 to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">

            {/* Conteneur intérieur de l'illustration (arrondi 15px pour épouser le cadre 16px) */}
            <div className="relative w-full h-full rounded-[15px] overflow-hidden bg-[#000616]">
              <Image
                src="/login/login-image.jpg"
                alt="EmiID Connexion"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-top lg:object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                priority
              />

              {/* Voile dégradé atmosphérique */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#000616]/90 via-transparent to-black/20 pointer-events-none" />

              {/* ── Badges flottants de réassurance (Desktop & Tablettes) ── */}
              <div className="hidden sm:block">
                {/* Badge 1 : Chiffrement & Sécurité */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
                  transition={{
                    opacity: { duration: 0.6, delay: 0.3 },
                    x: { duration: 0.6, delay: 0.3 },
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute top-5 left-5 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#000616]/85 backdrop-blur-xl border border-white/15 shadow-[0_8px_25px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-white tracking-wide">Auth Sécurisée</span>
                    <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Chiffrement AES-256
                    </span>
                  </div>
                </motion.div>

                {/* Badge 2 : Empreinte Digitale */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, y: [0, 4, 0] }}
                  transition={{
                    opacity: { duration: 0.6, delay: 0.4 },
                    x: { duration: 0.6, delay: 0.4 },
                    y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                  }}
                  className="absolute bottom-5 right-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#000616]/90 backdrop-blur-xl border border-[#013ff4]/30 shadow-[0_10px_30px_rgba(1,63,244,0.25)]"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white tracking-wide">EmiID Pass</span>
                    <span className="text-[9px] text-[#A8B0C7]">Votre empreinte pro</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Colonne Gauche : Formulaire & Actions Authentification ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-1/2 lg:order-1 flex items-center justify-center"
        >
          <div className="w-full max-w-[420px] p-6 sm:p-7 rounded-2xl bg-[#000616] sm:bg-[#060D1E]/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative">

            {/* Logo EmiID */}
            <div className="flex items-center justify-between mb-5">
              <Link href="/" className="inline-flex items-center group transition-transform hover:scale-[1.02]">
                <Image
                  src="/logo/logo-emiid.png"
                  alt="EmiID"
                  width={145}
                  height={36}
                  className="h-7.5 w-auto object-contain drop-shadow-[0_2px_12px_rgba(1,63,244,0.3)]"
                  priority
                />
              </Link>
            </div>

            {/* En-tête : Salutation */}
            <div className="flex items-center justify-between gap-2 mt-1">
              <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-white flex items-center gap-2">
                {greeting} <span className="inline-block animate-wave origin-bottom-right">👋</span>
              </h1>
            </div>

            {/* Phrase de motivation interactive */}
            <div className="mt-3 min-h-[54px] relative flex items-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-xs sm:text-[13px] text-[#A8B0C7] leading-relaxed italic"
                >
                  &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex]}&rdquo;
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Message d'erreur éventuel */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-3 text-center font-medium flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Case à cocher CGU / Confidentialité */}
            <motion.button
              type="button"
              onClick={() => setAccepted((v: boolean) => !v)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-3 w-full text-left mt-4 p-1.5 rounded-lg hover:bg-white/[0.02] transition-colors group cursor-pointer"
            >
              <div
                className={`mt-0.5 shrink-0 w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-300 shadow-sm ${accepted
                  ? "bg-gradient-to-tr from-[#013ff4] to-[#03b3f8] border-transparent shadow-[0_0_12px_rgba(1,63,244,0.5)] scale-105"
                  : "bg-white/[0.04] border-white/20 group-hover:border-[#03b3f8]/60"
                  }`}
              >
                {accepted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <p className="text-[12px] text-[#A8B0C7] leading-relaxed select-none">
                J&apos;accepte les{" "}
                <Link
                  href="/conditions"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="text-[#03b3f8] hover:text-white underline underline-offset-4 decoration-[#03b3f8]/40 hover:decoration-white transition-colors"
                >
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href="/confidentialite"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="text-[#03b3f8] hover:text-white underline underline-offset-4 decoration-[#03b3f8]/40 hover:decoration-white transition-colors"
                >
                  politique de confidentialité
                </Link>{" "}
                d&apos;EmiID.
              </p>
            </motion.button>

            {/* Widget Cloudflare Turnstile */}
            <div className="flex flex-col items-center justify-center mt-4 pt-3 border-t border-white/[0.06]">
              <div className="relative">
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  options={{ theme: "dark", size: "normal" }}
                  onSuccess={(token: string) => setCaptchaToken(token)}
                  onError={() => setCaptchaToken(null)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#6A7596]">
                <Shield className="w-3 h-3 text-[#03b3f8]/70" />
                <span>Protection antibot sécurisée</span>
              </div>
            </div>

            {/* Boutons d'authentification OAuth 2026 */}
            <div className="flex flex-col gap-3 mt-4">
              {providers.map((p, i) => {
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className="relative"
                  >
                    {p.soon && (
                      <span className="absolute -top-2 right-4 z-20 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#000616] shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                        Bientôt
                      </span>
                    )}

                    <Button
                      variant="outline"
                      disabled={loading !== null || !accepted || !captchaToken || p.soon}
                      onClick={() => !p.soon && handleLogin(p.id)}
                      aria-disabled={p.soon}
                      title={p.soon ? "Indisponible pour l'instant" : undefined}
                      className={`relative w-full h-[50px] rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.12] ${p.borderHover} text-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-xl group overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]`}
                    >
                      {/* Halo réactif au survol */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, ${p.accentGlow} 0%, transparent 70%)`
                        }}
                      />

                      <span className="relative z-10 flex items-center justify-between w-full px-2">
                        <div className="flex items-center gap-3">
                          {loading === p.id ? (
                            <Loader2 className="w-4.5 h-4.5 animate-spin text-[#03b3f8]" />
                          ) : (
                            <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center bg-white/10 p-1 group-hover:scale-110 transition-transform duration-300">
                              <Image
                                src={p.icon}
                                alt={p.name}
                                width={19}
                                height={19}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span className="font-semibold text-sm tracking-wide text-white group-hover:text-[#03b3f8] transition-colors">
                            Continuer avec {p.name}
                          </span>
                        </div>

                        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </span>
                    </Button>
                  </motion.div>
                )
              })}
            </div>

            {/* Pied de carte : Statut & Droits */}
            <div className="mt-6 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#6A7596]">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-400/90 font-medium">Systèmes 100% opérationnels</span>
              </div>
              <span>© {new Date().getFullYear()} EmiID</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
