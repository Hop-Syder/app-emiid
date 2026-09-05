/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page principale de l'Annuaire — barre de recherche universelle (nom, tags, compétences, description) + résultats.
 * @created 2026-06-03
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AnnuaireSearchField } from "./annuaire-search-field"
import { AnnuaireGrid } from "./annuaire-grid"
import { AnnuaireSpotlight } from "./annuaire-spotlight"
import { AnnuaireFilters } from "./annuaire-filters"

import type { PublicProfile } from "@/types"

interface AnnuairePublicContentProps {
    initialCategory?: string
    initialActivityDomain?: string
    initialCity?: string
    /** Requête reçue du serveur (/annuaire?search=…), y compris depuis la dictée vocale. */
    initialSearch?: string
    initialProfiles?: PublicProfile[]
}

export function AnnuairePublicContent({
    initialCategory = "all",
    initialActivityDomain = "all",
    initialCity = "",
    initialSearch = "",
    initialProfiles = []
}: AnnuairePublicContentProps) {
    const [filters, setFilters] = useState({
        // Renseigné dès le premier rendu : la grille part de la bonne requête au lieu
        // d'attendre l'effet de lecture d'URL, qui affichait un état transitoire faux.
        search: initialSearch,
        category: initialCategory,
        country: "all",
        city: initialCity,
        // Découpage administratif (Bénin) : identifiants, pas des libellés.
        department: "",
        commune: "",
        tags: "",
        status: "all",
        activity_domain: initialActivityDomain,
        lat: "",
        lng: ""
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
                department: params.get("department") || prev.department,
                commune: params.get("commune") || prev.commune,
                tags: params.get("tags") || prev.tags,
                status: params.get("status") || prev.status,
                activity_domain: params.get("activity_domain") || prev.activity_domain,
                lat: params.get("lat") || prev.lat,
                lng: params.get("lng") || prev.lng
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
                
                // Si on désactive lat, on enlève aussi lng par précaution, et vice versa. 
                // C'est géré par le onFilterChange ("lat", "") qui fera l'appel pour lng juste après, 
                // mais c'est propre de nettoyer.
                
                window.history.replaceState({}, '', url.toString())
            }
            return next
        })
    }

    const resetFilters = () => {
        setFilters({ search: "", category: "all", country: "all", city: "", department: "", commune: "", tags: "", status: "all", activity_domain: "all", lat: "", lng: "" })
        if (typeof window !== "undefined") {
            window.history.replaceState({}, "", window.location.pathname)
        }
    }

    return (
        <div className="w-full relative overflow-x-clip bg-muted min-h-screen pb-20">
            {/* Ambient Background Glow */}
            <div className="absolute top-[20%] left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[60%] right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 py-8">

                {/* Le bandeau d'en-tête a été retiré le 05/09 (desktop et mobile).
                    Ce qu'il portait de fonctionnel — le titre de page et le champ
                    de recherche libre — vit désormais dans l'en-tête des
                    résultats, remonté en tête de page le 06/09 : le visiteur
                    arrive sur le titre, la recherche et les filtres, sans avoir
                    à passer la vitrine. */}

                {/* --- SECTION 1: RESULTATS (titre, recherche, filtres, grille) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* En-tête compact : le titre et la recherche partagent une
                        ligne — le titre est court, l'espace à sa droite était
                        perdu. Les filtres suivent, sur deux rangées porteuses de
                        sens (où / quoi). Le paragraphe d'introduction a été
                        retiré : il ne disait rien que le titre ne dise déjà, et
                        son lien « Réinitialiser » fait doublon avec celui de la
                        barre de filtres. */}
                    <div className="space-y-4 border-b border-border pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* h1 et non h2 : le bandeau supprimé portait le seul
                                titre de premier niveau des trois routes /annuaire. */}
                            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                                Tous les <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0150fd] to-blue-600">Profils</span>
                            </h1>

                            {/* Recueillie du bandeau supprimé : les filtres ne
                                sont que des listes, c'est ici et nulle part
                                ailleurs qu'on tape un mot. */}
                            <AnnuaireSearchField
                                searchQuery={filters.search}
                                onSearchChange={(v) => handleFilterChange("search", v)}
                            />
                        </div>

                        <AnnuaireFilters filters={filters} onFilterChange={handleFilterChange} onReset={resetFilters} />
                    </div>

                    <div className="pt-4">
                        <AnnuaireGrid
                            filters={filters}
                            initialProfiles={initialProfiles}
                            theme="default"
                            onSearch={(q) => handleFilterChange("search", q)}
                        />
                    </div>
                </motion.div>

                {/* --- SECTION 2: SPOTLIGHT --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <AnnuaireSpotlight />
                </motion.div>

            </div>
        </div>
    )
}
