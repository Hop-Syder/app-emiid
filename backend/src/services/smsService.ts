/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Interface d'envoi SMS/WhatsApp — aucun fournisseur branché à ce jour.
 *              Corrige BUG-002 : requestPhoneVerification loggait l'OTP sans jamais
 *              l'envoyer, tout en renvoyant {success:true} au client (trompeur).
 *              Ce service centralise l'envoi pour qu'un vrai fournisseur (Twilio,
 *              Africa's Talking, WhatsApp Business API...) puisse être branché ici
 *              sans toucher aux contrôleurs.
 * @created 2026-09-07
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

import { logger } from '../utils/logger';

export interface SmsSendResult {
  success: boolean;
  providerId?: string;
}

export interface SmsProvider {
  send(phone: string, message: string): Promise<SmsSendResult>;
}

/**
 * Fournisseur par défaut tant qu'aucun fournisseur SMS/WhatsApp n'est configuré.
 * N'envoie rien réellement — le log est volontairement un warning explicite
 * (pas un `info` qui laisserait croire à un envoi réussi).
 */
class NoopSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<SmsSendResult> {
    logger.warn(`[SMS non configuré] Aucun fournisseur branché — message non transmis à ${phone}: "${message}"`);
    return { success: false };
  }
}

const activeProvider: SmsProvider = new NoopSmsProvider();

export const sendSms = (phone: string, message: string): Promise<SmsSendResult> => {
  return activeProvider.send(phone, message);
};
