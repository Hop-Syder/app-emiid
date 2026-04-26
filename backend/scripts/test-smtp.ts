/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Script de test SMTP pour valider la configuration de EmiID
 * @created 2026-04-26
 */

import dotenv from 'dotenv';
import path from 'path';

// Charger le .env depuis le dossier parent
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { sendEmail } from '../src/services/mailService';

async function testSMTP() {
  console.log('🚀 Démarrage du test SMTP...');
  console.log('---------------------------');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('From:', process.env.EMAIL_FROM);
  console.log('---------------------------');

  try {
    const result = await sendEmail({
      to: 'daoudaabassichristian@gmail.com', // Envoi à l'adresse de l'auteur pour test
      subject: '🧪 Test SMTP EmiID - Validation de Configuration',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Test SMTP Réussi !</h2>
          <p>Ceci est un message automatique généré par <strong>Dexty</strong> pour valider la configuration SMTP de <strong>EmiID</strong>.</p>
          <ul>
            <li><strong>Serveur :</strong> ${process.env.SMTP_HOST}</li>
            <li><strong>Utilisateur :</strong> ${process.env.SMTP_USER}</li>
            <li><strong>Date :</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Si vous recevez ce message, cela signifie que la messagerie est fonctionnelle.</p>
        </div>
      `,
      text: 'Test SMTP EmiID réussi !'
    });

    console.log('✅ Succès ! Message envoyé avec ID:', result.messageId);
  } catch (error) {
    console.error('❌ Échec du test SMTP :');
    console.error(error);
  }
}

testSMTP();
