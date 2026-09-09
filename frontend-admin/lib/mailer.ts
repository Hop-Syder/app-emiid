/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Envoi d'e-mails (SMTP / Nodemailer) directement depuis frontend-admin —
 *              rend le mailing autonome (aucune dépendance au backend Express).
 * @created 2026-07-12
 */

import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // 465 = SSL, 587 = STARTTLS
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // IPv4 forcé : la résolution IPv6 de mail91.lwspanel.com échoue en
  // ENETUNREACH sur Render (pas de route sortante) — cf. backend/mailService.ts.
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
})

export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

/** Teste la connexion + l'authentification SMTP (erreur descriptive si échec). */
export async function verifyTransport(): Promise<{ ok: boolean; error?: string }> {
  try {
    await transporter.verify()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/** Remplace {first_name} / {last_name} dans un gabarit. */
function personalize(tpl: string, r: { first_name?: string | null; last_name?: string | null }): string {
  return tpl
    .replace(/\{\{?\s*first_name\s*\}?\}/gi, (r.first_name || "").trim())
    .replace(/\{\{?\s*last_name\s*\}?\}/gi, (r.last_name || "").trim())
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

export interface MailRecipient {
  email: string
  first_name?: string | null
  last_name?: string | null
  /**
   * Identifiant de suivi propre à ce destinataire pour cette campagne. Sert à
   * attribuer un clic à une personne ; absent, l'e-mail part simplement sans
   * être tracé.
   */
  trackingId?: string | null
}

/** Dédoublonne une liste de destinataires par adresse, casse ignorée. */
export function dedupeRecipients<T extends { email: string }>(list: T[]): T[] {
  const seen = new Set<string>()
  return list.filter((r) => {
    const key = r.email.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Envoi en masse personnalisé, par lots throttlés (respecte les limites SMTP).
 * Erreurs isolées par destinataire → on ne perd jamais toute la campagne.
 */
/**
 * Construit l'expéditeur. Contrainte : les serveurs stricts (dont LWS) rejettent
 * en 553 tout From dont l'ADRESSE n'est pas la boîte authentifiée (SMTP_USER).
 * EMAIL_FROM ne fournit donc que le nom d'affichage ; l'adresse est TOUJOURS
 * SMTP_USER dès qu'il est défini, même si EMAIL_FROM contient une autre adresse.
 */
export function buildSender(): string {
  const smtpUser = (process.env.SMTP_USER || "").trim()
  const envFrom = (process.env.EMAIL_FROM || "").trim()

  // Nom d'affichage : EMAIL_FROM sans son éventuelle partie <adresse> ni adresse nue.
  const displayName = envFrom
    .replace(/<[^>]*>/g, "")
    .replace(/[^\s<>"']+@[^\s<>"']+/g, "")
    .replace(/["']/g, "")
    .trim() || "EmiID"

  // Adresse : boîte authentifiée en priorité, sinon l'adresse extraite d'EMAIL_FROM.
  const envAddress = envFrom.match(/[^\s<>"']+@[^\s<>"']+/)?.[0] || ""
  const address = smtpUser || envAddress || "no-reply@emiid.com"

  return `"${displayName}" <${address}>`
}

export async function sendBulkEmails(
  recipients: MailRecipient[],
  subject: string,
  html: string,
  /**
   * Dernière retouche du corps, destinataire par destinataire. Utilisée pour
   * les liens de suivi, qui diffèrent pour chacun.
   */
  transform?: (html: string, recipient: MailRecipient) => string,
): Promise<{ sent: number; failed: number; firstError?: string }> {
  const from = buildSender()
  const unique = dedupeRecipients(recipients)

  let sent = 0
  let failed = 0
  let firstError: string | undefined
  const BATCH = 20
  const PAUSE_MS = 1000

  for (let i = 0; i < unique.length; i++) {
    const r = unique[i]
    try {
      await transporter.sendMail({
        from,
        to: r.email,
        subject: personalize(subject, r),
        html: personalize(transform ? transform(html, r) : html, r),
      })
      sent++
    } catch (e) {
      failed++
      if (!firstError) firstError = e instanceof Error ? e.message : String(e)
    }
    if ((i + 1) % BATCH === 0) await sleep(PAUSE_MS)
  }

  return { sent, failed, firstError }
}
