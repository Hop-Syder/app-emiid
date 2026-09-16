/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Localisation du profil — administrative puis géographique.
 *
 *   ── Pourquoi cette section existe ───────────────────────────────────────
 *   Avant le 06/09, les paramètres n'exposaient QUE la latitude, la longitude
 *   et le quartier. Ni le pays, ni la ville, ni l'adresse — pourtant tous
 *   présents dans le modèle et acceptés par l'API — n'étaient modifiables.
 *   Un profil dont la ville était fausse le restait, et l'annuaire le classait
 *   au mauvais endroit sans que personne puisse le corriger.
 *
 *   Le rattachement à une commune était pire : la migration 20260824 l'a fait
 *   UNE FOIS, par correspondance de nom entre `city` et `communes.name`. Aucun
 *   déclencheur ne l'entretient. Tout profil créé depuis garde commune_id à
 *   NULL — donc absent de « Talents dans votre commune » et hors de portée des
 *   mises en avant communales, quelle que soit sa ville. La commune se choisit
 *   désormais explicitement, dans une liste, et non par devinette sur un texte
 *   libre.
 *
 *   ── Ordre de lecture ────────────────────────────────────────────────────
 *   Du plus large au plus fin : Pays → Département → Commune → Ville →
 *   Quartier → Adresse → point GPS. Chaque niveau restreint le suivant.
 * @created 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Compass, ExternalLink, Loader2, MapPin, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { UserProfileData } from "@/hooks/use-settings"
import { LocationSelector } from "@/components/LocationSelector"
import { LocationMapPicker } from "./location-map-picker"
import { SectionCard, SettingToggle, Field, INPUT, SELECT } from "./settings-primitives"

/** Seul pays dont le découpage administratif est en base (cf. 20260824). */
const GEO_COUNTRY_ISO = "BJ"

interface GeoUnit { id: string; name: string }

interface LocationSectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
}

// 6 décimales ≈ 0,11 m : au-delà, on stocke du bruit de mesure.
const round6 = (n: number) => Math.round(n * 1e6) / 1e6

export function LocationSection({ profile, setProfile }: LocationSectionProps) {
  const [departments, setDepartments] = useState<GeoUnit[]>([])
  const [communes, setCommunes] = useState<GeoUnit[]>([])
  const [departmentId, setDepartmentId] = useState("")
  const [locating, setLocating] = useState(false)

  const up = (key: keyof UserProfileData, value: string | boolean | number | null) =>
    setProfile({ ...profile, [key]: value })

  const geoAvailable = !profile.country_code || profile.country_code === GEO_COUNTRY_ISO
  const hasCoords = profile.latitude != null && profile.longitude != null

  // ── Référentiel des départements ──────────────────────────────────────────
  // Les pays et les villes viennent de LocationSelector (paquet
  // country-state-city, hors ligne) : plus d'appel à stats-countries, qui ne
  // listait QUE les pays comptant déjà des profils — un utilisateur du premier
  // pays inscrit n'y trouvait pas le sien.
  useEffect(() => {
    let active = true
    fetch("/api/annuaire/geo")
      .then((r) => r.json())
      .then((g) => { if (active) setDepartments(g.departments || []) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  // Communes du département choisi. `active` protège d'une réponse tardive
  // portant sur un département qu'on a déjà quitté.
  useEffect(() => {
    if (!departmentId) { setCommunes([]); return }
    let active = true
    fetch(`/api/annuaire/geo?department=${encodeURIComponent(departmentId)}`)
      .then((r) => r.json())
      .then((d) => { if (active) setCommunes(d.communes || []) })
      .catch(() => undefined)
    return () => { active = false }
  }, [departmentId])

  // Le profil ne mémorise que la commune, pas son département : au chargement,
  // on retrouve le département auquel elle appartient pour préremplir la liste.
  useEffect(() => {
    if (!profile.commune_id || departmentId) return
    let active = true
    fetch(`/api/annuaire/geo?commune=${encodeURIComponent(profile.commune_id)}`)
      .then((r) => r.json())
      .then((d) => { if (active && d.department_id) setDepartmentId(d.department_id) })
      .catch(() => undefined)
    return () => { active = false }
  }, [profile.commune_id, departmentId])

  // ── Actions ───────────────────────────────────────────────────────────────
  /**
   * LocationSelector remonte le pays ET la ville d'un seul geste (changer de
   * pays y remet la ville à vide, c'est voulu). Quitter le Bénin vide en plus
   * le découpage administratif : ses départements n'existent nulle part ailleurs.
   */
  const onLocation = (country: { name: string; isoCode: string }) => {
    const leavesGeo = country.isoCode !== GEO_COUNTRY_ISO
    const countryChanged = country.isoCode !== profile.country_code
    if (leavesGeo) setDepartmentId("")
    setProfile({
      ...profile,
      country_code: country.isoCode,
      country_name: country.name,
      ...(countryChanged ? { city: "" } : {}),
      ...(leavesGeo ? { commune_id: null } : {}),
    })
  }

  const onDepartment = (id: string) => {
    setDepartmentId(id)
    // La commune retenue n'appartient plus au périmètre affiché : on l'oublie.
    if (profile.commune_id) up("commune_id", null)
  }

  const detectPosition = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProfile({
          ...profile,
          latitude: round6(pos.coords.latitude),
          longitude: round6(pos.coords.longitude),
        })
        setLocating(false)
        toast.success("Position récupérée")
      },
      () => {
        setLocating(false)
        toast.error("Position indisponible. Vérifiez que vous avez autorisé l'accès.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <SectionCard
      title="Localisation"
      icon={MapPin}
      footerHint="La commune détermine votre présence dans « Talents de votre commune » et la portée des mises en avant. Le point GPS, lui, alimente le filtre « Autour de moi » de l'annuaire."
    >
      <div className="space-y-4">
        {/* ── Pays ────────────────────────────────────────────────
            Recherche du pays (Bénin et international, country-state-city). */}
        <LocationSelector
          variant="settings"
          hideCity
          defaultCountryCode={profile.country_code || undefined}
          onLocationSelect={onLocation}
        />

        {/* ── Découpage administratif béninois ────────────────────────────
            Deux niveaux en cascade : le département restreint les
            communes, et la commune est ce qui rattache réellement le profil. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Département">
            <select
              id="department"
              value={departmentId}
              onChange={(e) => onDepartment(e.target.value)}
              disabled={!geoAvailable}
              title={geoAvailable ? undefined : "Découpage disponible pour le Bénin uniquement"}
              className={SELECT}
            >
              <option value="">Non renseigné</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Commune">
            <select
              id="commune_id"
              value={profile.commune_id || ""}
              onChange={(e) => up("commune_id", e.target.value || null)}
              disabled={!geoAvailable || !departmentId}
              title={
                !geoAvailable
                  ? "Découpage disponible pour le Bénin uniquement"
                  : !departmentId
                    ? "Choisissez d'abord un département"
                    : undefined
              }
              className={SELECT}
            >
              <option value="">Non renseignée</option>
              {communes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Quartier / arrondissement">
          <Input
            id="district"
            name="district"
            value={profile.district || ""}
            onChange={(e) => up("district", e.target.value)}
            className={INPUT}
            placeholder="Ex : Akpakpa"
          />
        </Field>

        {/* ── Point exact ─────────────────────────────────────────────────── */}
        <div className="pt-2 border-t border-border space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-foreground">Point exact sur la carte</p>
            <Button
              type="button"
              variant="outline"
              onClick={detectPosition}
              disabled={locating}
              className="h-9 px-3.5 rounded-xl border-border font-bold text-xs shrink-0 hover:bg-muted text-foreground disabled:opacity-60 shadow-xs"
            >
              {locating
                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Détection…</>
                : <><MapPin className="w-3.5 h-3.5 mr-1.5 text-[#013ff4]" /> {hasCoords ? "Actualiser" : "Me localiser"}</>}
            </Button>
          </div>

          <LocationMapPicker
            latitude={profile.latitude}
            longitude={profile.longitude}
            onChange={(lat, lng) => setProfile({ ...profile, latitude: round6(lat), longitude: round6(lng) })}
          />

          {hasCoords ? (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {Number(profile.latitude).toFixed(6)}, {Number(profile.longitude).toFixed(6)}
              </span>
              <span className="flex items-center gap-3 shrink-0">
                <a
                  href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#013ff4] hover:underline"
                >
                  Vérifier <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, latitude: null, longitude: null })}
                  className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-rose-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Effacer
                </button>
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Aucun point enregistré — déplacez le marqueur ou touchez la carte.
            </p>
          )}
        </div>

        {/* ── Mode nomade ─────────────────────────────────────────────────── */}
        <div className="pt-2 border-t border-border">
          <SettingToggle
            id="is_nomad"
            icon={Compass}
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            iconColor="text-indigo-600"
            title="Professionnel en déplacement"
            description="Votre activité est itinérante : votre zone d'intervention peut dépasser votre commune."
            checked={!!profile.is_nomad}
            onCheckedChange={(checked) => up("is_nomad", checked)}
          />
        </div>
      </div>
    </SectionCard>
  )
}
