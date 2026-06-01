"use client"

import { EntrepreneursSection } from "./entrepreneurs-section"
import { MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { PublicProfile } from "@/types"

interface ProximitySectionProps {
  fallbackLocation?: { city: string; country_id: string; country_name: string } | null
  initialProfiles?: PublicProfile[]
}

export function ProximitySection({ fallbackLocation, initialProfiles = [] }: ProximitySectionProps) {
  let locationName = "à Proximité"
  if (fallbackLocation?.city) {
    locationName = `autour de ${fallbackLocation.city}`
  } else if (fallbackLocation?.country_name) {
    locationName = `en ${fallbackLocation.country_name}`
  } else if (fallbackLocation === null) {
    locationName = "Internationaux"
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
        <h3 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2 sm:gap-3 tracking-tight">
          <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-xl shrink-0 relative overflow-hidden">
            <MapPin className="text-emerald-500 w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
          </div>
          <span className="truncate flex items-center gap-2">
            Talents {locationName}
          </span>
        </h3>
        <Link href="/annuaire?filter=verified" className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group shrink-0">
          Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* On utilise les profils générés par l'algo de proximité (lieu d'inscription) */}
      <EntrepreneursSection 
        entrepreneursList={initialProfiles} 
        loading={false} 
        variant="glass" 
      />
    </div>
  )
}

