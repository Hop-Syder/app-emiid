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
}

/**
 * Envoi en masse personnalisé, par lots throttlés (respecte les limites SMTP).
 * Erreurs isolées par destinataire → on ne perd jamais toute la campagne.
 */
export async function sendBulkEmails(
  recipients: MailRecipient[],
  subject: string,
  html: string,
): Promise<{ sent: number; failed: number; firstError?: string }> {
  const from = process.env.EMAIL_FROM || '"EmiID" <no-reply@nexuspartners.xyz>'
  // Dédoublonnage par e-mail (insensible à la casse).
  const seen = new Set<string>()
  const unique = recipients.filter((r) => {
    const key = r.email.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

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
        html: personalize(html, r),
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
