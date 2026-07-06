/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page principale de l'Annuaire - Intégration de la Palette de commandes (Cmd+K) et filtres.
 * @created 2026-06-03
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AnnuaireHero } from "./annuaire-hero"
import { AnnuaireGrid } from "./annuaire-grid"
import { AnnuaireSpotlight } from "./annuaire-spotlight"
import { AnnuaireCommandPalette } from "./annuaire-command-palette"

interface AnnuairePublicContentProps {
    initialCategory?: string
    initialActivityDomain?: string
    initialCity?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- profils déjà mappés côté serveur, forme validée par AnnuaireGrid en aval
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
    const [paletteOpen, setPaletteOpen] = useState(false)

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

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setPaletteOpen(open => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
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
                    onTriggerSearch={() => setPaletteOpen(true)}
                />

                {/* --- SECTION 2: SPOTLIGHT --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <AnnuaireSpotlight />
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
                            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                                {(filters.search || filters.activity_domain !== "all" || filters.country !== "all" || filters.tags || filters.status !== "all") 
                                    ? (
                                        <>
                                            Résultats de votre recherche filtrée.
                                            <button 
                                                onClick={() => setFilters({
                                                    search: "",
                                                    category: "all",
                                                    country: "all",
                                                    city: "",
                                                    tags: "",
                                                    status: "all",
                                                    activity_domain: "all"
                                                })}
                                                className="text-xs font-bold text-blue-500 hover:text-blue-600 underline cursor-pointer"
                                            >
                                                Réinitialiser
                                            </button>
                                        </>
                                    )
                                    : "Explorez l'ensemble de notre réseau."}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <AnnuaireGrid filters={filters} initialProfiles={initialProfiles} theme="default" />
                    </div>
                </motion.div>

            </div>

            <AnnuaireCommandPalette 
                open={paletteOpen}
                setOpen={setPaletteOpen}
                filters={filters}
                onFilterChange={handleFilterChange}
            />
        </div>
    )
}
