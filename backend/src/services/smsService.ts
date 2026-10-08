/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Envoi SMS/WhatsApp. Twilio si configuré (cf. TwilioSmsProvider), sinon
 *              NoopSmsProvider qui refuse honnêtement l'envoi.
 *              Corrige BUG-002 : requestPhoneVerification loggait l'OTP sans jamais
 *              l'envoyer, tout en renvoyant {success:true} au client (trompeur).
 *              Ce service centralise l'envoi pour qu'un vrai fournisseur (Twilio,
 *              Africa's Talking, WhatsApp Business API...) puisse être branché ici
 *              sans toucher aux contrôleurs.
 * @created 2026-09-07
 * @updated 2026-10-08
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

import { logger } from '../utils/logger';

export interface SmsSendResult {
  success: boolean;
  providerId?: string;
}

export type SmsChannel = 'sms' | 'whatsapp';

export interface SmsProvider {
  /** Canaux réellement utilisables avec la configuration actuelle. */
  channels(): SmsChannel[];
  send(phone: string, message: string, channel: SmsChannel): Promise<SmsSendResult>;
}

/**
 * Fournisseur par défaut tant qu'aucun fournisseur SMS/WhatsApp n'est configuré.
 * N'envoie rien réellement — le log est volontairement un warning explicite
 * (pas un `info` qui laisserait croire à un envoi réussi).
 */
class NoopSmsProvider implements SmsProvider {
  channels(): SmsChannel[] {
    return [];
  }

  async send(phone: string, message: string): Promise<SmsSendResult> {
    logger.warn(`[SMS non configuré] Aucun fournisseur branché — message non transmis à ${phone}.`);
    return { success: false };
  }
}

/**
 * Twilio (SMS et WhatsApp) via l'API REST, sans dépendance supplémentaire.
 * Variables d'environnement :
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN  (obligatoires)
 *   TWILIO_SMS_FROM       numéro ou Messaging Service SID (MG…) pour les SMS
 *   TWILIO_WHATSAPP_FROM  numéro WhatsApp Business approuvé (+229…)
 * Un canal sans expéditeur configuré n'est simplement pas proposé.
 */
class TwilioSmsProvider implements SmsProvider {
  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly smsFrom?: string,
    private readonly whatsappFrom?: string,
  ) {}

  channels(): SmsChannel[] {
    const list: SmsChannel[] = [];
    if (this.smsFrom) list.push('sms');
    if (this.whatsappFrom) list.push('whatsapp');
    return list;
  }

  async send(phone: string, message: string, channel: SmsChannel): Promise<SmsSendResult> {
    const from = channel === 'whatsapp' ? this.whatsappFrom : this.smsFrom;
    if (!from) return { success: false };

    const to = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
    const form = new URLSearchParams({ Body: message });
    form.set('To', channel === 'whatsapp' ? `whatsapp:${to}` : to);
    if (channel === 'sms' && from.startsWith('MG')) form.set('MessagingServiceSid', from);
    else form.set('From', channel === 'whatsapp' ? `whatsapp:${from}` : from);

    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as { sid?: string; message?: string };
      if (!res.ok) {
        logger.error(`[Twilio] Envoi ${channel} refusé (${res.status}) : ${data.message || 'erreur inconnue'}`);
        return { success: false };
      }
      return { success: true, providerId: data.sid };
    } catch (err) {
      logger.error(`[Twilio] Envoi ${channel} impossible`, err);
      return { success: false };
    }
  }
}

function createProvider(): SmsProvider {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SMS_FROM, TWILIO_WHATSAPP_FROM } = process.env;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && (TWILIO_SMS_FROM || TWILIO_WHATSAPP_FROM)) {
    return new TwilioSmsProvider(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SMS_FROM, TWILIO_WHATSAPP_FROM);
  }
  return new NoopSmsProvider();
}

const activeProvider: SmsProvider = createProvider();

/** Canaux de vérification disponibles — exposés au client pour n'afficher que les boutons utiles. */
export const availableSmsChannels = (): SmsChannel[] => activeProvider.channels();

export const sendSms = (phone: string, message: string, channel: SmsChannel = 'sms'): Promise<SmsSendResult> => {
  return activeProvider.send(phone, message, channel);
};
