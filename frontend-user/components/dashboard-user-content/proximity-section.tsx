"use client"

import { useEffect, useState } from "react"
import { EntrepreneursSection } from "./entrepreneurs-section"
import { MapPin, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import type { PublicProfile } from "@/types"

interface ProximitySectionProps {
  fallbackLocation?: { city: string; country_id: string; country_name: string } | null
  initialProfiles?: PublicProfile[]
}

export function ProximitySection({ fallbackLocation, initialProfiles = [] }: ProximitySectionProps) {
  const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles)
  const [loading, setLoading] = useState(initialProfiles.length === 0)
  const [locationName, setLocationName] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchProfiles(params: URLSearchParams) {
      try {
        const res = await fetch(`/api/dashboard-user/proximity?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted) setProfiles(data.profiles || [])
        }
      } catch (err) {
        console.error("Failed to fetch proximity profiles", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    async function handleGeolocation(position: GeolocationPosition) {
      const lat = position.coords.latitude
      const lon = position.coords.longitude
      
      try {
        // Reverse geocoding via OpenStreetMap Nominatim
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`)
        if (res.ok) {
          const data = await res.json()
          const city = data.address.city || data.address.town || data.address.village || data.address.state
          const country = data.address.country
          
          if (isMounted) setLocationName(city ? `autour de ${city}` : `en ${country}`)
          
          const params = new URLSearchParams()
          if (city) params.append('city', city)
          if (country) params.append('country_name', country)
          
          fetchProfiles(params)
          return
        }
      } catch (e) {
        console.error("Geocoding failed", e)
      }
      
      // Fallback si le geocoding échoue
      useFallback()
    }

    function useFallback() {
      const params = new URLSearchParams()
      if (fallbackLocation?.city) params.append('city', fallbackLocation.city)
      if (fallbackLocation?.country_id) params.append('country_id', fallbackLocation.country_id)
      
      if (isMounted) {
        if (fallbackLocation?.city) {
          setLocationName(`autour de ${fallbackLocation.city}`)
        } else if (fallbackLocation?.country_name) {
          setLocationName(`en ${fallbackLocation.country_name}`)
        } else {
          setLocationName("Internationaux")
        }
      }
      fetchProfiles(params)
    }

    // Lancer la demande GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleGeolocation, 
        useFallback, 
        { timeout: 5000 }
      )
    } else {
      useFallback()
    }

    return () => {
      isMounted = false
    }
  }, [fallbackLocation])

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
        <h3 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2 sm:gap-3 tracking-tight">
          <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-xl shrink-0 relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-emerald-200/50 animate-ping rounded-xl" />}
            <MapPin className="text-emerald-500 w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
          </div>
          <span className="truncate flex items-center gap-2">
            Talents {locationName || "à Proximité"}
            {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
          </span>
        </h3>
        <Link href="/annuaire?filter=verified" className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group shrink-0">
          Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* On utilise les profils générés par l'algo de proximité */}
      <EntrepreneursSection 
        entrepreneursList={profiles} 
        loading={loading} 
        variant="glass" 
      />
    </div>
  )
}
