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
        { label: "Membres",   value: stats.totalEntrepreneurs || 0, icon: Users,      color: "text-emerald-400", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20" },
        { label: "Vérifiés",  value: stats.verifiedMembers    || 0, icon: BadgeCheck, color: "text-amber-400",   bg: "bg-amber-400/10",   ring: "ring-amber-400/20"   },
        { label: "Pays",      value: stats.countriesCovered   || 0, icon: Globe,      color: "text-indigo-400",  bg: "bg-indigo-400/10",  ring: "ring-indigo-400/20"  },
        { label: "Premium",   value: stats.premiumMembers     || 0, icon: Crown,      color: "text-rose-400",    bg: "bg-rose-400/10",    ring: "ring-rose-400/20"    },
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
            {/* ── HERO COMPACT ────────────────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl border border-white/10 shadow-xl bg-[url('/dashboard/background-1.svg')] bg-cover bg-center min-h-[140px]"
            >
                {/* Overlay en dégradé diagonal pour lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-slate-900/20" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 px-8 py-7">
                    {/* Gauche — Identité */}
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-semibold tracking-widest uppercase text-white/40">
                            {greeting}{displayName}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                            Prêt à{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-200 to-white">
                                networker ?
                            </span>
                        </h1>
                    </div>

                    {/* Droite — Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            size="sm"
                            className="rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md font-semibold px-4 h-10 transition-all hover:border-white/30 text-sm"
                            onClick={() => router.push("/profil/me")}
                        >
                            Mon Profil
                            <ArrowRight className="w-3.5 h-3.5 ml-2 opacity-60" />
                        </Button>
                        <Button
                            size="sm"
                            className="rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold px-4 h-10 shadow-lg transition-all hover:scale-[1.02] text-sm"
                            onClick={() => {
                                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
                                document.dispatchEvent(event)
                            }}
                        >
                            <Search className="w-3.5 h-3.5 mr-2" />
                            Rechercher
                            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center rounded bg-slate-100 px-1.5 font-mono text-[10px] font-bold text-slate-500">
                                ⌘K
                            </kbd>
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* ── STATS ROW ───────────────────────────────────── */}
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
                            className={`relative overflow-hidden rounded-2xl bg-white/5 border border-white/8 backdrop-blur-md px-5 py-4 flex items-center gap-4 shadow-lg cursor-default group ring-1 ${stat.ring}`}
                        >
                            {/* Glow hover */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${stat.bg} blur-2xl scale-150`} />

                            <div className={`relative shrink-0 p-2 rounded-xl ${stat.bg} ${stat.color} ring-1 ${stat.ring}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>

                            <div className="relative flex flex-col min-w-0">
                                <span className={`text-2xl font-black tracking-tighter leading-none ${stat.color}`}>
                                    {stat.value.toLocaleString()}
                                </span>
                                <span className={`text-[10px] font-semibold uppercase tracking-widest mt-0.5 truncate ${stat.color} opacity-70`}>
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
