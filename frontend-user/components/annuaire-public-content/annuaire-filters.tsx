/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de filtres de l'Annuaire, sur deux lignes.
 *
 *              Refonte du 06/09 : une seule barre segmentée.
 *
 *              Les cinq listes étaient cinq pastilles indépendantes réparties
 *              sur deux rangées — donc dix bordures, dix marges intérieures et
 *              deux fois la hauteur, pour cinq contrôles qui posent la même
 *              question. Elles partagent maintenant UN cadre, séparées par de
 *              simples filets : la hauteur passe de ~90 px à 36 px, et l'ordre
 *              de lecture reste celui du sens — du plus large au plus fin
 *              (Pays → Département → Commune), puis la nature (Type, Secteur).
 *
 *              Les trois bascules (Autour de moi, Vérifié, Premium) forment un
 *              second groupe, volontairement HORS de la zone défilante : sur
 *              mobile la barre défile horizontalement, mais ces trois-là — les
 *              plus utilisées — restent toujours visibles.
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

/**
 * Un segment de la barre. Sans bordure propre : le cadre et les filets
 * appartiennent au conteneur, c'est là tout le gain de place.
 */
function Segment({ value, onChange, options, placeholder, disabled = false, title }: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
  placeholder: string
  disabled?: boolean
  title?: string
}) {
  const active = !!value && value !== "all"
  return (
    <div
      className={cn(
        "relative shrink-0 transition-colors",
        active && "bg-[#013ff4]/[0.07]",
        disabled && "opacity-40",
      )}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        title={title}
        aria-label={placeholder}
        className={cn(
          // max-w : un nom de commune ou « Tous les secteurs » étirerait sinon
          // le segment bien au-delà de ce que la barre peut offrir.
          "appearance-none h-9 max-w-[9.5rem] truncate bg-transparent pl-3 pr-7",
          "text-sm font-semibold cursor-pointer outline-none",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#013ff4]/30",
          active ? "text-[#013ff4]" : "text-muted-foreground",
          disabled && "cursor-not-allowed",
        )}
      >
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
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

  // Bascule du groupe d'icônes : carrée, sans étiquette, toujours visible.
  const toggle = "inline-flex items-center justify-center w-9 h-9 shrink-0 transition-colors"
  const toggleIdle = "text-muted-foreground hover:bg-muted hover:text-foreground"

  return (
    <div className="flex items-center gap-2">
      {/* ── Barre segmentée ────────────────────────────────────────────────
          Un seul cadre pour cinq listes, séparées par des filets. Sur mobile
          elle défile horizontalement plutôt que de se replier sur trois
          rangées : la hauteur reste constante quelle que soit la largeur. */}
      <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex items-stretch divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
          <Segment
            value={filters.country}
            onChange={setCountry}
            options={countryOptions}
            placeholder="Pays"
          />
          <Segment
            value={filters.department || ""}
            onChange={setDepartment}
            options={departmentOptions}
            placeholder="Département"
            disabled={!geoAvailable}
            title={geoAvailable ? undefined : "Découpage disponible pour le Bénin uniquement"}
          />
          <Segment
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
          <Segment
            value={filters.category}
            onChange={(v) => onFilterChange("category", v)}
            options={PROFILE_TYPES}
            placeholder="Type de profil"
          />
          <Segment
            value={filters.activity_domain}
            onChange={(v) => onFilterChange("activity_domain", v)}
            options={SECTORS}
            placeholder="Secteur"
          />
        </div>
      </div>

      {/* ── Bascules ───────────────────────────────────────────────────────
          Hors de la zone défilante : ce sont les trois filtres d'un geste, ils
          ne doivent jamais sortir de l'écran. Groupés dans un cadre unique,
          comme la barre, pour la même raison d'encombrement. */}
      <div className="flex items-stretch shrink-0 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
        <button
          onClick={toggleLocation}
          disabled={isLocating}
          title="Autour de moi"
          aria-label="Autour de moi"
          aria-pressed={!!filters.lat}
          className={cn(
            toggle,
            filters.lat
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
              : toggleIdle,
            isLocating && "opacity-70 cursor-not-allowed",
          )}
        >
          {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        </button>

        <button
          onClick={() => setStatus("verified")}
          title="Profils vérifiés"
          aria-label="Profils vérifiés"
          aria-pressed={filters.status === "verified"}
          className={cn(
            toggle,
            filters.status === "verified" ? "bg-[#03b3f8]/10 text-[#03b3f8]" : toggleIdle,
          )}
        >
          <BadgeCheck className="h-[18px] w-[18px]" />
        </button>

        <button
          onClick={() => setStatus("premium")}
          title="Profils Premium"
          aria-label="Profils Premium"
          aria-pressed={filters.status === "premium"}
          className={cn(
            toggle,
            filters.status === "premium"
              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
              : toggleIdle,
          )}
        >
          <Crown className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Réinitialiser : n'apparaît qu'en cas de filtre actif, et se réduit à
          une croix suivie du compte — « Réinitialiser (2) » coûtait à lui seul
          la largeur d'une liste entière. */}
      {activeCount > 0 && (
        <button
          onClick={onReset}
          title={`Réinitialiser ${activeCount} filtre${activeCount > 1 ? "s" : ""}`}
          aria-label={`Réinitialiser ${activeCount} filtre${activeCount > 1 ? "s" : ""}`}
          className="inline-flex items-center gap-1 h-9 px-2.5 shrink-0 rounded-xl border border-border bg-card text-sm font-bold text-muted-foreground hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
        >
          <X className="h-4 w-4" />
          {activeCount}
        </button>
      )}
    </div>
  )
}
