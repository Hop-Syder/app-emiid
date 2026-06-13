"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AnnuaireHero } from "./annuaire-hero"
import { AnnuaireGrid } from "./annuaire-grid"
import { AnnuaireCategories } from "./annuaire-categories"
import { AnnuaireTags } from "./annuaire-tags"
import { AnnuaireCountries } from "./annuaire-countries"
import { AnnuaireSpotlight } from "./annuaire-spotlight"
import { AnnuaireNewcomers } from "./annuaire-newcomers"

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

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            setFilters(prev => ({
                ...prev,
                search: params.get("search") || prev.search,
                category: params.get("category") || prev.category,
                country: params.get("country") || prev.country,
                city: params.get("city") || prev.city,
                tags: params.get("tags") || prev.tags,
                status: params.get("status") || prev.status,
                activity_domain: params.get("activity_domain") || prev.activity_domain
            }))
        }
    }, [])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value }
            if (typeof window !== "undefined") {
                const url = new URL(window.location.href)
                if (value && value !== "all") {
                    url.searchParams.set(key, value)
                } else {
                    url.searchParams.delete(key)
                }
                window.history.replaceState({}, '', url.toString())
            }
            return next
        })
    }

    return (
        <div className="w-full relative overflow-x-clip bg-slate-50/50 min-h-screen pb-20">
            {/* Ambient Background Glow */}
            <div className="absolute top-[20%] left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[60%] right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 py-8">
                
                {/* --- SECTION 1: HERO COMPACT --- */}
                <AnnuaireHero 
                    searchQuery={filters.search}
                    onSearchChange={(value) => handleFilterChange("search", value)}
                />

                {/* --- SECTION 2: SPOTLIGHT --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <AnnuaireSpotlight />
                </motion.div>

                {/* --- SECTION 3: NOUVEAUX ARRIVANTS --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <AnnuaireNewcomers />
                </motion.div>

                {/* --- SECTION 4: DECOUVERTE (Filtres Horizontaux) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="space-y-8 bg-white/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-1.5 rounded-full bg-indigo-500" />
                        <h2 className="text-2xl font-black text-slate-900">Affiner votre recherche</h2>
                    </div>

                    <AnnuaireCategories filters={filters} onFilterChange={handleFilterChange} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                        <AnnuaireCountries filters={filters} onFilterChange={handleFilterChange} />
                        <AnnuaireTags filters={filters} onFilterChange={handleFilterChange} />
                    </div>
                </motion.div>

                {/* --- SECTION 5: RESULTATS (Grille Verticale) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="space-y-6 pt-4"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/50 pb-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                Tous les <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">Profils</span>
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">
                                {(filters.search || filters.activity_domain !== "all" || filters.country !== "all" || filters.tags) 
                                    ? "Résultats de votre recherche filtrée." 
                                    : "Explorez l'ensemble de notre réseau."}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <AnnuaireGrid filters={filters} initialProfiles={initialProfiles} theme="default" />
                    </div>
                </motion.div>

            </div>
        </div>
    )
}
