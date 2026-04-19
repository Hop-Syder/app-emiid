/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Service centralisé pour l'envoi d'emails (SMTP / Nodemailer) pour Nukun
 * @created 2026-04-19
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/──────────────────────────────────

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true pour le port 465, false pour les autres
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoie un email générique
 */
export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
  const from = process.env.EMAIL_FROM || '"Nukun" <no-reply@nexuspartners.xyz>';

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Email envoyé à ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
    throw error;
  }
};

/**
 * Envoie une notification de nouveau message
 */
export const sendNewMessageNotification = async (recipientEmail: string, senderName: string, messagePreview: string) => {
  const subject = `Nouveau message de ${senderName} sur Nukun`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #022753;">Nukun</h2>
      <p>Bonjour,</p>
      <p>Vous avez reçu un nouveau message de <strong>${senderName}</strong> :</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; font-style: italic; margin: 20px 0;">
        "${messagePreview}"
      </div>
      <p>Connectez-vous à votre tableau de bord pour répondre.</p>
      <div style="margin-top: 30px;">
        <a href="https://app-nukun.app/dashboard-user" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
           Voir mes messages
        </a>
      </div>
      <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #64748b;">
        Vous recevez cet email car vous avez activé les notifications par email dans vos paramètres Nukun.
      </p>
    </div>
  `;

  return sendEmail({ to: recipientEmail, subject, html });
};
