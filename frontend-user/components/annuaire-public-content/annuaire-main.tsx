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

interface AnnuairePublicContentProps {
    initialCategory?: string
    initialCity?: string
}

export function AnnuairePublicContent({ initialCategory = "all", initialCity = "" }: AnnuairePublicContentProps) {
    const [filters, setFilters] = useState({
        search: "",
        category: initialCategory,
        country: "all",
        city: initialCity,
        tags: "",
        status: "all"
    })

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
            <AnnuaireHero />
            <AnnuaireFilters filters={filters} onFilterChange={handleFilterChange} />

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-lg sm:text-2xl font-black text-[#022753] uppercase tracking-tight">Tous les Profils</h2>
                    <p className="text-muted-foreground text-[10px] sm:text-sm font-bold uppercase tracking-widest opacity-60">Recherche par pertinence</p>
                </div>
                <AnnuaireGrid filters={filters} />
            </div>
        </div>
    )
}
