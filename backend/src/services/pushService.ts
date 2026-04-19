/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Service centralisé pour l'envoi de notifications Push pour Nukun
 * @created 2026-04-19
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import webpush from 'web-push';
import { logger } from '../utils/logger';
import { supabaseAdmin } from '../config/supabase';

// Initialisation de web-push avec les clés VAPID
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:daoudaabassichristian@gmail.com';

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
  logger.info('Web-push configuré avec les clés VAPID');
} else {
  logger.warn('Web-push non configuré : clés VAPID manquantes');
}

/**
 * Envoie une notification push à un utilisateur spécifique
 */
export const sendPushNotification = async (userId: string, title: string, body: string, icon?: string, url?: string) => {
  try {
    // 1. Récupérer les souscriptions de l'utilisateur
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      logger.info(`Aucune souscription push trouvée pour l'utilisateur ${userId}`);
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/logo/logo-1.png',
      data: {
        url: url || '/dashboard-user'
      }
    });

    // 2. Envoyer la notification à chaque terminal enregistré
    const pushPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { success: true };
      } catch (err: any) {
        // Si la souscription est expirée ou invalide, on la supprime
        if (err.statusCode === 404 || err.statusCode === 410) {
          logger.info(`Souscription expirée pour l'utilisateur ${userId}, suppression de ${sub.id}`);
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
        }
        logger.error(`Erreur lors de l'envoi push à une souscription de ${userId}`, err);
        return { success: false, error: err };
      }
    });

    await Promise.all(pushPromises);
    logger.info(`Notifications push envoyées à ${subscriptions.length} terminaux pour l'utilisateur ${userId}`);
  } catch (err) {
    logger.error(`Erreur globale lors de l'envoi de notification push à ${userId}`, err);
  }
};
