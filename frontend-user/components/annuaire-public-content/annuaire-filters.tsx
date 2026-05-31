/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Filtres pour l'annuaire avec sélection de catégorie redirigeant vers les pages spécifiques
 * @created 2026-01-25
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { Search, X } from "lucide-react"
import { useEffect, useRef } from "react"
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
    currentCategory?: string
}

export function AnnuaireFilters({ filters, onFilterChange }: AnnuaireFiltersProps) {
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Intercept Cmd+K / Ctrl+K to focus this search bar when on this page
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                // Prevent the event from bubbling up to the global Command Palette
                e.stopPropagation() 
                searchInputRef.current?.focus()
            }
        }
        document.addEventListener("keydown", down, { capture: true })
        return () => document.removeEventListener("keydown", down, { capture: true })
    }, [])

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
        <div className="sticky top-[80px] z-[40] mb-8">
            <div className="rounded-[2rem] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] bg-white/60 backdrop-blur-2xl p-4 md:p-6 transition-all duration-300">
                <div className="space-y-4">
                    {/* Top Bar: Search & Tags */}
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="flex-[2] relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                ref={searchInputRef}
                                id="annuaire-keyword-search"
                                name="annuaire_keyword"
                                autoComplete="off"
                                placeholder="Recherche intelligente (Nom, Bio, Compétence...)"
                                aria-label="Rechercher par mot-clé"
                                className="pl-12 pr-16 h-12 md:h-14 rounded-full bg-white/80 border-white/40 focus-visible:ring-primary shadow-inner text-base"
                                value={filters.search}
                                onChange={(e) => onFilterChange("search", e.target.value)}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center">
                                <kbd className="inline-flex h-6 select-none items-center gap-1 rounded bg-slate-100 px-2 font-mono text-[11px] font-bold text-slate-500 border border-slate-200">
                                    <span className="text-sm leading-none">⌘</span>K
                                </kbd>
                            </div>
                        </div>
                        <div className="flex-1">
                            <Input
                                id="annuaire-tags-filter"
                                name="annuaire_tags"
                                autoComplete="off"
                                placeholder="Filtrer par Tags (Ex: React...)"
                                aria-label="Filtrer par tags"
                                className="h-12 md:h-14 rounded-full bg-white/80 border-white/40 shadow-inner text-base px-6"
                                value={filters.tags}
                                onChange={(e) => onFilterChange("tags", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                        {/* Catégorie */}
                        <div className="space-y-1">
                            <label htmlFor="category-select" className="text-xs font-bold uppercase tracking-wider ml-3 text-slate-500">Secteur</label>
                            <Select onValueChange={(val) => onFilterChange("category", val)} value={filters.category}>
                                <SelectTrigger id="category-select" className="h-12 rounded-full bg-white/80 border-white/40 px-5 font-medium text-slate-700">
                                    <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl">
                                    <SelectItem value="all">Tous les secteurs</SelectItem>
                                    <SelectItem value="artisan">Artisans</SelectItem>
                                    <SelectItem value="commerçante">Commerçants</SelectItem>
                                    <SelectItem value="freelance">Freelances</SelectItem>
                                    <SelectItem value="entreprise">Entreprises</SelectItem>
                                    <SelectItem value="agence">Agences</SelectItem>
                                    <SelectItem value="startup">Startup</SelectItem>
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
                        <div className="flex items-end pb-0.5">
                            <Button
                                variant="ghost"
                                onClick={resetFilters}
                                className="w-full text-slate-500 hover:bg-slate-200/50 hover:text-slate-800 rounded-full h-12 font-bold"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Réinitialiser
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
