/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de connexion de l'application utilisateur (EmiID).
 *              Layout deux colonnes (formulaire / illustration) sur desktop,
 *              empilé avec bannière image en tête sur mobile.
 *              Inclut une section d'accueil inspirante avec citations aléatoires,
 *              vérification Cloudflare Turnstile, acceptation des CGU et authentification OAuth.
 * @created 2026-05-27
 * @updated 2026-08-28
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
import { Loader2, Check, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Turnstile } from "@marsidev/react-turnstile"

// ── Types & Constantes ───────────────────────────────────────────────────────

/** Fournisseurs OAuth pris en charge par l'infrastructure Supabase */
type Provider = "google" | "linkedin_oidc" | "apple"

/**
 * Collection de citations motivantes affichées de manière aléatoire
 * pour accueillir et dynamiser les utilisateurs lors de leur connexion.
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
    { id: "google" as const, name: "Google", icon: "/login/google-icon.svg", soon: false },
    { id: "linkedin_oidc" as const, name: "LinkedIn", icon: "/login/linkedin.svg", soon: false },
    // Apple désactivé tant que le provider n'est pas configuré (Apple Developer + Supabase).
    // Réactivation : passer `soon` à false.
    { id: "apple" as const, name: "Apple", icon: "/login/apple.svg", soon: true },
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

// ── Composant Principal ─────────────────────────────────────────────────────

export default function LoginPage() {
    // Client Supabase pour les requêtes d'authentification côté navigateur
    const supabase = createClient()

    // ── États locaux du composant ──────────────────────────────────────────────
    const [loading, setLoading] = useState<Provider | null>(null) // Provider en cours de chargement
    const [error, setError] = useState<string | null>(null) // Message d'erreur éventuel
    const [accepted, setAccepted] = useState(false) // Accord obligatoire CGU / Confidentialité
    const [captchaToken, setCaptchaToken] = useState<string | null>(null) // Jeton de sécurité Cloudflare Turnstile
    const [quoteIndex, setQuoteIndex] = useState(0) // Index de la citation motivante affichée

    // Tirage au sort d'une citation motivante lors du premier rendu client
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
        setQuoteIndex(randomIndex)
    }, [])

    /** Passe à la citation motivante suivante avec transition animée */
    const nextQuote = () => {
        setQuoteIndex((prev: number) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
    }

    /**
     * Déclenche la connexion OAuth auprès du fournisseur sélectionné
     * après vérification du captcha et acceptation des CGU.
     */
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
        <div className="relative min-h-screen w-full bg-[#000616] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            {/* ── Illustration en arrière-plan (grand format & discret) ── */}
            <motion.div
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center"
                aria-hidden="true"
            >
                <div className="relative w-full h-full max-w-6xl max-h-[880px] opacity-[0.12] sm:opacity-[0.18]">
                    <Image
                        src="/login/login-background.jpg"
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover sm:object-contain object-center"
                        priority
                    />
                </div>
                {/* Dégradés pour fondre subtilement l'illustration dans le thème sombre */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#000616]/70 via-transparent to-[#000616]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#000616_75%)]" />
            </motion.div>

            {/* ── Bloc d'authentification (formulaire & actions) ────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="relative z-10 w-full max-w-[400px] mx-auto"
            >
                {/* Logo EmiID : visible sur mobile & desktop */}
                <Link href="/" className="inline-flex items-center w-fit mb-8 sm:mb-10">
                    <Image
                        src="/logo/logo-emiid.png"
                        alt="EmiID"
                        width={160}
                        height={40}
                        className="h-9 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* En-tête : Salutation & bouton d'inspiration interactif */}
                <div className="flex items-center justify-between">
                    <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-white leading-[1.15]">
                        Hello 👋
                    </h1>
                    <button
                        type="button"
                        onClick={nextQuote}
                        aria-label="Changer de citation de motivation"
                        title="Autre phrase de motivation"
                        className="group flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#1E4AE9] hover:text-[#1637B0] bg-[#1E4AE9]/5 hover:bg-[#1E4AE9]/10 rounded-full transition-all duration-200 border border-[#1E4AE9]/15 cursor-pointer"
                    >
                        <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-active:rotate-12 text-[#1E4AE9]" />
                        <span>Inspiration</span>
                    </button>
                </div>

                {/* Phrase de motivation avec animation fluide de transition */}
                <div className="mt-3 min-h-[56px] relative">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={quoteIndex}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="text-base sm:text-lg text-[#A8B0C7] leading-relaxed"
                        >
                            {MOTIVATIONAL_QUOTES[quoteIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Affichage des erreurs d'authentification */}
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-center font-medium"
                    >
                        {error}
                    </motion.p>
                )}

                {/* Case à cocher CGU / Confidentialité (prérequis obligatoire pour se connecter) */}
                <motion.button
                    type="button"
                    onClick={() => setAccepted((v: boolean) => !v)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-start gap-3 w-full text-left mt-7 group"
                >
                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${accepted
                        ? "bg-[#1E4AE9] border-[#1E4AE9]"
                        : "bg-transparent border-white/20 group-hover:border-[#1E4AE9]"
                        }`}>
                        {accepted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <p className="text-[13px] text-[#A8B0C7] leading-relaxed">
                        J&apos;accepte les{" "}
                        <Link
                            href="/conditions"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="text-[#1E4AE9] hover:underline underline-offset-2 transition-colors"
                        >
                            conditions d&apos;utilisation
                        </Link>{" "}
                        et la{" "}
                        <Link
                            href="/confidentialite"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="text-[#1E4AE9] hover:underline underline-offset-2 transition-colors"
                        >
                            politique de confidentialité
                        </Link>{" "}
                        d&apos;EmiID.
                    </p>
                </motion.button>

                {/* Widget de sécurité Cloudflare Turnstile */}
                <div className="flex justify-center mt-6">
                    <Turnstile
                        siteKey={TURNSTILE_SITE_KEY}
                        options={{ theme: "dark" }}
                        onSuccess={(token: string) => setCaptchaToken(token)}
                        onError={() => setCaptchaToken(null)}
                        onExpire={() => setCaptchaToken(null)}
                    />
                </div>

                {/* Boutons d'authentification OAuth (Google, LinkedIn, Apple) */}
                <div className="flex flex-col gap-4 mt-7">
                    {providers.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.08 }}
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

                {/* Mentions légales & copyright */}
                <p className="mt-10 text-center text-xs text-[#959CB6]">
                    © 2023 TOUS DROITS RÉSERVÉS
                </p>
            </motion.div>
        </div>
    )
}
