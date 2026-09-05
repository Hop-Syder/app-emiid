/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Mini-carte interactive de sélection de position (Leaflet + OpenStreetMap).
 *              L'utilisateur affine sa localisation au mètre près en déplaçant le
 *              marqueur ou en tapant sur la carte — la géolocalisation du navigateur
 *              seule étant souvent imprécise (position estimée par IP/Wi-Fi).
 *
 *              Leaflet est chargé depuis un CDN au runtime (aucune dépendance npm,
 *              donc aucun risque de lockfile désynchronisé au déploiement). Les
 *              tuiles proviennent d'OpenStreetMap (gratuit, sans clé d'API).
 *              Correctif du 06/09 : la carte se recadrait à CHAQUE changement de
 *              coordonnées — y compris ceux qu'elle émet elle-même. Déplacer le
 *              marqueur remontait au parent, revenait en props, et déclenchait un
 *              setView qui recentrait la vue et forçait le zoom à 16 sous le doigt
 *              de l'utilisateur. Placer un point en étant dézoomé était impossible :
 *              la carte sautait au premier clic. Elle ne se recadre plus que sur un
 *              changement VENU DE L'EXTÉRIEUR (bouton « Détecter ma position »,
 *              saisie manuelle, réinitialisation).
 * @created 2026-08-30
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { Crosshair, Loader2 } from "lucide-react"

interface LocationMapPickerProps {
  latitude: number | null
  longitude: number | null
  /** Appelé à chaque déplacement du marqueur / tap sur la carte / géolocalisation. */
  onChange: (lat: number, lng: number) => void
}

// Centre par défaut quand aucune position n'est encore choisie : Cotonou, Bénin.
const DEFAULT_CENTER = { lat: 6.3703, lng: 2.3912 }

const LEAFLET_VERSION = "1.9.4"
const LEAFLET_CSS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.css`
const LEAFLET_JS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.js`

/** Charge Leaflet (CSS + JS) une seule fois et renvoie le global `L`. */
function loadLeaflet(): Promise<any> {
  const w = window as unknown as { L?: unknown }
  if (w.L) return Promise.resolve(w.L)

  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link")
    link.id = "leaflet-css"
    link.rel = "stylesheet"
    link.href = LEAFLET_CSS
    document.head.appendChild(link)
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("leaflet-js")
    if (existing) {
      const poll = () => (w.L ? resolve(w.L) : setTimeout(poll, 50))
      poll()
      return
    }
    const script = document.createElement("script")
    script.id = "leaflet-js"
    script.src = LEAFLET_JS
    script.async = true
    script.onload = () => resolve(w.L)
    script.onerror = () => reject(new Error("Impossible de charger la carte"))
    document.head.appendChild(script)
  })
}

// Marqueur maison (SVG inline) : évite le bug classique des icônes Leaflet
// introuvables après bundling, et adopte la couleur de marque.
const MARKER_HTML = `
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))">
    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.7.4.3.9.3 1.3 0C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8Z" fill="#013ff4"/>
    <circle cx="12" cy="10" r="3" fill="#fff"/>
  </svg>`

export function LocationMapPicker({ latitude, longitude, onChange }: LocationMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)

  // onChange peut changer à chaque rendu (closure sur le profil) : on garde la
  // dernière version dans une ref pour que les callbacks Leaflet l'appellent.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Dernières coordonnées émises PAR la carte. Elles reviennent en props après
  // un aller-retour par l'état du parent : sans ce repère, impossible de
  // distinguer « l'utilisateur a bougé le marqueur » de « la position a changé
  // ailleurs », et la carte se recadrait dans les deux cas.
  const selfEmitted = useRef<{ lat: number; lng: number } | null>(null)

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [locating, setLocating] = useState(false)

  /** Remonte une position en la marquant comme venant de la carte. */
  const emit = (lat: number, lng: number) => {
    selfEmitted.current = { lat, lng }
    onChangeRef.current(lat, lng)
  }
  const emitRef = useRef(emit)
  emitRef.current = emit

  // ── Initialisation de la carte (une seule fois) ────────────────────────────
  useEffect(() => {
    let cancelled = false

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return
        leafletRef.current = L

        const hasCoords = latitude != null && longitude != null
        const start = hasCoords ? { lat: latitude as number, lng: longitude as number } : DEFAULT_CENTER

        const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(
          [start.lat, start.lng],
          hasCoords ? 16 : 12,
        )
        mapRef.current = map

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        const icon = L.divIcon({
          html: MARKER_HTML,
          className: "",
          iconSize: [34, 34],
          iconAnchor: [17, 32],
        })

        const marker = L.marker([start.lat, start.lng], { draggable: true, icon }).addTo(map)
        markerRef.current = marker

        marker.on("dragend", () => {
          const { lat, lng } = marker.getLatLng()
          emitRef.current(lat, lng)
        })
        map.on("click", (e: any) => {
          marker.setLatLng(e.latlng)
          emitRef.current(e.latlng.lat, e.latlng.lng)
          // Premier contact avec la carte : la molette lui est confiée. Avant
          // cela, elle fait défiler la page — une carte au milieu d'un long
          // formulaire ne doit pas piéger le défilement au survol.
          map.scrollWheelZoom.enable()
        })

        // La carte est souvent montée dans un conteneur dont la taille se stabilise
        // après le rendu (volet repliable, animation) : on force le recalcul.
        setTimeout(() => map.invalidateSize(), 120)
        setStatus("ready")
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Synchronise la carte quand les coordonnées changent de l'extérieur ─────
  // (bouton « Détecter ma position », réinitialisation, saisie manuelle).
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || latitude == null || longitude == null) return

    // Le parent arrondit à 6 décimales avant de renvoyer la valeur : la
    // comparaison se fait donc à la tolérance de cet arrondi, pas à l'identique.
    const self = selfEmitted.current
    const isOwn =
      self != null &&
      Math.abs(self.lat - latitude) < 2e-6 &&
      Math.abs(self.lng - longitude) < 2e-6

    // Le marqueur suit toujours ; la VUE, elle, ne bouge que si le changement
    // vient d'ailleurs. C'est tout le correctif : recadrer sur son propre geste
    // faisait sauter la carte sous le doigt et interdisait de placer un point
    // en vue large.
    markerRef.current.setLatLng([latitude, longitude])
    if (isOwn) {
      selfEmitted.current = null
      return
    }
    mapRef.current.setView([latitude, longitude], Math.max(mapRef.current.getZoom() || 16, 16))
  }, [latitude, longitude])

  /** Recentre la carte sur la position GPS du navigateur, puis pose le marqueur. */
  const locateMe = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        // Volontairement PAS emit() : une localisation demandée doit recadrer.
        onChangeRef.current(pos.coords.latitude, pos.coords.longitude)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-border bg-muted z-0"
      />

      {/* Bouton flottant « me localiser » */}
      {status === "ready" && (
        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          title="Me localiser"
          aria-label="Me localiser"
          className="absolute top-3 right-3 z-[400] w-10 h-10 rounded-lg bg-card shadow-md border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-60"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
        </button>
      )}

      {/* États de chargement / erreur */}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 gap-2 pointer-events-none">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement de la carte…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground px-4 text-center">
          Carte indisponible. Utilisez la détection automatique ou la saisie manuelle ci-dessous.
        </div>
      )}
    </div>
  )
}
