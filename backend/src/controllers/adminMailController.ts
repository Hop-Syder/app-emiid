/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Envoi de campagnes e-mail en masse (admin) — substitution de variables
 *              + envoi par lots throttlé via le service SMTP existant.
 * @created 2026-07-12
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { sendEmail } from '../services/mailService';
import { logger } from '../utils/logger';

const recipientSchema = z.object({
  email: z.string().email(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
});

const bodySchema = z.object({
  subject: z.string().trim().min(1).max(200),
  html: z.string().trim().min(1),
  recipients: z.array(recipientSchema).min(1).max(5000),
});

/** Remplace {first_name} / {last_name} (insensible aux espaces) dans un gabarit. */
function personalize(template: string, r: { first_name?: string | null; last_name?: string | null }): string {
  return template
    .replace(/\{\{?\s*first_name\s*\}?\}/gi, (r.first_name || '').trim())
    .replace(/\{\{?\s*last_name\s*\}?\}/gi, (r.last_name || '').trim());
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// @desc  Envoi d'un mailing en masse (réservé admin)
// @route POST /api/admin/mailing
export const sendBulkMail = async (req: Request, res: Response) => {
  try {
    const { subject, html, recipients } = bodySchema.parse(req.body);

    // Dédoublonnage par email (insensible à la casse).
    const seen = new Set<string>();
    const unique = recipients.filter((r) => {
      const key = r.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    let sent = 0;
    let failed = 0;
    const BATCH = 20;      // envois avant micro-pause
    const PAUSE_MS = 1000; // throttle : respecte les limites SMTP transactionnelles

    for (let i = 0; i < unique.length; i++) {
      const r = unique[i];
      try {
        await sendEmail({
          to: r.email,
          subject: personalize(subject, r),
          html: personalize(html, r),
        });
        sent++;
      } catch (e) {
        failed++;
        logger.warn(`Mailing: échec envoi à ${r.email}`, e);
      }
      if ((i + 1) % BATCH === 0) await sleep(PAUSE_MS);
    }

    logger.info(`Mailing admin terminé: ${sent} envoyés, ${failed} échecs sur ${unique.length}`);
    return res.json({ success: true, sent, failed, total: unique.length });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Requête invalide', details: err.issues });
    }
    logger.error('Erreur mailing admin', err);
    return res.status(500).json({ error: "Erreur lors de l'envoi du mailing" });
  }
};
