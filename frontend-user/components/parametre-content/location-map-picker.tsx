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
import { Crosshair, Loader2, MapPin, ExternalLink, RotateCcw } from "lucide-react"

interface LocationMapPickerProps {
  latitude: number | null
  longitude: number | null
  /** Appelé à chaque déplacement du marqueur / tap sur la carte / géolocalisation. */
  onChange: (lat: number, lng: number) => void
  /** Optionnel : fonction appelée pour effacer les coordonnées */
  onClear?: () => void
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

// Marqueur maison SVG aux couleurs de marque
const MARKER_HTML = `
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 6px rgba(1,80,253,0.35))">
    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.7.4.3.9.3 1.3 0C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8Z" fill="#0150fd"/>
    <circle cx="12" cy="10" r="3.2" fill="#fff"/>
  </svg>`

export function LocationMapPicker({
  latitude,
  longitude,
  onChange,
  onClear,
}: LocationMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  // Conservée hors de l'effet : ensureMarker en a besoin bien après le montage.
  const iconRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)

  /** Une position n'existe que si les DEUX coordonnées sont là. */
  const hasCoords = latitude != null && longitude != null

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

  /**
   * Pose le marqueur, ou le déplace s'il existe déjà.
   *
   * Il n'est PLUS créé au montage quand aucune position n'est enregistrée : un
   * marqueur posé d'office au centre de Cotonou ferait croire à une position
   * choisie. Il naît donc au premier geste — clic sur la carte, « Me localiser »,
   * saisie manuelle — et ce point d'entrée unique évite d'avoir à le créer à
   * trois endroits.
   */
  const ensureMarker = (lat: number, lng: number) => {
    const L = leafletRef.current
    const map = mapRef.current
    if (!L || !map) return null

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
      return markerRef.current
    }

    const marker = L.marker([lat, lng], { draggable: true, icon: iconRef.current }).addTo(map)
    marker.on("dragend", () => {
      const p = marker.getLatLng()
      emitRef.current(p.lat, p.lng)
    })
    markerRef.current = marker
    return marker
  }
  const ensureMarkerRef = useRef(ensureMarker)
  ensureMarkerRef.current = ensureMarker

  // ── Initialisation de la carte (une seule fois) ────────────────────────────
  useEffect(() => {
    let cancelled = false

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return
        leafletRef.current = L

        const start = hasCoords
          ? { lat: latitude as number, lng: longitude as number }
          : DEFAULT_CENTER

        const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(
          [start.lat, start.lng],
          hasCoords ? 16 : 12,
        )
        mapRef.current = map

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        iconRef.current = L.divIcon({
          html: MARKER_HTML,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 34],
        })

        // Pas de marqueur tant qu'aucune position n'est enregistrée : la carte
        // s'ouvre vide, et l'appelant affiche « aucun point posé ».
        if (hasCoords) ensureMarkerRef.current(start.lat, start.lng)

        // Le clic pose le marqueur s'il n'existe pas encore, sinon le déplace.
        map.on("click", (e: any) => {
          ensureMarkerRef.current(e.latlng.lat, e.latlng.lng)
          emitRef.current(e.latlng.lat, e.latlng.lng)
          // Premier contact avec la carte : la molette lui est confiée. Avant
          // cela, elle fait défiler la page — une carte au milieu d'un long
          // formulaire ne doit pas piéger le défilement au survol.
          map.scrollWheelZoom.enable()
        })

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

  // ── Synchronisation externe du marqueur ────────────────────────────────────
  useEffect(() => {
    // Volontairement PAS de garde sur markerRef : « Me localiser » ou une saisie
    // manuelle arrivent alors qu'aucun marqueur n'existe encore, et doivent le
    // faire apparaître — sinon la position est enregistrée sans rien à l'écran.
    if (!mapRef.current || latitude == null || longitude == null) return

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
    ensureMarkerRef.current(latitude, longitude)
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
    // Deux étages : la carte et ses surcouches dans un conteneur `relative` —
    // les surcouches se positionnent par rapport à LUI, pas à la page — puis la
    // barre d'informations en dessous. Sans cet étage supplémentaire, le
    // `</div>` de la carte refermait la racine et la barre tombait hors du JSX.
    <div className="flex flex-col gap-2.5">
      <div className="relative">
        <div
          ref={containerRef}
          className="h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-border bg-muted z-0"
        />

        {/* Overlay « Touchez la carte pour poser le marqueur » (quand aucun point posé) */}
        {status === "ready" && !hasCoords && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400] p-4">
            <div className="bg-card/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-border/80 flex items-center gap-2 text-xs font-extrabold text-foreground animate-in fade-in zoom-in-95 duration-200">
              <span className="w-6 h-6 rounded-full bg-[#0150fd]/10 text-[#0150fd] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <span>Touchez la carte pour poser le marqueur</span>
            </div>
          </div>
        )}

        {/* Bouton flottant « me localiser » */}
        {status === "ready" && (
          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            title="Détecter ma position"
            aria-label="Détecter ma position"
            className="absolute top-3 right-3 z-[400] w-10 h-10 rounded-xl bg-card/95 backdrop-blur-sm shadow-md border border-border flex items-center justify-center text-foreground hover:bg-muted hover:text-[#0150fd] active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin text-[#0150fd]" /> : <Crosshair className="w-4 h-4" />}
          </button>
        )}

        {/* États de chargement / erreur */}
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 gap-2 pointer-events-none bg-muted/60">
            <Loader2 className="w-4 h-4 animate-spin text-[#0150fd]" /> Chargement de la carte…
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground px-4 text-center bg-muted/60">
            Carte temporairement indisponible. Utilisez la saisie manuelle ci-dessus.
          </div>
        )}
      </div>

      {/* Barre d'informations & actions sous la carte (conforme au PDF Page 3) */}
      {hasCoords ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 py-0.5 text-xs">
          <div className="flex items-center gap-2 font-mono text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-[#0150fd] shrink-0" />
            <span>
              Latitude : <strong className="text-foreground">{latitude?.toFixed(4)}</strong>, Longitude : <strong className="text-foreground">{longitude?.toFixed(4)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#0150fd] hover:underline"
            >
              Vérifier <ExternalLink className="w-3 h-3" />
            </a>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 font-bold text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Effacer
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 px-1 flex items-center gap-1.5">
          <MapPin className="w-3 h-3 shrink-0" />
          Posez un repère sur votre atelier, bureau ou lieu habituel d&apos;intervention.
        </p>
      )}
    </div>
  )
}
