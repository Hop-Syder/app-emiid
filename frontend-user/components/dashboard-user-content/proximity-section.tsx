/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant de présentation des talents à proximité (géolocalisation / pays)
 * @created 2026-05-31
 * @updated 2026-06-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { EntrepreneursSection } from "./entrepreneurs-section"
import { MapPin, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import type { PublicProfile } from "@/types"

interface ProximitySectionProps {
  fallbackLocation?: { city: string | null; country_id: string | null; country_name: string | null } | null
  initialProfiles?: PublicProfile[]
}

export function ProximitySection({ fallbackLocation, initialProfiles = [] }: ProximitySectionProps) {
  const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles)
  // On met le loader si on va chercher la position, ou si on n'a rien au départ
  const [loading, setLoading] = useState(false)
  const [locationName, setLocationName] = useState<string | null>(null)

  // Initialiser le nom de la localisation avec le fallback en attendant le GPS
  useEffect(() => {
    if (!locationName) {
      if (fallbackLocation?.city) {
        setLocationName(`autour de ${fallbackLocation.city}`)
      } else if (fallbackLocation?.country_name) {
        setLocationName(`en ${fallbackLocation.country_name}`)
      } else {
        setLocationName("Internationaux")
      }
    }
  }, [fallbackLocation, locationName])

  useEffect(() => {
    let isMounted = true

    async function fetchProfiles(params: URLSearchParams) {
      try {
        setLoading(true)
        const res = await fetch(`/api/dashboard-user/proximity?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.profiles && data.profiles.length > 0) {
            setProfiles(data.profiles)
          }
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
      applyFallback()
    }

    function applyFallback() {
      // S'il refuse le GPS, on affiche CARREMENT les profils de son pays (on ignore la ville)
      const params = new URLSearchParams()
      if (fallbackLocation?.country_id) {
        params.append('country_id', fallbackLocation.country_id)
        if (isMounted) setLocationName(`en ${fallbackLocation.country_name}`)
      }
      
      // On fetch avec uniquement le country_id (et donc route.ts fera un match sur le pays)
      fetchProfiles(params)
    }

    // On lance la demande GPS uniquement si on est côté client
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        handleGeolocation,
        applyFallback,
        { timeout: 5000 }
      )
    }

    return () => {
      isMounted = false
    }
  }, [fallbackLocation])

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
        <h3 className="text-lg sm:text-2xl font-black text-foreground flex items-center gap-2 sm:gap-3 tracking-tight">
          <div className="p-1.5 sm:p-2 bg-[#03b3f8]/10 rounded-xl shrink-0 relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-[#03b3f8]/20 animate-ping rounded-xl" />}
            <MapPin className="text-[#03b3f8] w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
          </div>
          <span className="truncate flex items-center gap-2">
            Talents {locationName || "à Proximité"}
            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#03b3f8]" />}
          </span>
        </h3>
        <Link href="/annuaire?filter=verified" className="text-xs sm:text-sm font-semibold text-[#03b3f8] hover:text-[#0396d0] flex items-center gap-1 group shrink-0">
          Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* On utilise les profils générés par l'algo de proximité (lieu d'inscription ou GPS),
          plafonnés à 10 sur ce hub — l'annuaire reste l'endroit pour voir la liste complète. */}
      <EntrepreneursSection
        entrepreneursList={profiles.slice(0, 10)}
        loading={loading && profiles.length === 0}
        variant="glass"
      />
    </div>
  )
}

