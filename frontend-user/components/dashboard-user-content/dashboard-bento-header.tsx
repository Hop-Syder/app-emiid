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
    const [greeting, setGreeting] = useState("Bonjour")

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Bonjour")
        else if (hour < 18) setGreeting("Bon après-midi")
        else setGreeting("Bonsoir")
    }, [])

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
                className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 text-white min-h-[340px] flex flex-col justify-center border border-white/10 shadow-2xl backdrop-blur-3xl bg-slate-950"
            >
                {/* Aurora effect backgrounds */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-500/20 rounded-full blur-[80px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/60 to-transparent z-0" />

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="space-y-4">
                        <Badge className="bg-white/5 text-slate-300 hover:bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 font-medium">
                            ✨ L'Élite du Réseau
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                            {greeting}, <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">
                                prêt à networker ?
                            </span>
                        </h2>
                        <p className="max-w-[480px] text-slate-400 text-lg font-medium leading-relaxed">
                            Explorez des profils exclusifs, étendez votre influence et développez vos affaires au sein d'EmiID.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 pt-6">
                            <Button
                                className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200 px-6 h-14 shadow-[0_0_30px_rgba(255,255,255,0.2)] font-bold transition-all hover:scale-[1.02] text-base"
                                onClick={() => {
                                    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
                                    document.dispatchEvent(event)
                                }}
                            >
                                <Search className="w-5 h-5 mr-2" />
                                Recherche Rapide
                                <kbd className="ml-3 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded bg-slate-200 px-2 font-mono text-sm font-medium text-slate-600 opacity-100">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-2xl bg-slate-900/40 border-white/10 text-white hover:bg-slate-800/60 px-6 h-14 backdrop-blur-md font-bold transition-all hover:border-white/20 text-base"
                                onClick={() => router.push("/profil/me")}
                            >
                                Mon Profil
                            </Button>
                        </div>
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
                        <div key={i} className="rounded-[2rem] bg-slate-900/40 animate-pulse border border-white/5 backdrop-blur-sm h-[160px]"></div>
                    ))
                ) : (
                    statsItems.map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.03, y: -4 }}
                            className="relative overflow-hidden rounded-[2rem] bg-slate-950/50 border border-white/10 backdrop-blur-2xl p-6 flex flex-col justify-between shadow-2xl group cursor-default transition-all duration-300"
                        >
                            {/* Inner Glow */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${stat.bg.replace('/10', '/50')}`} />
                            
                            <div className="flex items-center justify-between z-10">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} ring-1 ring-white/5 shadow-inner`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            
                            <div className="z-10 mt-4">
                                <div className="text-4xl font-black text-white tracking-tighter">
                                    {stat.value.toLocaleString()}
                                </div>
                                <p className="text-sm font-medium text-slate-400 mt-1">
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
