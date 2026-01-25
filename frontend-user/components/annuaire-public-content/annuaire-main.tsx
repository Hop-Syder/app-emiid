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
}

export function AnnuairePublicContent({ initialCategory = "all" }: AnnuairePublicContentProps) {
    const [filters, setFilters] = useState({
        search: "",
        category: initialCategory,
        country: "all",
        city: "",
        tags: "",
        status: "all"
    })

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <AnnuaireHero />
            <AnnuaireFilters filters={filters} onFilterChange={handleFilterChange} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#022753]">Tous les Profils</h2>
                    <p className="text-muted-foreground text-sm font-medium">Recherche par pertinence</p>
                </div>
                <AnnuaireGrid filters={filters} />
            </div>
        </div>
    )
}
