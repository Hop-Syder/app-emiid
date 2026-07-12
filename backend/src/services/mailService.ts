/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Service centralisé pour l'envoi d'emails (SMTP / Nodemailer) pour EmiID
 * @created 2026-04-19
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true pour le port 465 (SSL implicite), false pour 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Timeouts : échouer vite si le port est filtré (évite de bloquer le webhook).
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Construit l'expéditeur. Les serveurs SMTP stricts rejettent en 553 tout From
 * dont l'adresse n'est pas la boîte authentifiée (SMTP_USER) : EMAIL_FROM ne
 * fournit donc que le nom d'affichage, l'adresse est toujours SMTP_USER.
 */
export const buildSender = (): string => {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const envFrom = (process.env.EMAIL_FROM || '').trim();

  const displayName = envFrom
    .replace(/<[^>]*>/g, '')
    .replace(/[^\s<>"']+@[^\s<>"']+/g, '')
    .replace(/["']/g, '')
    .trim() || 'EmiID';

  const envAddress = envFrom.match(/[^\s<>"']+@[^\s<>"']+/)?.[0] || '';
  const address = smtpUser || envAddress || 'no-reply@emiid.com';

  return `"${displayName}" <${address}>`;
};

/**
 * Envoie un email générique
 */
export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
  const from = buildSender();

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
  const subject = `Nouveau message de ${senderName} sur EmiID`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #022753;">EmiID</h2>
      <p>Bonjour,</p>
      <p>Vous avez reçu un nouveau message de <strong>${senderName}</strong> :</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; font-style: italic; margin: 20px 0;">
        "${messagePreview}"
      </div>
      <p>Connectez-vous à votre tableau de bord pour répondre.</p>
      <div style="margin-top: 30px;">
        <a href="https://app.emiid.com/dashboard-user" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
           Voir mes messages
        </a>
      </div>
      <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #64748b;">
        Vous recevez cet email car vous avez activé les notifications par email dans vos paramètres EmiID.
      </p>
    </div>
  `;

  return sendEmail({ to: recipientEmail, subject, html });
};

/**
 * Envoie l'email de bienvenue à la création d'un compte.
 * Transactionnel : envoyé une seule fois, indépendamment des préférences de notification.
 */
export const sendWelcomeEmail = async (recipientEmail: string, firstName?: string | null) => {
  const appUrl = process.env.APP_URL || 'https://app.emiid.com';
  const prenom = (firstName || '').trim();
  const greeting = prenom ? `Bienvenue ${prenom} 👋` : 'Bienvenue sur EmiID 👋';
  const subject = 'Bienvenue sur EmiID — votre empreinte numérique professionnelle';

  const logoUrl = `${appUrl}/logo/logo-emiid.png`;
  const year = new Date().getFullYear();

  const html = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 24px 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">

        <!-- En-tête avec logo -->
        <div style="background: linear-gradient(135deg, #022753 0%, #4f46e5 100%); padding: 36px 32px; text-align: center;">
          <div style="display: inline-block; background-color: #ffffff; border-radius: 18px; padding: 14px; box-shadow: 0 8px 24px rgba(2,39,83,0.25);">
            <img src="${logoUrl}" alt="EmiID" width="48" height="48" style="display: block; width: 48px; height: 48px; object-fit: contain;" />
          </div>
          <p style="color: #c7d2fe; margin: 16px 0 0; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;">Votre empreinte numérique professionnelle</p>
        </div>

        <!-- Corps -->
        <div style="background-color: #ffffff; padding: 36px 32px;">
          <h2 style="color: #022753; margin: 0 0 16px; font-size: 22px; font-weight: 700;">${greeting}</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
            Votre compte est créé 🎉. EmiID connecte les professionnels d'Afrique au monde entier :
            visibilité, opportunités et connexions de confiance.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Première étape : <strong>complétez et publiez votre profil</strong> pour apparaître dans l'annuaire
            et être contacté par des clients et partenaires.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${appUrl}/dashboard-user"
               style="background: linear-gradient(135deg, #4f46e5 0%, #022753 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">
              Compléter mon profil
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 28px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0 0 4px; font-size: 16px; font-weight: 800; color: #022753; letter-spacing: -0.3px;">EmiID</p>
          <p style="margin: 0 0 16px; font-size: 12px; color: #94a3b8;">Votre empreinte numérique professionnelle</p>

          <p style="margin: 0 0 16px; font-size: 13px;">
            <a href="${appUrl}/annuaire" style="color: #4f46e5; text-decoration: none; font-weight: 600; margin: 0 8px;">Annuaire</a>
            <span style="color: #cbd5e1;">·</span>
            <a href="${appUrl}/conditions" style="color: #4f46e5; text-decoration: none; font-weight: 600; margin: 0 8px;">Conditions</a>
            <span style="color: #cbd5e1;">·</span>
            <a href="${appUrl}/confidentialite" style="color: #4f46e5; text-decoration: none; font-weight: 600; margin: 0 8px;">Confidentialité</a>
          </p>

          <p style="margin: 0 0 10px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            Vous recevez cet email car un compte EmiID vient d'être créé avec cette adresse.
            Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.
          </p>
          <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
            © ${year} EmiID — Édité par
            <a href="https://nexus-partners.xyz" style="color: #94a3b8; text-decoration: none; font-weight: 600;">Nexus Partners</a>.
            Tous droits réservés.
          </p>
        </div>

      </div>
    </div>
  `;

  const text = `${greeting}\n\nVotre compte EmiID est créé. Complétez et publiez votre profil pour apparaître dans l'annuaire : ${appUrl}/dashboard-user`;

  return sendEmail({ to: recipientEmail, subject, html, text });
};
