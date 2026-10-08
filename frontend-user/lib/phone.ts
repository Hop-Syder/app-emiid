/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Normalisation des numéros pour wa.me / tel:.
 * @created 2026-10-09 (extrait de profile-sidebar.tsx)
 */

/**
 * Règle : un numéro déjà international (préfixe « + ») est conservé tel quel ;
 * sinon on applique l'indicatif Bénin (229) s'il est absent.
 * Renvoie uniquement des chiffres (« 22901020304 »), vide si rien d'exploitable.
 */
export function toInternational(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  if (raw.trim().startsWith("+")) return digits
  if (digits.startsWith("229")) return digits
  return `229${digits}`
}
