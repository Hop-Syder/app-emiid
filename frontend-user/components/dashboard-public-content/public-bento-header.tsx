/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Bento Header pour le Dashboard Public — Proposition de valeur + Stats.
 * @created 2026-06-03
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BadgeCheck, Crown, Globe, Users, UserPlus, LogIn, Award } from "lucide-react"

interface PublicBentoHeaderProps {
    stats: {
        totalEntrepreneurs: number
        verifiedMembers: number
        countriesCovered: number
        premiumMembers: number
    } | null
    statsLoading: boolean
}

export function PublicBentoHeader({ stats, statsLoading }: PublicBentoHeaderProps) {
    const router = useRouter()

    const statsItems = stats ? [
        // Charte EmiID — réseau en bleus (bleu roi / cyan / ciel), prestige en or.
        { label: "Membres", value: stats.totalEntrepreneurs || 0, icon: Users, color: "text-[#013ff4]", bg: "bg-[#013ff4]/10", ring: "ring-[#013ff4]/20" },
        { label: "Vérifiés", value: stats.verifiedMembers || 0, icon: BadgeCheck, color: "text-[#03b3f8]", bg: "bg-[#03b3f8]/10", ring: "ring-[#03b3f8]/20" },
        { label: "Pays", value: stats.countriesCovered || 0, icon: Globe, color: "text-sky-400", bg: "bg-sky-400/10", ring: "ring-sky-400/20" },
        { label: "Premium", value: stats.premiumMembers || 0, icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10", ring: "ring-amber-400/20" },
        { label: "Fondateurs", value: 1, icon: Award, color: "text-amber-500", bg: "bg-amber-500/10", ring: "ring-amber-500/20" },
    ] : []

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 340, damping: 28 } }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4 w-full"
        >
            {/* ── HERO BENTO PUBLIC ────────────────────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] bg-[url('/dashboard/background.jpg')] bg-cover bg-center min-h-[260px] flex flex-col justify-between p-8 md:p-12"
            >
                {/* Overlays de dégradés profonds */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#000616]/98 via-[#013ff4]/12 to-[#000616]/30" />
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#000616]/70 to-transparent" />
                
                {/* Lueur d'ambiance colorée discrète */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Contenu textuel et actions */}
                <div className="relative z-10 flex flex-col justify-between h-full gap-6">
                    {/* Badge d'accueil */}
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.25em] uppercase text-white/40 select-none">
                            Réseau Ouvert
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-2">
                        <div className="space-y-3 max-w-2xl">
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.05] font-satoshi">
                                Votre empreinte numérique{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
                                    professionnelle
                                </span>
                            </h1>
                            <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
                                Créez votre profil, exposez vos compétences, et connectez-vous avec les leaders, artisans et entrepreneurs à travers le continent.
                            </p>
                        </div>

                        {/* Actions d'onboarding public */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                            <Button
                                onClick={() => router.push("/creer-profil")}
                                className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100 px-6 h-12 text-sm font-bold shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <UserPlus className="size-4" />
                                Créer mon profil
                            </Button>
                            <Button
                                onClick={() => router.push("/login")}
                                variant="outline"
                                className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white px-6 h-12 text-sm font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <LogIn className="size-4" />
                                Se connecter
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── GRILLE DE STATISTIQUES (BENTO PILLS) ─────────────────── */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 lg:grid-cols-5 gap-3 w-full"
            >
                {statsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-20 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse"
                        />
                    ))
                ) : statsItems.length > 0 ? (
                    statsItems.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/40 backdrop-blur-md border border-white/5 shadow-sm group hover:border-white/10 transition-all duration-300"
                        >
                            <div className={`p-3 rounded-xl ${item.bg} ${item.color} shrink-0`}>
                                <item.icon className="size-5" />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-xl md:text-2xl font-black text-white leading-none tracking-tight font-satoshi">
                                    {item.value}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                                    {item.label}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-4 py-4 text-center text-xs text-slate-500 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl">
                        Statistiques temporairement indisponibles
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}
