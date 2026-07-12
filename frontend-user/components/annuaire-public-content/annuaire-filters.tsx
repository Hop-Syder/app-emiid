/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de filtres facettés de l'Annuaire : Type de profil, Secteur, Pays,
 *              + statut (Vérifiés / Premium). Complète la recherche universelle.
 * @created 2026-07-10
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { SlidersHorizontal, BadgeCheck, Crown, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { PROFILE_CATEGORIES, ACTIVITY_DOMAINS } from "@/lib/profile-options"

// Source unique partagée avec la création / l'édition de profil (id = value).
const PROFILE_TYPES: { id: string; label: string }[] = [
  { id: "all", label: "Tous les types" },
  ...PROFILE_CATEGORIES.map((o) => ({ id: o.value, label: o.label })),
]

const SECTORS: { id: string; label: string }[] = [
  { id: "all", label: "Tous les secteurs" },
  ...ACTIVITY_DOMAINS.map((o) => ({ id: o.value, label: o.label })),
]

interface Country { iso_code: string; name: string }

interface AnnuaireFiltersProps {
  filters: { category: string; activity_domain: string; country: string; status: string }
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { id: string; label: string }[]; placeholder: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none h-10 pl-3.5 pr-9 rounded-xl border text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#013ff4]/25",
          value && value !== "all"
            ? "bg-[#013ff4]/[0.06] border-[#013ff4]/30 text-[#013ff4]"
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
        )}
        aria-label={placeholder}
      >
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

export function AnnuaireFilters({ filters, onFilterChange, onReset }: AnnuaireFiltersProps) {
  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    let active = true
    fetch("/api/annuaire/stats-countries")
      .then((r) => r.json())
      .then((d) => { if (active) setCountries(d.countries || []) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  const countryOptions = [{ id: "all", label: "Tous les pays" }, ...countries.map((c) => ({ id: c.iso_code, label: c.name }))]

  const activeCount =
    (filters.category !== "all" ? 1 : 0) +
    (filters.activity_domain !== "all" ? 1 : 0) +
    (filters.country !== "all" ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0)

  const setStatus = (s: string) => onFilterChange("status", filters.status === s ? "all" : s)

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrer
      </span>

      <Select value={filters.category} onChange={(v) => onFilterChange("category", v)} options={PROFILE_TYPES} placeholder="Type de profil" />
      <Select value={filters.activity_domain} onChange={(v) => onFilterChange("activity_domain", v)} options={SECTORS} placeholder="Secteur" />
      <Select value={filters.country} onChange={(v) => onFilterChange("country", v)} options={countryOptions} placeholder="Pays" />

      {/* Statut : Vérifiés / Premium (exclusifs, mappés sur `status`) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setStatus("verified")}
          className={cn(
            "inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm font-semibold border transition-colors",
            filters.status === "verified" ? "bg-[#03b3f8]/10 border-[#03b3f8]/40 text-[#03b3f8]" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
          )}
        >
          <BadgeCheck className="h-4 w-4" /> Vérifiés
        </button>
        <button
          onClick={() => setStatus("premium")}
          className={cn(
            "inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm font-semibold border transition-colors",
            filters.status === "premium" ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
          )}
        >
          <Crown className="h-4 w-4" /> Premium
        </button>
      </div>

      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 h-10 px-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <X className="h-4 w-4" /> Réinitialiser ({activeCount})
        </button>
      )}
    </div>
  )
}
