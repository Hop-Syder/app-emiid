/**
 * @author @hopsyder
 * @description Statut d'ouverture calculé à l'heure de Cotonou (UTC+1).
 */
import { getOpenStatus, formatOpenStatus, type OpeningHour } from "@/lib/opening-hours"

const week: OpeningHour[] = [1, 2, 3, 4, 5].map((day) => ({ day, open: "08:00", close: "18:00", closed: false }))
// 2026-10-07 est un mercredi. 09:00 UTC = 10:00 à Cotonou.
const at = (iso: string) => new Date(iso)

describe("getOpenStatus", () => {
  it("ouvert pendant les horaires, à l'heure de Cotonou", () => {
    expect(getOpenStatus(week, at("2026-10-07T09:00:00Z"))).toEqual({ state: "open", closesAt: "18:00" })
  })

  it("fermé avant l'ouverture du jour", () => {
    // 06:30 UTC = 07:30 à Cotonou
    expect(getOpenStatus(week, at("2026-10-07T06:30:00Z"))).toEqual({ state: "closed", opensAt: "08:00", dayLabel: null })
  })

  it("après la fermeture du vendredi, annonce le lundi", () => {
    // vendredi 9 oct. 18:30 UTC = 19:30 à Cotonou
    const s = getOpenStatus(week, at("2026-10-09T18:30:00Z"))
    expect(s).toEqual({ state: "closed", opensAt: "08:00", dayLabel: "lundi" })
    expect(formatOpenStatus(s!)).toBe("Fermé · ouvre lundi à 08:00")
  })

  it("17:30 UTC = 18:30 à Cotonou : déjà fermé (le fuseau compte)", () => {
    expect(getOpenStatus(week, at("2026-10-07T17:30:00Z"))?.state).toBe("closed")
  })

  it("rien d'affiché sans horaire exploitable", () => {
    expect(getOpenStatus([], at("2026-10-07T09:00:00Z"))).toBeNull()
    expect(getOpenStatus([{ day: 3, open: "18:00", close: "08:00", closed: false }], at("2026-10-07T09:00:00Z"))).toBeNull()
  })
})
