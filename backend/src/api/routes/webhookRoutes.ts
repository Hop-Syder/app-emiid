/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour les webhooks (venant de Supabase) pour EmiID
 * @created 2026-04-17
 */

import { NextFunction, Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { supabaseAdmin } from '../../config/supabase';
import { sendNewMessageNotification } from '../../services/mailService';
import { sendPushNotification } from '../../services/pushService';

const router = Router();

const verifyWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
  const configuredSecret = process.env.WEBHOOK_SECRET;

  if (!configuredSecret) {
    logger.error('Webhook refuse: WEBHOOK_SECRET non configure');
    return res.status(503).json({ error: 'Webhook non configure' });
  }

  const headerSecret = req.headers['x-webhook-secret'];
  const bearerSecret = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice('Bearer '.length)
    : null;
  const receivedSecret = typeof headerSecret === 'string' ? headerSecret : bearerSecret;

  if (!receivedSecret || receivedSecret !== configuredSecret) {
    return res.status(401).json({ error: 'Webhook non autorise' });
  }

  return next();
};

// @route   POST /api/webhooks/supabase
// @desc    Reçoit les événements de la DB Supabase
router.post('/supabase', verifyWebhookSecret, async (req: Request, res: Response) => {
  try {
    const { type, table, record } = req.body;
    logger.info('Webhook reçu depuis Supabase', { type, table });
    
    // 1. Gestion des nouveaux messages
    if (type === 'INSERT' && table === 'messages') {
      const { conversation_id, sender_id, content } = record;

      // Récupérer la conversation pour trouver le destinataire
      const { data: conv, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('participant1_id, participant2_id')
        .eq('id', conversation_id)
        .single();

      if (convError || !conv) throw new Error("Conversation introuvable");

      const recipientId = conv.participant1_id === sender_id ? conv.participant2_id : conv.participant1_id;

      // Récupérer les infos du destinataire (Email + Préférences)
      const { data: recipient, error: recipientError } = await supabaseAdmin.auth.admin.getUserById(recipientId);
      
      if (recipientError || !recipient) throw new Error("Destinataire introuvable");

      const preferences = recipient.user.user_metadata?.notification_preferences;
      const email = recipient.user.email;

      // Récupérer le nom de l'expéditeur
      const { data: senderProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('user_id', sender_id)
        .single();

      const senderName = senderProfile 
        ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() 
        : "Un membre EmiID";

      // Notifications Mail
      if (email && preferences?.messages !== false) {
        await sendNewMessageNotification(email, senderName, content.substring(0, 100));
        logger.info(`Notification email envoyée à ${email} pour le message de ${senderName}`);
      }

      // Notification In-App
      const { error: notifError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'message',
          title: `Nouveau message de ${senderName}`,
          content: content.substring(0, 100),
          link: `/messages?conv=${conversation_id}`,
          is_read: false
        });

      if (notifError) logger.error("Erreur notification in-app message", notifError);

      // Notification Push
      if (preferences?.push !== false) {
        await sendPushNotification(
          recipientId,
          `Nouveau message de ${senderName}`,
          content.substring(0, 100),
          undefined,
          `/messages?conv=${conversation_id}`
        );
      }
    }

    // 2. Gestion des nouveaux followers
    if (type === 'INSERT' && table === 'user_follows') {
      const { follower_id, following_id } = record;

      // Récupérer le profil du follower
      const { data: followerProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('user_id', follower_id)
        .single();

      const followerName = followerProfile 
        ? `${followerProfile.first_name || ''} ${followerProfile.last_name || ''}`.trim() 
        : "Un nouveau membre";

      // Récupérer les préférences du destinataire (following_id)
      const { data: recipient, error: recipientError } = await supabaseAdmin.auth.admin.getUserById(following_id);
      
      if (!recipientError && recipient) {
        const preferences = recipient.user.user_metadata?.notification_preferences;

        // Notification In-App
        await supabaseAdmin.from('notifications').insert({
          user_id: following_id,
          type: 'network',
          title: "Nouveau follower !",
          content: `${followerName} a commencé à vous suivre.`,
          link: `/profil/${follower_id}`,
          is_read: false
        });

        // Notification Push
        if (preferences?.push !== false) {
          await sendPushNotification(
            following_id,
            "Nouveau follower !",
            `${followerName} vous suit désormais.`,
            undefined,
            `/profil/${follower_id}`
          );
        }
      }
    }
    
    res.status(200).json({ success: true });
  } catch (err: any) {
    logger.error('Erreur webhook supabase', err);
    res.status(500).json({ error: err.message || 'Erreur interne' });
  }
});

export default router;
