/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de filtres de l'Annuaire, sur deux lignes.
 *
 *              Refonte du 05/09. Les six contrôles se répartissaient au hasard
 *              sur une rangée qui débordait sur mobile. Ils forment désormais
 *              deux lignes porteuses de sens :
 *                ① OÙ   — Pays, Département, Commune, Autour de moi
 *                ② QUOI — Type, Secteur, Vérifié, Premium
 *
 *              La ligne géographique est une cascade : le département restreint
 *              les communes. `departments` ne porte aucun rattachement à un pays
 *              (migration 20260824) — ce sont les douze départements du Bénin.
 *              Les deux sélecteurs sont donc désactivés dès qu'un autre pays est
 *              choisi, plutôt que d'offrir des listes vides sans explication.
 * @created 2026-07-10
 * @updated 2026-09-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { BadgeCheck, Crown, X, ChevronDown, MapPin, Loader2 } from "lucide-react"
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

/** Seul pays dont le découpage administratif est en base (cf. 20260824). */
const GEO_COUNTRY_ISO = "BJ"

interface Country { iso_code: string; name: string }
interface GeoUnit { id: string; name: string }

interface AnnuaireFiltersProps {
  filters: {
    category: string
    activity_domain: string
    country: string
    department: string
    commune: string
    status: string
    lat?: string
    lng?: string
  }
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
}

function Select({ value, onChange, options, placeholder, disabled = false, title }: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
  placeholder: string
  disabled?: boolean
  title?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        title={title}
        className={cn(
          "appearance-none h-10 pl-3.5 pr-9 rounded-xl border text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#013ff4]/25",
          value && value !== "all"
            ? "bg-[#013ff4]/[0.06] border-[#013ff4]/30 text-[#013ff4]"
            : "bg-card border-border text-muted-foreground hover:bg-muted",
          disabled && "opacity-50 cursor-not-allowed hover:bg-card",
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
  const [departments, setDepartments] = useState<GeoUnit[]>([])
  const [communes, setCommunes] = useState<GeoUnit[]>([])
  const [isLocating, setIsLocating] = useState(false)

  // Le découpage administratif n'a de sens que pour le pays qui le possède.
  // « Tous les pays » le laisse actif : la recherche reste alors pertinente.
  const geoAvailable = filters.country === "all" || filters.country === GEO_COUNTRY_ISO

  useEffect(() => {
    let active = true
    fetch("/api/annuaire/stats-countries")
      .then((r) => r.json())
      .then((d) => { if (active) setCountries(d.countries || []) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  // Départements : référentiel figé, chargé une fois.
  useEffect(() => {
    let active = true
    fetch("/api/annuaire/geo")
      .then((r) => r.json())
      .then((d) => { if (active) setDepartments(d.departments || []) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  // Communes : rechargées à chaque changement de département. Le drapeau
  // `active` évite qu'une réponse lente d'un département abandonné n'écrase
  // celle du département courant.
  useEffect(() => {
    if (!filters.department) {
      setCommunes([])
      return
    }
    let active = true
    fetch(`/api/annuaire/geo?department=${encodeURIComponent(filters.department)}`)
      .then((r) => r.json())
      .then((d) => { if (active) setCommunes(d.communes || []) })
      .catch(() => undefined)
    return () => { active = false }
  }, [filters.department])

  const countryOptions = [{ id: "all", label: "Pays" }, ...countries.map((c) => ({ id: c.iso_code, label: c.name }))]
  const departmentOptions = [{ id: "", label: "Département" }, ...departments.map((d) => ({ id: d.id, label: d.name }))]
  const communeOptions = [{ id: "", label: "Commune" }, ...communes.map((c) => ({ id: c.id, label: c.name }))]

  const activeCount =
    (filters.category !== "all" ? 1 : 0) +
    (filters.activity_domain !== "all" ? 1 : 0) +
    (filters.country !== "all" ? 1 : 0) +
    (filters.department ? 1 : 0) +
    (filters.commune ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0) +
    (filters.lat ? 1 : 0)

  const setStatus = (s: string) => onFilterChange("status", filters.status === s ? "all" : s)

  // Changer de département invalide la commune : la conserver filtrerait sur
  // une commune qui n'appartient plus au périmètre affiché.
  const setDepartment = (v: string) => {
    if (filters.commune) onFilterChange("commune", "")
    onFilterChange("department", v)
  }

  // Idem pour le pays : quitter le Bénin vide tout le découpage administratif.
  const setCountry = (v: string) => {
    if (v !== "all" && v !== GEO_COUNTRY_ISO) {
      if (filters.commune) onFilterChange("commune", "")
      if (filters.department) onFilterChange("department", "")
    }
    onFilterChange("country", v)
  }

  const toggleLocation = () => {
    if (filters.lat) {
      onFilterChange("lat", "")
      onFilterChange("lng", "")
      return
    }

    if ("geolocation" in navigator) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onFilterChange("lat", position.coords.latitude.toString())
          onFilterChange("lng", position.coords.longitude.toString())
          setIsLocating(false)
        },
        (error) => {
          console.error("Erreur de géolocalisation", error)
          setIsLocating(false)
          alert("Impossible d'obtenir votre position. Veuillez autoriser la géolocalisation.")
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.")
    }
  }

  const iconButton = "inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-xl border transition-colors"
  const iconIdle = "bg-card border-border text-muted-foreground hover:bg-muted"

  return (
    <div className="space-y-2.5">
      {/* ── Ligne ① : OÙ ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <Select
          value={filters.country}
          onChange={setCountry}
          options={countryOptions}
          placeholder="Pays"
        />
        <Select
          value={filters.department || ""}
          onChange={setDepartment}
          options={departmentOptions}
          placeholder="Département"
          disabled={!geoAvailable}
          title={geoAvailable ? undefined : "Découpage disponible pour le Bénin uniquement"}
        />
        <Select
          value={filters.commune || ""}
          onChange={(v) => onFilterChange("commune", v)}
          options={communeOptions}
          placeholder="Commune"
          disabled={!geoAvailable || !filters.department}
          title={
            !geoAvailable
              ? "Découpage disponible pour le Bénin uniquement"
              : !filters.department
                ? "Choisissez d'abord un département"
                : undefined
          }
        />

        <button
          onClick={toggleLocation}
          disabled={isLocating}
          title="Autour de moi"
          aria-label="Autour de moi"
          aria-pressed={!!filters.lat}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 h-10 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-colors shrink-0",
            filters.lat
              ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300"
              : iconIdle,
            isLocating && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          <span className="hidden sm:inline">Autour de moi</span>
        </button>
      </div>

      {/* ── Ligne ② : QUOI ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <Select
          value={filters.category}
          onChange={(v) => onFilterChange("category", v)}
          options={PROFILE_TYPES}
          placeholder="Type de profil"
        />
        <Select
          value={filters.activity_domain}
          onChange={(v) => onFilterChange("activity_domain", v)}
          options={SECTORS}
          placeholder="Secteur"
        />

        <button
          onClick={() => setStatus("verified")}
          title="Profils vérifiés"
          aria-label="Profils vérifiés"
          aria-pressed={filters.status === "verified"}
          className={cn(
            iconButton,
            filters.status === "verified" ? "bg-[#03b3f8]/10 border-[#03b3f8]/40 text-[#03b3f8]" : iconIdle,
          )}
        >
          <BadgeCheck className="h-5 w-5" />
        </button>

        <button
          onClick={() => setStatus("premium")}
          title="Profils Premium"
          aria-label="Profils Premium"
          aria-pressed={filters.status === "premium"}
          className={cn(
            iconButton,
            filters.status === "premium"
              ? "bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-300"
              : iconIdle,
          )}
        >
          <Crown className="h-5 w-5" />
        </button>

        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 h-10 px-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <X className="h-4 w-4" /> Réinitialiser ({activeCount})
          </button>
        )}
      </div>
    </div>
  )
}
