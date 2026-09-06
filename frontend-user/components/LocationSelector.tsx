/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Sélecteur de pays et de villes intelligent utilisant country-state-city
 * @created 2026-01-05
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
    filterCities,
    filterCountries,
    getAllCountriesCached,
    getCitiesByCountryCached,
    getCountryByCodeCached,
    type ICity,
    type ICountry,
} from "@/lib/location-cache"

interface LocationSelectorProps {
    onLocationSelect: (country: { name: string, isoCode: string }, city: string) => void
    defaultCountryCode?: string
    defaultCity?: string
    /**
     * Habillage. `wizard` (défaut) : celui de l'assistant de création, inchangé.
     * `settings` : celui des cartes de paramètres — micro-libellé capitales et
     *   champ h-11 arrondi sur fond `muted`, pour que le sélecteur ne détonne
     *   pas au milieu des autres champs de la section.
     */
    variant?: "wizard" | "settings"
    /** Si true, n'affiche que le sélecteur de pays. */
    hideCity?: boolean
}

/** Les deux habillages, au même endroit plutôt qu'en classes passées de l'extérieur. */
const VARIANTS = {
    wizard: {
        label: "",
        trigger: "h-10 rounded-xl bg-card dark:bg-slate-900 border-muted px-3 font-normal",
    },
    settings: {
        label: "text-[11px] font-bold text-muted-foreground uppercase tracking-wider",
        trigger: "h-11 rounded-2xl bg-muted/80 border-border px-3.5 text-sm font-medium text-foreground hover:bg-muted/80",
    },
} as const

export const LocationSelector = React.memo(function LocationSelector({
    onLocationSelect,
    defaultCountryCode,
    defaultCity,
    variant = "wizard",
    hideCity = false,
}: LocationSelectorProps) {
    const skin = VARIANTS[variant]
    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null)
    const [selectedCity, setSelectedCity] = useState<string>("")
    const [cities, setCities] = useState<ICity[]>([])
    const [countryOpen, setCountryOpen] = useState(false)
    const [cityOpen, setCityOpen] = useState(false)
    const [countrySearch, setCountrySearch] = useState("")
    const [citySearch, setCitySearch] = useState("")

    const allCountries = useMemo(() => getAllCountriesCached(), [])
    const filteredCountries = useMemo(() => filterCountries(countrySearch), [countrySearch])
    const filteredCities = useMemo(() => filterCities(cities, citySearch), [cities, citySearch])

    // Sync state with props when they change (initial load)
    useEffect(() => {
        const country = getCountryByCodeCached(defaultCountryCode)
        setSelectedCountry(country)
        setCountrySearch(country?.name || "")
    }, [defaultCountryCode])

    useEffect(() => {
        const nextCity = defaultCity || ""
        setSelectedCity(nextCity)
        setCitySearch(nextCity)
    }, [defaultCity])

    // Charger les villes quand le pays change
    useEffect(() => {
        if (selectedCountry) {
            setCities(getCitiesByCountryCached(selectedCountry.isoCode))
        } else {
            setCities([])
        }
    }, [selectedCountry])

    const handleCountryChange = (countryCode: string) => {
        const country = allCountries.find(c => c.isoCode === countryCode)
        if (country) {
            setSelectedCountry(country)
            setSelectedCity("")
            setCountrySearch(country.name)
            setCitySearch("")
            setCountryOpen(false)
            setCityOpen(false)
            onLocationSelect({ name: country.name, isoCode: country.isoCode }, "")
        }
    }

    const handleCityChange = (cityName: string) => {
        setSelectedCity(cityName)
        setCitySearch(cityName)
        setCityOpen(false)
        if (selectedCountry) {
            onLocationSelect({ name: selectedCountry.name, isoCode: selectedCountry.isoCode }, cityName)
        }
    }

    return (
        <div className={cn("grid grid-cols-1 gap-4", hideCity ? "grid-cols-1" : (variant === "wizard" ? "md:grid-cols-2" : "sm:grid-cols-2"))}>
            {/* PAYS */}
            <div className="space-y-2">
                <Label htmlFor="country-select-trigger" className={skin.label}>Pays</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="country-select-trigger"
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={countryOpen}
                            className={cn("w-full justify-between", skin.trigger)}
                        >
                            <span className="truncate text-left">
                                {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : "Sélectionner un pays..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-xl p-0" align="start">
                        <div className="border-b p-3">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="country-search-input"
                                    name="country_search"
                                    autoComplete="off"
                                    autoFocus
                                    value={countrySearch}
                                    onChange={(event) => setCountrySearch(event.target.value)}
                                    placeholder="Rechercher un pays..."
                                    className="h-10 rounded-lg pl-9"
                                />
                            </div>
                        </div>
                        <ScrollArea className="h-72">
                            <div className="p-2">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                        <button
                                            key={country.isoCode}
                                            type="button"
                                            onClick={() => handleCountryChange(country.isoCode)}
                                            className={cn(
                                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                                selectedCountry?.isoCode === country.isoCode && "bg-accent text-accent-foreground",
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "h-4 w-4 text-primary",
                                                    selectedCountry?.isoCode === country.isoCode ? "opacity-100" : "opacity-0",
                                                )}
                                            />
                                            <span>{country.flag}</span>
                                            <span className="truncate">{country.name}</span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                        Aucun pays trouvé.
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>

            {/* VILLE */}
            {!hideCity && (
                <div className="space-y-2">
                    <Label htmlFor="city-select-trigger" className={skin.label}>Ville</Label>
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id="city-select-trigger"
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={cityOpen}
                                disabled={!selectedCountry}
                                className={cn("w-full justify-between disabled:opacity-50", skin.trigger)}
                            >
                                <span className="truncate text-left">
                                    {selectedCity || (selectedCountry ? "Sélectionner une ville..." : "Choisir un pays d'abord")}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-xl p-0" align="start">
                            <div className="border-b p-3">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="city-search-input"
                                        name="city_search"
                                        autoComplete="off"
                                        autoFocus
                                        value={citySearch}
                                        onChange={(event) => setCitySearch(event.target.value)}
                                        placeholder={selectedCountry ? "Rechercher une ville..." : "Choisir un pays d'abord"}
                                        disabled={!selectedCountry}
                                        className="h-10 rounded-lg pl-9"
                                    />
                                </div>
                            </div>
                            <ScrollArea className="h-72">
                                <div className="p-2">
                                    {filteredCities.length > 0 ? (
                                        filteredCities.map((city) => (
                                            <button
                                                key={city.name}
                                                type="button"
                                                onClick={() => handleCityChange(city.name)}
                                                className={cn(
                                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                                    selectedCity === city.name && "bg-accent text-accent-foreground",
                                                )}
                                            >
                                                <Check
                                                    className={cn(
                                                        "h-4 w-4 text-primary",
                                                        selectedCity === city.name ? "opacity-100" : "opacity-0",
                                                    )}
                                                />
                                                <span className="truncate">{city.name}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                            {selectedCountry ? "Aucune ville trouvée." : "Choisissez un pays d'abord."}
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                </div>
            )}
        </div>
    )
})
