"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Globe } from "lucide-react"

interface Country {
    id: number | string
    name: string
    iso_code: string
    count: number
}

interface AnnuaireCountriesProps {
    filters: {
        country: string
    }
    onFilterChange: (key: string, value: string) => void
}

// Convertit un code ISO (ex: SN) en emoji drapeau
const isoToEmoji = (isoCode: string) => {
    if (!isoCode || isoCode.length !== 2) return "🌍"
    return String.fromCodePoint(...[...isoCode.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)))
}

export function AnnuaireCountries({ filters, onFilterChange }: AnnuaireCountriesProps) {
    const [countries, setCountries] = useState<Country[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await fetch("/api/annuaire/stats-countries")
                const data = await res.json()
                if (data.countries) {
                    setCountries(data.countries)
                }
            } catch (error) {
                console.error("Failed to fetch top countries", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCountries()
    }, [])

    if (loading || countries.length === 0) {
        return null
    }

    return (
        <div className="w-full">
            <div className="flex items-center mb-4 px-1 gap-2">
                <Globe className="w-5 h-5 text-teal-500" />
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Parcourir par Pays</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
                {countries.map((country) => {
                    const isActive = filters.country === country.iso_code
                    const flag = isoToEmoji(country.iso_code)
                    
                    return (
                        <button
                            key={country.id}
                            onClick={() => onFilterChange("country", isActive ? "all" : country.iso_code)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border shadow-sm",
                                isActive 
                                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20 scale-105" 
                                    : "bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
                            )}
                        >
                            <span className="text-lg leading-none">{flag}</span>
                            <span>{country.name}</span>
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-md ml-1 font-bold",
                                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                            )}>
                                {country.count}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
