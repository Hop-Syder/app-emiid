"use client"

import { motion } from "framer-motion"
import { BadgeCheck, Crown, Globe, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useDashboardStats, CREDIBLE_FALLBACK_STATS } from "@/hooks/use-dashboard-stats"

const fetcher = (url: string) => fetch(url, { next: { revalidate: 60 } })

export function AnnuaireStats() {
    const { stats: fetchedStats, statsLoading } = useDashboardStats({
        endpoint: "/api/dashboard-user/stats",
        fetcher,
        refreshIntervalMs: 60000,
    })

    const stats = fetchedStats || CREDIBLE_FALLBACK_STATS

    const statsItems = [
        { label: "Membres", value: stats.totalEntrepreneurs, icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20" },
        { label: "Vérifiés", value: stats.verifiedMembers, icon: BadgeCheck, color: "text-amber-400", bg: "bg-amber-400/10", ring: "ring-amber-400/20" },
        { label: "Pays", value: stats.countriesCovered, icon: Globe, color: "text-indigo-400", bg: "bg-indigo-400/10", ring: "ring-indigo-400/20" },
        { label: "Premium", value: stats.premiumMembers, icon: Crown, color: "text-rose-400", bg: "bg-rose-400/10", ring: "ring-rose-400/20" },
    ]

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 shadow-2xl bg-[url('/dashboard/background.jpg')] bg-cover bg-center my-16">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-900/80" />
            
            <div className="relative z-10 px-6 sm:px-10 md:px-16 py-14 flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* Texte & Social Proof Avatars */}
                <div className="flex-1 space-y-8 text-center lg:text-left">
                    <div className="space-y-4">
                        <p className="text-sm font-bold tracking-[0.2em] uppercase text-emerald-400 flex items-center justify-center lg:justify-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Notre Réseau
                        </p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
                            Rejoignez un réseau de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600">confiance</span>
                        </h2>
                        <p className="text-slate-400 font-medium text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            EmiID connecte les meilleurs talents et professionnels certifiés à travers le monde. Notre communauté grandit chaque jour.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                        <div className="flex -space-x-4 hover:space-x-1 transition-all duration-300">
                            {[10, 24, 33, 45, 59].map((imgId) => (
                                <Avatar key={imgId} className="border-4 border-slate-900 w-12 h-12 transition-transform hover:scale-110 hover:z-20">
                                    <AvatarImage src={`https://i.pravatar.cc/150?img=${imgId}`} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <div className="text-sm font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                            Rejoignez <span className="text-white font-bold">+ de 1000</span> professionnels
                        </div>
                    </div>
                </div>

                {/* Grid des stats Bento style */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-1/2 shrink-0">
                    {statsItems.map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -4, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className={`relative overflow-hidden rounded-3xl bg-[url('/dashboard/background-2.svg')] bg-cover bg-center border border-white/10 px-6 py-8 flex flex-col justify-center gap-4 shadow-lg group ring-1 ${stat.ring}`}
                        >
                            <div className="absolute inset-0 bg-slate-900/80 group-hover:bg-slate-900/40 transition-colors duration-500" />
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${stat.bg} blur-3xl scale-150`} />

                            <div className="relative z-10 flex items-center justify-between">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} ring-1 ${stat.ring} shadow-inner`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col min-w-0">
                                <span className={`text-4xl font-black tracking-tighter leading-none ${stat.color} drop-shadow-md`}>
                                    {stat.value.toLocaleString()}+
                                </span>
                                <span className={`text-sm font-bold uppercase tracking-widest mt-2 truncate text-slate-400 group-hover:text-white transition-colors duration-300`}>
                                    {stat.label}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
