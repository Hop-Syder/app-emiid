"use client"

import { useState } from "react"

import { AnnuaireFilters } from "./annuaire-filters"
import { AnnuaireGrid } from "./annuaire-grid"
import { Profile } from "./annuaire-card"

interface AnnuaireContentProps {
    profiles: Profile[]
    category: string
}

export function AnnuaireContent({ profiles: _initialProfiles, category }: AnnuaireContentProps) {
    const [filters, setFilters] = useState({
        search: "",
        category: category || "all",
        country: "all",
        city: "",
        tags: "",
        status: "all",
        activity_domain: "all"
    })

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <AnnuaireFilters
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            {/* Results Count handled by Grid mostly, or we lift state fully... 
                Pour l'instant, AnnuaireGrid gère son fetch, donc on lui passe les filtres. 
            */}

            {/* Profiles Grid */}
            <AnnuaireGrid filters={filters} />
        </div>
    )
}
