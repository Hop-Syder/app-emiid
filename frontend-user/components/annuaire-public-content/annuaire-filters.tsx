/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Filtres pour l'annuaire - Refonte avec Spotlight Command Menu et Floating Pill
 * @created 2026-01-25
 * @updated 2026-06-01
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { Search, X, MapPin, Loader2, Command, Sparkles, Briefcase, Tag, Target } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
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
    { id: "all", label: "Tous les profils" },
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
    const modalInputRef = useRef<HTMLInputElement>(null)
    const [isCommandOpen, setIsCommandOpen] = useState(false)
    const [isLocating, setIsLocating] = useState(false)

    // Intercept Cmd+K / Ctrl+K and ESC
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsCommandOpen((open) => !open)
            }
            if (e.key === "Escape") {
                setIsCommandOpen(false)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Focus input when modal opens
    useEffect(() => {
        if (isCommandOpen) {
            setTimeout(() => {
                modalInputRef.current?.focus()
            }, 100) // small delay for animation
        }
    }, [isCommandOpen])

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
        setIsCommandOpen(false)
    }

    const hasActiveFilters = filters.search || filters.category !== "all" || filters.country !== "all" || filters.activity_domain !== "all" || filters.tags

    return (
        <>
            {/* FLOATING PILL (Dock) */}
            <div className="sticky top-[20px] lg:top-[40px] z-[40] mb-12 flex justify-center pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="pointer-events-auto flex items-center p-1.5 bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full transition-all hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
                >
                    {/* Search Trigger */}
                    <button 
                        onClick={() => setIsCommandOpen(true)}
                        className="flex items-center h-12 px-4 md:px-6 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100/60"
                    >
                        <Search className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-medium mr-4 hidden sm:inline-block">
                            {filters.search ? filters.search : "Rechercher un talent, une compétence..."}
                        </span>
                        <span className="font-medium mr-2 sm:hidden">Rechercher...</span>
                        <kbd className="hidden md:inline-flex h-6 items-center gap-1 rounded bg-slate-200/50 px-2 font-mono text-[11px] font-bold text-slate-500 border border-slate-200/50">
                            ⌘K
                        </kbd>
                    </button>

                    <div className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Proximity Button */}
                    <button
                        onClick={handleProximitySearch}
                        disabled={isLocating}
                        className="flex items-center h-12 px-4 text-emerald-600 hover:text-emerald-700 transition-colors rounded-full hover:bg-emerald-50"
                    >
                        {isLocating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <MapPin className="w-5 h-5" />
                        )}
                        <span className="font-bold text-sm ml-2 hidden lg:inline-block">Autour de moi</span>
                    </button>

                    <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

                    {/* Advanced Filters Trigger */}
                    <button
                        onClick={() => setIsCommandOpen(true)}
                        className={cn(
                            "hidden sm:flex items-center h-12 px-5 transition-colors rounded-full font-bold text-sm",
                            hasActiveFilters ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100/60"
                        )}
                    >
                        <Command className="w-4 h-4 mr-2" />
                        Filtres {hasActiveFilters && "actifs"}
                    </button>
                </motion.div>
            </div>

            {/* COMMAND MENU (Spotlight Modal) */}
            <AnimatePresence>
                {isCommandOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
                            onClick={() => setIsCommandOpen(false)}
                        />
                        
                        {/* Modal Body */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="relative w-full max-w-3xl bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.4)] border border-white/60 overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            {/* Main Search Input */}
                            <div className="flex items-center px-6 py-5 border-b border-slate-200/50 bg-white/50">
                                <Search className="w-6 h-6 text-blue-500" />
                                <input
                                    ref={modalInputRef}
                                    type="text"
                                    placeholder="Que recherchez-vous ? (Nom, compétence, métier...)"
                                    className="flex-1 bg-transparent border-none text-xl font-medium text-slate-800 placeholder:text-slate-400 focus:ring-0 px-4 h-12 outline-none"
                                    value={filters.search}
                                    onChange={(e) => onFilterChange("search", e.target.value)}
                                />
                                {filters.search && (
                                    <button 
                                        onClick={() => onFilterChange("search", "")}
                                        className="p-1 rounded-full hover:bg-slate-200 text-slate-400 mr-2"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded bg-slate-100 px-2 font-mono text-[11px] font-bold text-slate-500 border border-slate-200">
                                    ESC
                                </kbd>
                            </div>

                            {/* Filters Content Area */}
                            <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-1 bg-gradient-to-b from-white/30 to-slate-50/50">
                                <div className="space-y-8">
                                    
                                    {/* Types de Profils (Chips) */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Type de Profil</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORIES.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => onFilterChange("category", cat.id)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                                                        filters.category === cat.id 
                                                            ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105" 
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                                                    )}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Secteurs d'activité (Chips) */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Briefcase className="w-4 h-4 text-blue-500" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Secteur d'activité</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {SECTORS.map(sec => (
                                                <button
                                                    key={sec.id}
                                                    onClick={() => onFilterChange("activity_domain", sec.id)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                                                        filters.activity_domain === sec.id 
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105" 
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                                                    )}
                                                >
                                                    {sec.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Localisation & Tags */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <MapPin className="w-4 h-4 text-emerald-500" />
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Localisation</h3>
                                            </div>
                                            <LocationSelector
                                                onLocationSelect={handleLocationSelect}
                                                defaultCountryCode={filters.country !== "all" ? filters.country : undefined}
                                                defaultCity={filters.city}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Tag className="w-4 h-4 text-purple-500" />
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Mots-clés / Tags</h3>
                                            </div>
                                            <Input
                                                placeholder="Ex: React, Marketing, Menuiserie..."
                                                className="h-12 rounded-xl bg-white border-slate-200 shadow-sm font-medium px-4 focus-visible:ring-blue-500/30"
                                                value={filters.tags}
                                                onChange={(e) => onFilterChange("tags", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/50 bg-slate-50/80">
                                <Button
                                    variant="ghost"
                                    onClick={resetFilters}
                                    className="text-slate-500 hover:bg-slate-200/50 rounded-xl font-bold"
                                >
                                    Réinitialiser
                                </Button>
                                <Button
                                    onClick={() => setIsCommandOpen(false)}
                                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-8 font-bold shadow-lg shadow-slate-900/20"
                                >
                                    Afficher les résultats
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
