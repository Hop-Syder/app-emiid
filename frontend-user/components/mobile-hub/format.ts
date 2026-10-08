/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Formatage partagé des écrans mobiles (prix FCFA, initiales).
 * @created 2026-10-09
 */

/** 15000 → « 15 000 FCFA » (espaces insécables fines, convention fr-FR). */
export function formatFcfa(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} FCFA`
}

/** « Jean Kossou » → « JK ». */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}
