/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour les webhooks (venant de Supabase) pour Nukun
 * @created 2026-04-17
 */

import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { supabaseAdmin } from '../../config/supabase';
import { sendNewMessageNotification } from '../../services/mailService';

const router = Router();

// Middleware optionnel pour vérifier un token secret webhook
// const verifyWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
//   const secret = req.headers['x-webhook-secret'];
//   if (secret !== process.env.WEBHOOK_SECRET) return res.status(401).send('Unauthorized');
//   next();
// };

// @route   POST /api/webhooks/supabase
// @desc    Reçoit les événements de la DB Supabase
router.post('/supabase', async (req: Request, res: Response) => {
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

      // Si les notifications par mail pour les messages sont activées
      if (email && preferences?.messages !== false) {
        // Récupérer le nom de l'expéditeur
        const { data: senderProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('user_id', sender_id)
          .single();

        const senderName = senderProfile 
          ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() 
          : "Un membre Nukun";

        await sendNewMessageNotification(email, senderName, content.substring(0, 100));
        logger.info(`Notification email envoyée à ${email} pour le message de ${senderName}`);
      }
    }
    
    res.status(200).json({ success: true });
  } catch (err: any) {
    logger.error('Erreur webhook supabase', err);
    res.status(500).json({ error: err.message || 'Erreur interne' });
  }
});

export default router;
