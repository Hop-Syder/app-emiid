import { City, Country, ICity, ICountry } from "country-state-city"
import { fetchPublic } from "@/lib/apiClient"

export interface ReferenceCountry {
  id: string
  name: string
  iso_code: string
  is_west_africa?: boolean
}

const REFERENCE_COUNTRIES_CACHE_KEY = "emiid-reference-countries-v1"
const REFERENCE_COUNTRIES_TTL_MS = 24 * 60 * 60 * 1000
const MAX_RESULTS = 80

const allCountriesCache = Country.getAllCountries().sort((left, right) =>
  left.name.localeCompare(right.name, "fr", { sensitivity: "base" }),
)
const citiesByCountryCache = new Map<string, ICity[]>()
let referenceCountriesMemoryCache: ReferenceCountry[] | null = null
let referenceCountriesPromise: Promise<ReferenceCountry[]> | null = null

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()

const deduplicateCities = (cities: ICity[]) => {
  const uniqueCities = new Map<string, ICity>()

  cities.forEach((city) => {
    const key = normalize(city.name)
    if (!uniqueCities.has(key)) {
      uniqueCities.set(key, city)
    }
  })

  return Array.from(uniqueCities.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "fr", { sensitivity: "base" }),
  )
}

const readReferenceCountriesFromStorage = () => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawCache = window.sessionStorage.getItem(REFERENCE_COUNTRIES_CACHE_KEY)
    if (!rawCache) {
      return null
    }

    const parsed = JSON.parse(rawCache) as { expiresAt: number; data: ReferenceCountry[] }
    if (!parsed.expiresAt || parsed.expiresAt < Date.now() || !Array.isArray(parsed.data)) {
      window.sessionStorage.removeItem(REFERENCE_COUNTRIES_CACHE_KEY)
      return null
    }

    return parsed.data
  } catch {
    return null
  }
}

const writeReferenceCountriesToStorage = (countries: ReferenceCountry[]) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.sessionStorage.setItem(
      REFERENCE_COUNTRIES_CACHE_KEY,
      JSON.stringify({
        expiresAt: Date.now() + REFERENCE_COUNTRIES_TTL_MS,
        data: countries,
      }),
    )
  } catch {
  }
}

export const getAllCountriesCached = () => allCountriesCache

export const getCountryByCodeCached = (countryCode?: string) => {
  if (!countryCode) {
    return null
  }

  return allCountriesCache.find((country) => country.isoCode === countryCode) || null
}

export const getCitiesByCountryCached = (countryCode?: string) => {
  if (!countryCode) {
    return [] as ICity[]
  }

  if (citiesByCountryCache.has(countryCode)) {
    return citiesByCountryCache.get(countryCode) || []
  }

  const countryCities = deduplicateCities(City.getCitiesOfCountry(countryCode) || [])
  citiesByCountryCache.set(countryCode, countryCities)
  return countryCities
}

export const getReferenceCountriesCached = async () => {
  if (referenceCountriesMemoryCache) {
    return referenceCountriesMemoryCache
  }

  const storedCountries = readReferenceCountriesFromStorage()
  if (storedCountries) {
    referenceCountriesMemoryCache = storedCountries
    return storedCountries
  }

  if (!referenceCountriesPromise) {
    referenceCountriesPromise = (async () => {
      const response = await fetchPublic("/api/reference/countries")
      if (!response.ok) {
        throw new Error("Impossible de charger la liste des pays")
      }

      const countries = await response.json() as ReferenceCountry[]
      referenceCountriesMemoryCache = countries
      writeReferenceCountriesToStorage(countries)
      referenceCountriesPromise = null
      return countries
    })().catch((error) => {
      referenceCountriesPromise = null
      throw error
    })
  }

  return referenceCountriesPromise
}

export const filterCountries = (query: string) => {
  const normalizedQuery = normalize(query)
  const countries = getAllCountriesCached()

  if (!normalizedQuery) {
    return countries.slice(0, MAX_RESULTS)
  }

  return countries
    .filter((country) => {
      const normalizedName = normalize(country.name)
      return normalizedName.includes(normalizedQuery) || country.isoCode.toLowerCase().includes(normalizedQuery)
    })
    .slice(0, MAX_RESULTS)
}

export const filterCities = (cities: ICity[], query: string) => {
  const normalizedQuery = normalize(query)

  if (!normalizedQuery) {
    return cities.slice(0, MAX_RESULTS)
  }

  return cities
    .filter((city) => normalize(city.name).includes(normalizedQuery))
    .slice(0, MAX_RESULTS)
}

export type { ICountry, ICity }
