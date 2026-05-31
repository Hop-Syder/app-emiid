/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header Bento Grid asymétrique pour le Dashboard (Hero + Stats) avec style Glassmorphism
 * @created 2026-05-31
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion, Variants } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BadgeCheck, Crown, Globe, Users } from "lucide-react"

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

    const statsItems = stats ? [
        {
            label: "Membres",
            value: stats.totalEntrepreneurs || 0,
            icon: Users,
            color: "text-green-400",
            bg: "bg-green-400/10",
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
            color: "text-red-400",
            bg: "bg-red-400/10",
        },
        {
            label: "Premium",
            value: stats.premiumMembers || 0,
            icon: Crown,
            color: "text-primary",
            bg: "bg-primary/10",
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
            {/* HERO TILE (Spans 2 columns on desktop) */}
            <motion.div 
                variants={itemVariants}
                className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 text-white min-h-[320px] flex flex-col justify-center border border-white/10 shadow-2xl backdrop-blur-md"
                style={{
                    backgroundImage: 'url(/dashboard/background-1.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-primary/40 rounded-3xl" />

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="space-y-4">
                        <Badge className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20">
                            EmiID — L'Élite du Réseau
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Votre hub de <br className="hidden md:block" /> croissance.
                        </h2>
                        <p className="max-w-[500px] text-slate-300 text-lg font-medium leading-relaxed">
                            Connectez-vous aux talents, investisseurs et décideurs qui transforment l'écosystème d'affaires en Afrique.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-4">
                            <Button
                                className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 px-6 h-12 shadow-[0_0_20px_rgba(255,255,255,0.3)] font-bold transition-all hover:scale-105"
                                onClick={() => router.push("/annuaire")}
                            >
                                Explorer le réseau
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-xl bg-slate-900/40 border-white/20 text-white hover:bg-slate-800/60 px-6 h-12 backdrop-blur-md font-bold transition-all"
                                onClick={() => router.push("/creer-profil")}
                            >
                                Optimiser mon profil
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* STATS BENTO GRID (Spans 1 column on desktop, 2x2 grid inside) */}
            <motion.div 
                variants={itemVariants}
                className="grid grid-cols-2 gap-4 h-full"
            >
                {statsLoading || !stats ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-3xl bg-slate-800/50 animate-pulse border border-white/5 backdrop-blur-sm h-[152px]"></div>
                    ))
                ) : (
                    statsItems.map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="relative overflow-hidden rounded-3xl bg-slate-800/40 border border-white/10 backdrop-blur-xl p-5 flex flex-col justify-between shadow-xl group cursor-default"
                        >
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="flex items-center justify-between z-10">
                                <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color} ring-1 ring-white/10 shadow-inner`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            
                            <div className="z-10 mt-4">
                                <div className="text-3xl font-black text-white tracking-tighter">
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
