/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Statut « Ouvert / Fermé » d'un professionnel à partir de ses
 *              horaires (JSONB opening_hours : { day 0=dim…6=sam, open, close,
 *              closed }). Calculé à l'heure de Cotonou (Africa/Porto-Novo,
 *              UTC+1) quel que soit le fuseau du visiteur : ce sont les horaires
 *              de l'atelier qui comptent.
 * @created 2026-10-09
 */

export interface OpeningHour {
  day: number
  open: string
  close: string
  closed: boolean
}

export type OpenStatus =
  | { state: "open"; closesAt: string }
  | { state: "closed"; opensAt: string; dayLabel: string | null }

export const BUSINESS_TIMEZONE = "Africa/Porto-Novo"
const DAY_LABELS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]

/** Jour (0-6) et minutes écoulées depuis minuit, dans le fuseau de l'atelier. */
function localClock(now: Date, timeZone: string): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"))
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) }
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN
}

/**
 * Renvoie null si aucun horaire exploitable n'est renseigné (on n'affiche
 * alors rien plutôt qu'un « Fermé » trompeur).
 */
export function getOpenStatus(
  hours: OpeningHour[] | null | undefined,
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIMEZONE,
): OpenStatus | null {
  const valid = (hours ?? []).filter(
    (h) => !h.closed && toMinutes(h.open) < toMinutes(h.close),
  )
  if (valid.length === 0) return null

  const { day, minutes } = localClock(now, timeZone)
  const today = valid.find((h) => h.day === day)
  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { state: "open", closesAt: today.close }
  }
  if (today && minutes < toMinutes(today.open)) {
    return { state: "closed", opensAt: today.open, dayLabel: null }
  }
  // Prochain jour ouvert (jusqu'à 7 jours plus tard).
  for (let offset = 1; offset <= 7; offset++) {
    const d = (day + offset) % 7
    const next = valid.find((h) => h.day === d)
    if (next) return { state: "closed", opensAt: next.open, dayLabel: offset === 1 ? "demain" : DAY_LABELS[d] }
  }
  return null
}

/** « Ouvert · ferme à 18:00 » / « Fermé · ouvre demain à 08:00 ». */
export function formatOpenStatus(status: OpenStatus): string {
  if (status.state === "open") return `Ouvert · ferme à ${status.closesAt}`
  return status.dayLabel ? `Fermé · ouvre ${status.dayLabel} à ${status.opensAt}` : `Fermé · ouvre à ${status.opensAt}`
}
