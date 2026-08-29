/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de connexion de l'application utilisateur (EmiID) - Design 2026 Ultra-Crafted.
 *              Disposition deux colonnes asymétrique : à gauche, uniquement les
 *              boutons de connexion (aucun formulaire email/mot de passe) ; à
 *              droite, un grand panneau de citations motivantes qui tourne
 *              automatiquement — inspiré de la page de connexion Supabase.
 *              Fond enrichi #000616 avec orbes chromatiques et grille tech,
 *              salutation dynamique, boutons OAuth immersifs, badge « Dernier
 *              utilisé » persistant (localStorage) et vérification Cloudflare
 *              Turnstile.
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
  Lock,
  ArrowRight,
  Shield,
  Quote
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Turnstile } from "@marsidev/react-turnstile"

/** Provider mis en avant au dernier login réussi sur cet appareil. */
const LAST_PROVIDER_KEY = "emiid_last_provider"

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
  const [lastProvider, setLastProvider] = useState<Provider | null>(null)

  // Salutation intelligente, tirage de citation et provider mémorisé lors du montage client
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
    setQuoteIndex(randomIndex)

    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting("Bonjour")
    else if (hour >= 12 && hour < 18) setGreeting("Bon après-midi")
    else setGreeting("Bonsoir")

    try {
      const stored = window.localStorage.getItem(LAST_PROVIDER_KEY) as Provider | null
      if (stored && providers.some((p) => p.id === stored)) setLastProvider(stored)
    } catch {
      // localStorage indisponible (navigation privée stricte) : pas de badge, sans conséquence.
    }
  }, [])

  // Rotation automatique des citations côté panneau de droite — un rythme
  // lent, le temps de les lire, sans jamais couper la lecture en cours.
  useEffect(() => {
    const id = window.setInterval(() => {
      setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length)
    }, 7000)
    return () => window.clearInterval(id)
  }, [])

  /** Déclenche la connexion OAuth auprès du fournisseur */
  const handleLogin = async (provider: Provider) => {
    if (!accepted || !captchaToken) return
    setError(null)
    setLoading(provider)
    try {
      try {
        window.localStorage.setItem(LAST_PROVIDER_KEY, provider)
      } catch {
        // localStorage indisponible : le badge « Dernier utilisé » restera simplement absent.
      }
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
    <div className="relative min-h-screen w-full bg-[#000616] text-white flex flex-col lg:flex-row overflow-hidden selection:bg-[#013ff4] selection:text-white">

      {/* ══════════════════════════════════════════════════════════════════
          COLONNE GAUCHE — uniquement les fournisseurs de connexion.
          Aucun champ email/mot de passe : EmiID est 100% OAuth.
          ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full lg:w-[440px] xl:w-[480px] shrink-0 flex items-center justify-center px-6 sm:px-10 py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[360px]"
        >
          {/* Logo EmiID */}
          <Link href="/" className="inline-flex items-center group transition-transform hover:scale-[1.02] mb-10">
            <Image
              src="/login/login-back.png"
              alt="EmiID"
              width={110}
              height={28}
              className="h-6 w-auto object-contain drop-shadow-[0_2px_12px_rgba(1,63,244,0.3)]"
              priority
            />
          </Link>

          {/* En-tête */}
          <h1 className="text-[28px] sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            {greeting} <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="mt-2 text-sm text-[#8891AC] leading-relaxed">
            Connectez-vous pour retrouver votre empreinte numérique professionnelle.
          </p>

          {/* Message d'erreur éventuel */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-3 text-center font-medium flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Boutons d'authentification OAuth */}
          <div className="flex flex-col gap-3 mt-7">
            {providers.map((p, i) => {
              const isLastUsed = !p.soon && lastProvider === p.id
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="relative"
                >
                  {p.soon && (
                    <span className="absolute -top-2 right-4 z-20 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#000616] shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                      Bientôt
                    </span>
                  )}
                  {isLastUsed && (
                    <span className="absolute -top-2 right-4 z-20 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">
                      Dernier utilisé
                    </span>
                  )}

                  <Button
                    variant="outline"
                    disabled={loading !== null || !accepted || !captchaToken || p.soon}
                    onClick={() => !p.soon && handleLogin(p.id)}
                    aria-disabled={p.soon}
                    title={p.soon ? "Indisponible pour l'instant" : undefined}
                    className={`relative w-full h-[50px] rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border ${isLastUsed ? "border-emerald-500/40" : "border-white/[0.12]"} ${p.borderHover} text-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-xl group overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]`}
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

          {/* Case à cocher CGU / Confidentialité */}
          <motion.button
            type="button"
            onClick={() => setAccepted((v: boolean) => !v)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-start gap-3 w-full text-left mt-5 p-1.5 rounded-lg hover:bg-white/[0.02] transition-colors group cursor-pointer"
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
          <div className="flex flex-col items-center justify-center mt-4 pt-4 border-t border-white/[0.06]">
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

          {/* Pied de page : Statut & Droits */}
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
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          COLONNE DROITE — citations motivantes, en rotation automatique.
          Masquée en mobile : priorité aux boutons de connexion.
          ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex relative flex-1 items-center justify-center px-16 xl:px-24 overflow-hidden bg-gradient-to-br from-[#00040f] via-[#000b24] to-[#000616]">
        {/* Grille technique subtile */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Orbes chromatiques */}
        <div className="absolute -top-32 -right-24 w-[26rem] h-[26rem] bg-[#013ff4]/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-24 w-[26rem] h-[26rem] bg-[#03b3f8]/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <Quote className="w-12 h-12 text-[#013ff4]/40" strokeWidth={2.5} />

          <div className="mt-6 min-h-[190px] xl:min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-2xl xl:text-[28px] font-bold leading-snug tracking-tight text-white"
              >
                {MOTIVATIONAL_QUOTES[quoteIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Image
              src="/login/login-back.png"
              alt="EmiID"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">EmiID</span>
              <span className="text-xs text-[#6A7596]">Votre empreinte numérique professionnelle</span>
            </div>
          </div>

          {/* Puces de progression des citations */}
          <div className="mt-8 flex items-center gap-1.5">
            {MOTIVATIONAL_QUOTES.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${i === quoteIndex ? "w-6 bg-[#03b3f8]" : "w-1.5 bg-white/15"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
