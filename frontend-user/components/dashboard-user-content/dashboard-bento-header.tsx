/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header Dashboard — Hero compact + Stats pills. Design Premium 2025.
 * @created 2026-05-31
 * @updated 2026-05-31
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BadgeCheck, Crown, Globe, Users, Search, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"

interface DashboardBentoHeaderProps {
    stats: {
        totalEntrepreneurs: number
        verifiedMembers: number
        countriesCovered: number
        premiumMembers: number
    } | null
    statsLoading: boolean
}

export function DashboardBentoHeader({ stats, statsLoading }: DashboardBentoHeaderProps) {
    const router = useRouter()
    const { session } = useCurrentUserProfile()
    const [greeting, setGreeting] = useState("Bonjour")

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Bonjour")
        else if (hour < 18) setGreeting("Bon après-midi")
        else setGreeting("Bonsoir")
    }, [])

    const userName = session?.user?.user_metadata?.first_name || session?.user?.user_metadata?.name || ""
    const displayName = userName ? ` ${userName}` : ""

    const statsItems = stats ? [
        { label: "Membres",  value: stats.totalEntrepreneurs || 0, icon: Users,      color: "text-emerald-400", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20" },
        { label: "Vérifiés", value: stats.verifiedMembers    || 0, icon: BadgeCheck, color: "text-amber-400",   bg: "bg-amber-400/10",   ring: "ring-amber-400/20"   },
        { label: "Pays",     value: stats.countriesCovered   || 0, icon: Globe,      color: "text-indigo-400",  bg: "bg-indigo-400/10",  ring: "ring-indigo-400/20"  },
        { label: "Premium",  value: stats.premiumMembers     || 0, icon: Crown,      color: "text-rose-400",    bg: "bg-rose-400/10",    ring: "ring-rose-400/20"    },
    ] : []

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show:   { opacity: 1, transition: { staggerChildren: 0.08 } }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 16 },
        show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 340, damping: 28 } }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
        >
            {/* ── HERO COMPACT ────────────────────────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl border border-white/10 shadow-xl bg-[url('/dashboard/background-1.svg')] bg-cover bg-center min-h-[200px]"
            >
                {/* Overlay dégradé gauche → droite pour la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/75 to-slate-900/10" />
                {/* Vignette basse pour ancrer le contenu */}
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-slate-950/60 to-transparent" />

                {/* Layout vertical : salutation en haut, titre+actions en bas */}
                <div className="relative z-10 flex flex-col justify-between h-full px-8 md:px-12 pt-8 pb-8 gap-6">

                    {/* Ligne haute — salutation contextuelle */}
                    <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/30 select-none">
                        {greeting}{displayName}
                    </p>

                    {/* Ligne basse — titre grand + CTA alignés */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

                        {/* Titre plein écran */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05]">
                            Prêt à{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-white">
                                networker ?
                            </span>
                        </h1>

                        {/* Boutons ancrés en bas-droite */}
                        <div className="flex items-center gap-3 shrink-0 pb-0.5">
                            <Button
                                size="sm"
                                className="rounded-xl bg-white/8 hover:bg-white/15 border border-white/12 text-white/90 backdrop-blur-md font-semibold px-4 h-10 transition-all hover:border-white/25 text-sm"
                                onClick={() => router.push(session?.user?.id ? `/profil/${session.user.id}` : "/profil/me")}
                            >
                                Mon Profil
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5 opacity-50" />
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-xl bg-white text-slate-900 hover:bg-slate-50 font-bold px-5 h-10 shadow-xl transition-all hover:scale-[1.02] text-sm"
                                onClick={() => {
                                    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
                                    document.dispatchEvent(event)
                                }}
                            >
                                <Search className="w-3.5 h-3.5 mr-1.5" />
                                Rechercher
                                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center rounded bg-slate-100 px-1.5 font-mono text-[10px] font-bold text-slate-400">
                                    ⌘K
                                </kbd>
                            </Button>
                        </div>
                    </div>

                </div>
            </motion.div>

            {/* ── STATS ROW ───────────────────────────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
                {statsLoading || !stats ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-white/5 animate-pulse border border-white/5 h-[76px]" />
                    ))
                ) : (
                    statsItems.map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -3, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className={`relative overflow-hidden rounded-2xl bg-[url('/dashboard/background-2.svg')] bg-cover bg-center border border-white/8 px-5 py-4 flex items-center gap-4 shadow-lg cursor-default group ring-1 ${stat.ring}`}
                        >
                            {/* Overlay sombre pour lisibilité */}
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

                            {/* Glow au survol */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${stat.bg} blur-2xl scale-150`} />

                            {/* Icône colorée */}
                            <div className={`relative shrink-0 p-2 rounded-xl ${stat.bg} ${stat.color} ring-1 ${stat.ring}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>

                            {/* Chiffre + label colorés */}
                            <div className="relative flex flex-col min-w-0">
                                <span className={`text-2xl font-black tracking-tighter leading-none ${stat.color}`}>
                                    {stat.value.toLocaleString()}
                                </span>
                                <span className={`text-[10px] font-semibold uppercase tracking-widest mt-0.5 truncate ${stat.color} opacity-60`}>
                                    {stat.label}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </motion.div>
    )
}
