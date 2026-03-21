/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Sélecteur de pays et de villes intelligent utilisant country-state-city
 * @created 2026-01-05
*/

"use client"

import React, { useState, useEffect } from "react"
import { Country, City, ICountry, ICity } from "country-state-city"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface LocationSelectorProps {
    onLocationSelect: (country: { name: string, isoCode: string }, city: string) => void
    defaultCountryCode?: string
    defaultCity?: string
}

export function LocationSelector({
    onLocationSelect,
    defaultCountryCode,
    defaultCity
}: LocationSelectorProps) {
    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null)
    const [selectedCity, setSelectedCity] = useState<string>("")
    const [cities, setCities] = useState<ICity[]>([])

    // Sync state with props when they change (initial load)
    useEffect(() => {
        if (defaultCountryCode) {
            const country = Country.getCountryByCode(defaultCountryCode)
            if (country) setSelectedCountry(country)
        }
        if (defaultCity) {
            setSelectedCity(defaultCity)
        }
    }, [defaultCountryCode, defaultCity])

    const allCountries = Country.getAllCountries()

    // Charger les villes quand le pays change
    useEffect(() => {
        if (selectedCountry) {
            const countryCities = City.getCitiesOfCountry(selectedCountry.isoCode)
            setCities(countryCities || [])
        } else {
            setCities([])
        }
    }, [selectedCountry])

    const handleCountryChange = (countryCode: string) => {
        const country = allCountries.find(c => c.isoCode === countryCode)
        if (country) {
            setSelectedCountry(country)
            setSelectedCity("")
            onLocationSelect({ name: country.name, isoCode: country.isoCode }, "")
        }
    }

    const handleCityChange = (cityName: string) => {
        setSelectedCity(cityName)
        if (selectedCountry) {
            onLocationSelect({ name: selectedCountry.name, isoCode: selectedCountry.isoCode }, cityName)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PAYS */}
            <div className="space-y-2">
                <Label>Pays</Label>
                <Select
                    value={selectedCountry?.isoCode || ""}
                    onValueChange={handleCountryChange}
                >
                    <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900 border-muted">
                        <SelectValue placeholder="Sélectionner un pays..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        {allCountries.map((country) => (
                            <SelectItem key={country.isoCode} value={country.isoCode}>
                                <span className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span>{country.name}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* VILLE */}
            <div className="space-y-2">
                <Label>Ville</Label>
                <Select
                    value={selectedCity}
                    onValueChange={handleCityChange}
                    disabled={!selectedCountry}
                >
                    <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900 border-muted disabled:opacity-50">
                        <SelectValue placeholder={selectedCountry ? "Sélectionner une ville..." : "Choisir un pays d'abord"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[300px]">
                        {cities.length > 0 ? (
                            cities.map((city, index) => (
                                <SelectItem key={`${city.name}-${index}`} value={city.name}>
                                    {city.name}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="none" disabled>Aucune ville trouvée</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
