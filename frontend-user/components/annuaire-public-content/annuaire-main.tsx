/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant principal regroupant le Hero, les Filtres et la Grille de l'Annuaire
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState } from "react"
import { AnnuaireHero } from "./annuaire-hero"
import { AnnuaireFilters } from "./annuaire-filters"
import { AnnuaireGrid } from "./annuaire-grid"
import { AnnuaireCategories } from "./annuaire-categories"
import { AnnuaireProcess } from "./annuaire-process"
import { AnnuaireCTA } from "./annuaire-cta"
import { AnnuaireStats } from "./annuaire-stats"
import { motion } from "framer-motion"

interface AnnuairePublicContentProps {
    initialCategory?: string
    initialActivityDomain?: string
    initialCity?: string
    initialProfiles?: any[]
}

export function AnnuairePublicContent({
    initialCategory = "all",
    initialActivityDomain = "all",
    initialCity = "",
    initialProfiles = []
}: AnnuairePublicContentProps) {
    const [filters, setFilters] = useState({
        search: "",
        category: initialCategory,
        country: "all",
        city: initialCity,
        tags: "",
        status: "all",
        activity_domain: initialActivityDomain
    })

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="w-full relative overflow-x-clip bg-slate-50/50 min-h-screen pb-20">
            {/* Ambient Background Glow for Bento Grid aesthetic */}
            <div className="absolute top-[40%] left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[60%] right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
                {/* --- 1. HERO SECTION --- */}
                <AnnuaireHero />

                {/* --- 2. BARRE DE RECHERCHE & FILTRES --- */}
                <AnnuaireFilters filters={filters} onFilterChange={handleFilterChange} />



                {/* --- 3. GRILLE DES PROFILS PREMIUM --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-200/30 pb-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                Profils <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Premium</span>
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">L'élite de notre réseau, des professionnels certifiés d'exception.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Mise en avant</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <AnnuaireGrid filters={filters} onlyPremium={true} />
                    </div>
                </motion.div>

                {/* --- 4. GRILLE DES PROFILS RECOMMANDÉS --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/50 pb-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                Profils <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">Recommandés</span>
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">Découvrez les meilleurs talents du réseau.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Mise à jour en direct</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <AnnuaireGrid filters={filters} initialProfiles={initialProfiles} theme="orange" />
                    </div>
                </motion.div>

                {/* --- 5. EXPLORATEUR DE CATÉGORIES & RÉSULTATS --- */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="space-y-6 pt-4"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/50 pb-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                Explorer par <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Catégorie</span>
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">Trouvez les profils correspondants à votre domaine d'activité.</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <AnnuaireGrid filters={filters} theme="red" />
                    </div>
                </motion.div>


            </div>
        </div>
    )
}
