"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnnuaireHero } from "../annuaire-public-content/annuaire-hero"
import { AnnuaireFilters } from "../annuaire-public-content/annuaire-filters"
import { AnnuaireGrid } from "./annuaire-grid"
import { Profile } from "./annuaire-card"

interface AnnuaireContentProps {
    profiles: Profile[]
    category: string
}

export function AnnuaireContent({ profiles, category }: AnnuaireContentProps) {
    const titles: Record<string, string> = {
        artisans: "Nos Artisans",
        freelances: "Nos Freelances",
        entreprises: "Nos Entreprises",
        agence: "Nos Agences",
        startup: "Nos Startup",
        ong: "Les ONG du Réseau"
    }

    return (
        <div className="space-y-6">
            {/* Unified Hero */}
            <AnnuaireHero title={titles[category]} />

            {/* Unified Filters */}
            <AnnuaireFilters currentCategory={category} />

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {profiles.length} profil{profiles.length > 1 ? "s" : ""} trouvé{profiles.length > 1 ? "s" : ""}
                </p>
                <Button variant="outline" className="rounded-xl bg-transparent" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Plus de filtres
                </Button>
            </div>

            {/* Profiles Grid */}
            <AnnuaireGrid profiles={profiles} />
        </div>
    )
}
