/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header Dashboard — hero épuré, centré sur la recherche.
 *
 *              Refonte du 04/09 : le bloc a été allégé pour aller à l'essentiel.
 *              Retirés — le tag « Espace Membre » (qui n'apprenait rien à un
 *              utilisateur déjà connecté), l'image de fond (poids de chargement
 *              et contraste à gérer, pour un simple décor) et l'encart BAGBE.
 *              Le fond se limite désormais à la couleur de charte et deux halos.
 *              Restent la salutation « Bonsoir, Prénom » en corps réduit, puis
 *              une barre de recherche de profils, au clavier ou à la voix —
 *              l'action la plus fréquente devient la plus accessible.
 * @created 2026-05-31
 * @updated 2026-09-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight, Briefcase, Mic, Search } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { useVoiceSearch } from "@/hooks/use-voice-search"
import { NotificationsBellLink } from "./notifications-bell-link"

export function DashboardBentoHeader() {
    const router = useRouter()
    const { session } = useCurrentUserProfile()
    const [query, setQuery] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    // Salutation selon l'heure. Calculée après montage : l'heure du serveur
    // n'est pas celle du visiteur, la figer au rendu produirait un décalage
    // d'hydratation — et un « Bonjour » à 21 h.
    const [greeting, setGreeting] = useState("Bonjour")
    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Bonjour")
        else if (hour < 18) setGreeting("Bon après-midi")
        else setGreeting("Bonsoir")
    }, [])

    const userName =
        session?.user?.user_metadata?.first_name ||
        session?.user?.user_metadata?.name ||
        ""

    /**
     * Envoie la recherche vers l'annuaire, seul écran capable d'afficher des
     * résultats. Même destination que /recherche : un utilisateur qui cherche
     * depuis le tableau de bord ou depuis l'écran dédié arrive au même endroit.
     */
    const submit = useCallback(
        (raw: string) => {
            const q = raw.trim()
            if (!q) {
                inputRef.current?.focus()
                return
            }
            router.push(`/annuaire?search=${encodeURIComponent(q)}`)
        },
        [router]
    )

    // Une dictée vaut validation : l'utilisateur a parlé, il n'a pas à appuyer
    // sur un bouton en plus. Le champ affiche la phrase reconnue avant de partir.
    const handleVoiceResult = useCallback(
        (transcript: string) => {
            setQuery(transcript)
            submit(transcript)
        },
        [submit]
    )

    const { available: micAvailable, listening, toggle: toggleMic } = useVoiceSearch({
        onResult: handleVoiceResult,
    })

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 26 } },
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full">
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#000616] shadow-xl"
            >
                {/* Décor : deux halos de charte, sans image de fond — rien à
                    télécharger, et le texte garde un contraste constant. */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#013ff4]/20 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#03b3f8]/15 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col justify-center min-h-[210px] sm:min-h-[230px] p-6 sm:p-7 md:p-8 gap-5 sm:gap-6">

                    {/* ── Salutation ───────────────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        <h1 className="min-w-0 flex-1 text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-tight text-white truncate">
                            {greeting}
                            {userName ? "," : ""}{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03b3f8] via-sky-200 to-white">
                                {userName || "Talent"}
                            </span>
                        </h1>

                        {/* Accès aux notifications, mobile uniquement. Il vivait
                            dans le cockpit personnel, désormais masqué sur petit
                            écran : sans ce relais, l'accès d'un geste
                            disparaissait avec lui. Le dock ne le propose qu'au
                            fond de son menu. */}
                        <NotificationsBellLink tone="dark" />
                    </div>

                    {/* ── Recherche de profils : clavier ou voix ───────────── */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            submit(query)
                        }}
                        role="search"
                        className="relative flex items-center gap-2 rounded-2xl border border-white/15 bg-card/[0.06] backdrop-blur-md px-3 h-12 sm:h-13 transition-colors focus-within:border-[#03b3f8]/60"
                    >
                        <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />

                        <input
                            ref={inputRef}
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Rechercher un profil, un métier, une ville…"
                            aria-label="Rechercher un profil"
                            enterKeyHint="search"
                            className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-slate-400 outline-none [&::-webkit-search-cancel-button]:appearance-none"
                        />

                        {/* Le micro n'apparaît que si le navigateur sait dicter :
                            un bouton inerte vaudrait moins que pas de bouton. */}
                        {micAvailable && (
                            <button
                                type="button"
                                onClick={toggleMic}
                                aria-label={listening ? "Arrêter la dictée" : "Rechercher à la voix"}
                                aria-pressed={listening}
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                                    listening
                                        ? "bg-red-500/20 text-red-300 ring-2 ring-red-500/40 animate-pulse"
                                        : "text-slate-300 hover:bg-card/[0.12] hover:text-white"
                                }`}
                            >
                                <Mic className="h-4 w-4" />
                            </button>
                        )}

                        <button
                            type="submit"
                            aria-label="Lancer la recherche"
                            className="flex h-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#013ff4] to-[#03b3f8] px-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.03] active:scale-95"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>

                    {/* ── Actions ──────────────────────────────────────────── */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <Button
                            size="sm"
                            className="flex-1 sm:flex-initial h-10 rounded-xl bg-card/[0.08] hover:bg-card/[0.15] border border-white/15 text-white font-semibold px-4 text-xs sm:text-sm backdrop-blur-md transition-all hover:border-white/30 shadow-sm"
                            onClick={() =>
                                router.push(session?.user?.id ? `/profil/${session.user.id}` : "/profil/me")
                            }
                        >
                            Mon Profil
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-sky-400" />
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1 sm:flex-initial h-10 rounded-xl bg-card/[0.08] hover:bg-card/[0.15] border border-white/15 text-white font-semibold px-4 text-xs sm:text-sm backdrop-blur-md transition-all hover:border-white/30 shadow-sm"
                            onClick={() => router.push("/portefeuille")}
                        >
                            <Briefcase className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                            Mes réalisations
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
