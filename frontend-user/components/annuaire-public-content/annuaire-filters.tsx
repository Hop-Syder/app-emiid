/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Filtres pour l'annuaire avec sélection de catégorie redirigeant vers les pages spécifiques
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { Search, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationSelector } from "@/components/LocationSelector"
import { Button } from "@/components/ui/button"

interface AnnuaireFiltersProps {
    filters: {
        search: string
        category: string
        country: string
        city: string
        tags: string
        status: string
    }
    onFilterChange: (key: string, value: string) => void
}

export function AnnuaireFilters({ filters, onFilterChange }: AnnuaireFiltersProps) {

    // Wrapper simple pour LocationSelector qui attend un objet {name, isoCode}
    const handleLocationSelect = (country: { name: string, isoCode: string }, city: string) => {
        onFilterChange("country", country.isoCode || "all")
        onFilterChange("city", city)
    }

    const resetFilters = () => {
        onFilterChange("search", "")
        onFilterChange("category", "all")
        onFilterChange("country", "all")
        onFilterChange("city", "")
        onFilterChange("tags", "")
        onFilterChange("status", "all")
    }

    return (
        <Card className="rounded-3xl border-none shadow-sm mb-6 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
                {/* Top Bar: Search & Tags */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-[2] relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un talent (Nom, Rôle, Bio...)"
                            className="pl-12 h-12 rounded-2xl bg-white border-muted focus-visible:ring-primary shadow-sm"
                            value={filters.search}
                            onChange={(e) => onFilterChange("search", e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            placeholder="Filtrer par Tags (Ex: React, BTP...)"
                            className="h-12 rounded-2xl bg-white border-muted shadow-sm"
                            value={filters.tags}
                            onChange={(e) => onFilterChange("tags", e.target.value)}
                        />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

                    {/* Catégorie */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1 text-muted-foreground">Secteur</label>
                        <Select onValueChange={(val) => onFilterChange("category", val)} value={filters.category}>
                            <SelectTrigger className="h-11 rounded-2xl bg-white border-muted">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all">Tous les secteurs</SelectItem>
                                <SelectItem value="artisan">Artisans</SelectItem>
                                <SelectItem value="freelance">Freelances</SelectItem>
                                <SelectItem value="entreprise">Entreprises</SelectItem>
                                <SelectItem value="ong">ONG</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Selector (Pays/Ville) intégrés */}
                    <div className="lg:col-span-2">
                        <LocationSelector
                            onLocationSelect={handleLocationSelect}
                            defaultCountryCode={filters.country !== "all" ? filters.country : undefined}
                            defaultCity={filters.city}
                        />
                    </div>

                    {/* Actions / Reset */}
                    <div className="flex items-end pb-1">
                        <Button
                            variant="ghost"
                            onClick={resetFilters}
                            className="w-full text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-2xl"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Réinitialiser
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
