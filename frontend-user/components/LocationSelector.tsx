/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Sélecteur de pays et de villes intelligent utilisant country-state-city
 * @created 2026-01-05
 * @updated 2026-06-05
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
}

export const LocationSelector = React.memo(function LocationSelector({
    onLocationSelect,
    defaultCountryCode,
    defaultCity
}: LocationSelectorProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PAYS */}
            <div className="space-y-2">
                <Label htmlFor="country-select-trigger">Pays</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="country-select-trigger"
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={countryOpen}
                            className="h-10 w-full justify-between rounded-xl bg-white dark:bg-slate-900 border-muted px-3 font-normal"
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
            <div className="space-y-2">
                <Label htmlFor="city-select-trigger">Ville</Label>
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="city-select-trigger"
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={cityOpen}
                            disabled={!selectedCountry}
                            className="h-10 w-full justify-between rounded-xl bg-white dark:bg-slate-900 border-muted px-3 font-normal disabled:opacity-50"
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
        </div>
    )
}
