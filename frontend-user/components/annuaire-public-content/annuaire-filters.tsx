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

import { Search, X, Filter, MapPin, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationSelector } from "@/components/LocationSelector"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnnuaireFiltersProps {
    filters: {
        search: string
        category: string
        country: string
        city: string
        tags: string
        status: string
        activity_domain: string
    }
    onFilterChange: (key: string, value: string) => void
    currentCategory?: string
}

const CATEGORIES = [
    { id: "all", label: "Tous" },
    { id: "artisan", label: "Artisans" },
    { id: "commerçante", label: "Commerçants" },
    { id: "freelance", label: "Freelances" },
    { id: "entreprise", label: "Entreprises" },
    { id: "agence", label: "Agences" },
    { id: "startup", label: "Startups" },
    { id: "ong", label: "ONG / Associations" },
    { id: "investisseur", label: "Investisseurs" },
    { id: "institution", label: "Institutions Publiques" },
    { id: "etudiant", label: "Étudiants" },
]

const SECTORS = [
    { id: "all", label: "Tous les secteurs" },
    { id: "tech", label: "Tech & Digital" },
    { id: "agro", label: "Agroalimentaire" },
    { id: "btp", label: "BTP & Construction" },
    { id: "finance", label: "Finance & Assurance" },
    { id: "sante", label: "Santé & Bien-être" },
    { id: "education", label: "Éducation & Formation" },
    { id: "creatif", label: "Arts & Créativité" },
    { id: "commerce", label: "Commerce & Distribution" },
    { id: "transport", label: "Transport & Logistique" },
    { id: "tourisme", label: "Tourisme & Hôtellerie" },
    { id: "energie", label: "Énergie & Environnement" },
    { id: "b2b", label: "Services B2B" },
]

export function AnnuaireFilters({ filters, onFilterChange }: AnnuaireFiltersProps) {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [isLocating, setIsLocating] = useState(false)

    const handleProximitySearch = () => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.")
            return
        }

        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lon = position.coords.longitude
                
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`)
                    if (res.ok) {
                        const data = await res.json()
                        const city = data.address.city || data.address.town || data.address.village || data.address.state
                        const countryCode = data.address.country_code?.toUpperCase()
                        
                        if (countryCode) onFilterChange("country", countryCode)
                        if (city) onFilterChange("city", city)
                        
                        // Si le panneau avancé n'est pas ouvert, l'ouvrir pour montrer que la loc a changé
                        if (!showAdvanced) setShowAdvanced(true)
                    }
                } catch (e) {
                    console.error("Geocoding failed", e)
                } finally {
                    setIsLocating(false)
                }
            },
            (error) => {
                console.error("Geolocation error:", error)
                alert("Impossible de récupérer votre position. Vérifiez les autorisations de votre navigateur.")
                setIsLocating(false)
            },
            { timeout: 10000 }
        )
    }

    // Intercept Cmd+K / Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                e.stopPropagation() 
                searchInputRef.current?.focus()
            }
        }
        document.addEventListener("keydown", down, { capture: true })
        return () => document.removeEventListener("keydown", down, { capture: true })
    }, [])

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
        onFilterChange("activity_domain", "all")
    }

    return (
        <div className="sticky top-[20px] lg:top-[40px] z-[40] mb-12">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto rounded-full border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-xl p-2 transition-all duration-300"
            >
                <div className="flex flex-col md:flex-row items-center gap-2">
                    
                    {/* Main Search Command Bar */}
                    <div className="flex-1 w-full relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            ref={searchInputRef}
                            id="annuaire-keyword-search"
                            name="annuaire_keyword"
                            autoComplete="off"
                            placeholder="Recherche intelligente (Nom, Bio, Compétence...)"
                            aria-label="Rechercher par mot-clé"
                            className="w-full pl-14 pr-16 h-12 md:h-14 rounded-full bg-white/50 border-transparent hover:bg-white/80 focus-visible:bg-white focus-visible:ring-0 focus-visible:border-blue-500/30 shadow-none text-base transition-all"
                            value={filters.search}
                            onChange={(e) => onFilterChange("search", e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center">
                            <kbd className="inline-flex h-6 select-none items-center gap-1 rounded bg-slate-100 px-2 font-mono text-[11px] font-bold text-slate-500 border border-slate-200 shadow-sm">
                                <span className="text-sm leading-none">⌘</span>K
                            </kbd>
                        </div>
                    </div>

                    {/* Quick Category Pills (Desktop only) */}
                    <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar px-2">
                        {CATEGORIES.slice(0, 4).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => onFilterChange("category", cat.id)}
                                className={cn(
                                    "px-4 h-10 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                                    filters.category === cat.id 
                                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                                        : "bg-white/50 text-slate-600 border-white/60 hover:bg-white hover:text-slate-900"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full md:w-auto flex items-center justify-end px-2 gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleProximitySearch}
                            disabled={isLocating}
                            className={cn(
                                "rounded-full h-10 md:h-12 px-4 font-bold text-sm transition-all border",
                                "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700"
                            )}
                        >
                            {isLocating ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <MapPin className="w-4 h-4 mr-2" />
                            )}
                            <span className="hidden sm:inline">Autour de moi</span>
                            <span className="inline sm:hidden">Proche</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={cn(
                                "rounded-full h-10 md:h-12 px-4 sm:px-6 font-bold text-sm transition-all border",
                                showAdvanced 
                                    ? "bg-blue-50 text-blue-600 border-blue-200" 
                                    : "bg-white/60 text-slate-600 border-white/80 hover:bg-white hover:text-slate-900"
                            )}
                        >
                            <Filter className="w-4 h-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Filtres {showAdvanced ? "actifs" : ""}</span>
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {showAdvanced && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 10, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute left-0 right-0 max-w-4xl mx-auto rounded-[2rem] border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-white/90 backdrop-blur-2xl p-6 md:p-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Type de Profil</label>
                                <Select onValueChange={(val) => onFilterChange("category", val)} value={filters.category}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-200/60 px-5 font-semibold text-slate-700 shadow-sm">
                                        <SelectValue placeholder="Profil" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-white/80 bg-white/95 backdrop-blur-xl shadow-xl">
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id} className="rounded-xl font-medium cursor-pointer">
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Secteur d'activité</label>
                                <Select onValueChange={(val) => onFilterChange("activity_domain", val)} value={filters.activity_domain}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-200/60 px-5 font-semibold text-slate-700 shadow-sm">
                                        <SelectValue placeholder="Secteur" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-white/80 bg-white/95 backdrop-blur-xl shadow-xl">
                                        {SECTORS.map(sec => (
                                            <SelectItem key={sec.id} value={sec.id} className="rounded-xl font-medium cursor-pointer">
                                                {sec.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="lg:col-span-2">
                                <LocationSelector
                                    onLocationSelect={handleLocationSelect}
                                    defaultCountryCode={filters.country !== "all" ? filters.country : undefined}
                                    defaultCity={filters.city}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Tags</label>
                                <Input
                                    placeholder="Ex: React, Marketing..."
                                    className="h-12 rounded-2xl bg-white border-slate-200/60 shadow-sm font-medium px-5"
                                    value={filters.tags}
                                    onChange={(e) => onFilterChange("tags", e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end">
                            <Button
                                variant="ghost"
                                onClick={resetFilters}
                                className="text-slate-500 hover:bg-slate-100 rounded-xl h-10 px-6 font-bold"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Effacer les filtres
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
