/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header Bento Grid asymétrique pour le Dashboard (Hero + Stats) avec style 21st
 * @created 2026-05-31
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion, Variants } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BadgeCheck, Crown, Globe, Users, Search } from "lucide-react"
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
        {
            label: "Membres",
            value: stats.totalEntrepreneurs || 0,
            icon: Users,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
        },
        {
            label: "Vérifiés",
            value: stats.verifiedMembers || 0,
            icon: BadgeCheck,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
        },
        {
            label: "Pays",
            value: stats.countriesCovered || 0,
            icon: Globe,
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
        },
        {
            label: "Premium",
            value: stats.premiumMembers || 0,
            icon: Crown,
            color: "text-rose-400",
            bg: "bg-rose-400/10",
        },
    ] : []

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
            {/* HERO TILE */}
            <motion.div 
                variants={itemVariants}
                className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 text-white min-h-[420px] flex flex-col justify-end pb-12 shadow-2xl border border-white/20 bg-[url('/dashboard/background-1.svg')] bg-cover bg-center"
            >

                <div className="relative z-10 flex flex-col gap-8 w-full max-w-2xl">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
                        {greeting}{displayName}, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white drop-shadow-sm">
                            prêt à networker ?
                        </span>
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Button
                            className="rounded-2xl bg-white text-blue-950 hover:bg-slate-50 px-6 h-14 shadow-xl font-extrabold transition-all hover:scale-[1.02] text-base"
                            onClick={() => {
                                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
                                document.dispatchEvent(event)
                            }}
                        >
                            <Search className="w-5 h-5 mr-2" />
                            Recherche Rapide
                            <kbd className="ml-3 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded bg-blue-50 px-2 font-mono text-xs font-bold text-blue-600/70 border border-blue-100">
                                <span>⌘</span>K
                            </kbd>
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-2xl bg-white/5 border-white/20 text-white hover:bg-white/10 px-6 h-14 backdrop-blur-lg font-bold transition-all hover:border-white/40 text-base"
                            onClick={() => router.push("/profil/me")}
                        >
                            Mon Profil
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* STATS BENTO GRID */}
            <motion.div 
                variants={itemVariants}
                className="grid grid-cols-2 gap-4 h-full"
            >
                {statsLoading || !stats ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-[1.5rem] bg-slate-900/40 animate-pulse border border-white/5 backdrop-blur-sm h-[100px]"></div>
                    ))
                ) : (
                    statsItems.map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="relative overflow-hidden rounded-[1.5rem] bg-slate-950/60 border border-white/10 backdrop-blur-xl p-5 flex flex-col justify-center shadow-xl group cursor-default transition-all duration-300"
                        >
                            {/* Inner Glow */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${stat.bg.replace('/10', '/50')}`} />
                            
                            <div className="z-10 flex flex-col gap-2">
                                <div className="flex items-center gap-5">
                                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} ring-1 ring-white/10 shadow-inner`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-3xl font-black text-white tracking-tighter">
                                        {stat.value.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-slate-400 mt-1 tracking-wide uppercase text-xs">
                                    {stat.label}
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </motion.div>
    )
}
