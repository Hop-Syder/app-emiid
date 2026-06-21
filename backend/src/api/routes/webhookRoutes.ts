/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour les webhooks (venant de Supabase) pour EmiID
 * @created 2026-04-17
 */

import { Router, Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'crypto';
import { logger } from '../../utils/logger';
import { supabaseAdmin } from '../../config/supabase';
import { sendNewMessageNotification } from '../../services/mailService';
import { sendPushNotification } from '../../services/pushService';
import { z } from 'zod';

const router = Router();

/**
 * Vérifie le secret partagé du webhook (header `x-webhook-secret`).
 * SÉCURITÉ : sans cette vérification, n'importe qui pourrait POSTer un payload
 * forgé pour spammer des emails ou injecter des notifications in-app (phishing).
 * Comparaison à temps constant pour éviter les attaques temporelles.
 */
const verifyWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
  const expected = (process.env.WEBHOOK_SECRET || '').trim();
  if (!expected) {
    logger.error('WEBHOOK_SECRET non configuré : webhook bloqué par défaut.');
    return res.status(503).json({ error: 'Webhook non configuré' });
  }

  const provided = req.headers['x-webhook-secret'];
  const providedStr = typeof provided === 'string' ? provided : '';

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(providedStr);

  if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
    logger.warn('Webhook rejeté : secret invalide ou manquant.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// @route   POST /api/webhooks/supabase
// @desc    Reçoit les événements de la DB Supabase
router.post('/supabase', verifyWebhookSecret, async (req: Request, res: Response) => {
  try {
    const { type, table, record } = z.object({
      type: z.string().optional(),
      table: z.string().optional(),
      record: z.any().optional()
    }).parse(req.body || {});
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

      // Notifications Mail — newsletter=false désactive tous les emails EmiID
      if (email && preferences?.messages !== false && preferences?.newsletter !== false) {
        await sendNewMessageNotification(email, senderName, content.substring(0, 100));
        logger.info(`Notification email envoyée à ${email} pour le message de ${senderName}`);
      }

      // Notification In-App (toujours — indépendant des préférences push/email)
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

      // Notification Push — vérifier messages ET push activés
      if (preferences?.push !== false && preferences?.messages !== false) {
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

        // Notification Push — vérifier network_activity ET push activés
        if (preferences?.push !== false && preferences?.network_activity !== false) {
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
    res.status(500).json({ error: 'Erreur interne' });
  }
});

export default router;
