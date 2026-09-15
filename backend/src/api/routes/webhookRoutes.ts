/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour les webhooks (venant de Supabase) pour EmiID
 * @created 2026-04-17
 */

import { Router, Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'crypto';
import { logger } from '../../utils/logger';
import { supabaseAdmin, supabaseAdminUntyped as db } from '../../config/supabase';
import { sendNewMessageNotification, sendWelcomeEmail } from '../../services/mailService';
import { sendPushNotification } from '../../services/pushService';
import { z } from 'zod';

const router = Router();

/** Nom affichable "Prénom Nom", ou un libellé de repli si le profil est absent/vide. */
function formatDisplayName(profile: { first_name?: string | null; last_name?: string | null } | null | undefined, fallback: string): string {
  if (!profile) return fallback;
  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return name || fallback;
}

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
    return res.status(503).send('Webhook non configuré');
  }

  const provided = req.headers['x-webhook-secret'];
  const providedStr = typeof provided === 'string' ? provided : '';

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(providedStr);

  if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
    logger.warn('Webhook rejeté : secret invalide ou manquant.');
    return res.sendStatus(401);
  }

  next();
};

// @route   POST /api/webhooks/supabase
// @desc    Reçoit les événements de la DB Supabase
router.post('/supabase', verifyWebhookSecret, async (req: Request, res: Response) => {
  try {
    const { type, table, record, old_record } = z.object({
      type: z.string().optional(),
      table: z.string().optional(),
      record: z.any().optional(),
      old_record: z.any().optional()
    }).parse(req.body || {});
    logger.info('Webhook reçu depuis Supabase', { type, table });
    
    // 1. Gestion des nouveaux messages
    if (type === 'INSERT' && table === 'messages') {
      const { conversation_id, sender_id, content } = record;

      // Récupérer la conversation (DM: participant1/2 ; groupe: participants)
      const { data: conv, error: convError } = await (supabaseAdmin
        .from('conversations')
        .select('participant1_id, participant2_id, is_group')
        .eq('id', conversation_id)
        .single() as any);

      if (convError || !conv) throw new Error("Conversation introuvable");

      // Destinataires : DM → l'autre ; groupe → tous les membres 'joined' sauf l'expéditeur
      const isGroup = !!conv.is_group;
      let recipientIds: string[] = [];
      if (!isGroup && (conv.participant1_id || conv.participant2_id)) {
        const other = conv.participant1_id === sender_id ? conv.participant2_id : conv.participant1_id;
        if (other) recipientIds = [other];
      } else {
        const { data: parts } = await (supabaseAdmin.from('conversation_participants' as never) as any)
          .select('user_id')
          .eq('conversation_id', conversation_id)
          .eq('status', 'joined')
          .neq('user_id', sender_id);
        recipientIds = (parts || []).map((p: any) => p.user_id).filter(Boolean);
      }

      if (recipientIds.length > 0) {
        // Nom de l'expéditeur
        const { data: senderProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('user_id', sender_id)
          .single();
        const senderName = formatDisplayName(senderProfile, "Un membre EmiID");

        // Notification In-App pour tous les destinataires
        const { error: notifError } = await supabaseAdmin
          .from('notifications')
          .insert(recipientIds.map((rid) => ({
            user_id: rid,
            type: 'message',
            title: `Nouveau message de ${senderName}`,
            content: content.substring(0, 100),
            link: `/messages?conv=${conversation_id}`,
            is_read: false,
          })));
        if (notifError) logger.error("Erreur notification in-app message", notifError);

        // Email + Push : uniquement en DM (éviter le spam de groupe — fan-out groupe = Étape 3)
        if (!isGroup && recipientIds.length === 1) {
          const recipientId = recipientIds[0];
          const { data: recipient } = await supabaseAdmin.auth.admin.getUserById(recipientId);
          const preferences = recipient?.user?.user_metadata?.notification_preferences;
          const email = recipient?.user?.email;

          if (email && preferences?.messages !== false && preferences?.newsletter !== false) {
            await sendNewMessageNotification(email, senderName, content.substring(0, 100));
            logger.info(`Notification email envoyée à ${email} pour le message de ${senderName}`);
          }
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

      const followerName = formatDisplayName(followerProfile, "Un nouveau membre");

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

    // 3. Email de bienvenue à la création d'un compte (profil créé par le trigger handle_new_user).
    //    Couvre toutes les méthodes d'inscription (OAuth + email).
    if (type === 'INSERT' && table === 'user_profiles') {
      // Fire-and-forget : l'envoi SMTP est lent (~15 s). On NE bloque PAS la réponse
      // du webhook, sinon Supabase peut timeout (~5 s) et réessayer → emails en double.
      // Le serveur Express reste vivant, la promesse se résout en arrière-plan.
      void (async () => {
        let email = record?.email;
        let firstName = record?.first_name;
        const userId = record?.user_id;

        // Fallback : le record n'a pas toujours l'email/prénom au moment de l'INSERT.
        if ((!email || !firstName) && userId) {
          try {
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
            email = email || authUser?.user?.email || undefined;
            firstName = firstName
              || authUser?.user?.user_metadata?.first_name
              || authUser?.user?.user_metadata?.given_name
              || (authUser?.user?.user_metadata?.full_name
                  ? String(authUser.user.user_metadata.full_name).split(' ')[0]
                  : undefined);
          } catch (lookupErr) {
            logger.warn('Webhook bienvenue : échec récupération auth.users', lookupErr);
          }
        }

        if (!email) {
          logger.warn('Webhook user_profiles INSERT sans email (même après fallback auth) : email de bienvenue ignoré.');
          return;
        }

        try {
          await sendWelcomeEmail(email, firstName);
          logger.info(`Email de bienvenue envoyé à ${email}`);
        } catch (mailErr) {
          logger.error(`Échec envoi email de bienvenue à ${email}`, mailErr);
        }
      })();
    }

    // 4. Moteur Missions — nouvelle candidature reçue par le client.
    //    Nécessite un Database Webhook Supabase configuré côté tableau de bord
    //    sur INSERT/UPDATE de public.mission_applications vers cette même route
    //    (voir docs/business-plan-missions.md — pas de table de config en SQL,
    //    même mécanisme que les webhooks messages/user_follows ci-dessus).
    //    Fire-and-forget comme la section 3 : plusieurs appels réseau en
    //    séquence dépasseraient facilement le délai de livraison Supabase
    //    (~5s), provoquant un rejeu et donc des notifications en double.
    if (type === 'INSERT' && table === 'mission_applications') {
      const { mission_id, pro_id } = record || {};
      if (mission_id && pro_id) {
        void (async () => {
          try {
            const [{ data: mission, error: missionErr }, { data: proProfile }] = await Promise.all([
              db.from('missions').select('title, client_id').eq('id', mission_id).single(),
              supabaseAdmin.from('user_profiles').select('first_name, last_name').eq('user_id', pro_id).single(),
            ]);

            if (missionErr || !mission?.client_id) {
              logger.error(`Webhook candidature : mission ${mission_id} introuvable`, missionErr);
              return;
            }

            const proName = formatDisplayName(proProfile, 'Un prestataire');
            const content = `${proName} a postulé à votre mission « ${mission.title} ».`;

            // Indépendants l'un de l'autre (tous deux ne dépendent que de
            // mission.client_id, déjà connu) : lancés en parallèle.
            const [{ error: notifError }, { data: recipient }] = await Promise.all([
              supabaseAdmin.from('notifications').insert({
                user_id: mission.client_id,
                type: 'mission',
                title: 'Nouvelle candidature reçue',
                content,
                link: `/missions/${mission_id}`,
                is_read: false,
              }),
              supabaseAdmin.auth.admin.getUserById(mission.client_id),
            ]);
            if (notifError) logger.error('Webhook candidature : notification in-app échouée', notifError);

            const preferences = recipient?.user?.user_metadata?.notification_preferences;
            if (preferences?.push !== false) {
              await sendPushNotification(mission.client_id, 'Nouvelle candidature reçue', content, undefined, `/missions/${mission_id}`);
            }
          } catch (err) {
            // Fire-and-forget : une exception ici (réseau, timeout) ne doit
            // jamais devenir une unhandled rejection non journalisée.
            logger.error('Webhook candidature : traitement échoué', err);
          }
        })();
      }
    }

    // 5. Moteur Missions — issue de la sélection (ACCEPTED/REJECTED), posée par
    //    select_mission_applicant() dans 20260915b_missions_engine_phase2_selection.sql.
    //    Même raison de fire-and-forget que la section 4.
    if (type === 'UPDATE' && table === 'mission_applications') {
      const newStatus = record?.status;
      const oldStatus = old_record?.status;
      const { mission_id, pro_id } = record || {};
      if (mission_id && pro_id && newStatus !== oldStatus && (newStatus === 'ACCEPTED' || newStatus === 'REJECTED')) {
        void (async () => {
          try {
            // Indépendants (aucun ne dépend de l'autre — pro_id est déjà connu
            // via record) : lancés en parallèle.
            const [{ data: mission, error: missionErr }, { data: recipient }] = await Promise.all([
              db.from('missions').select('title').eq('id', mission_id).single(),
              supabaseAdmin.auth.admin.getUserById(pro_id),
            ]);
            if (missionErr) logger.error(`Webhook sélection : mission ${mission_id} introuvable`, missionErr);
            const missionTitle = mission?.title || 'une mission';

            const title = newStatus === 'ACCEPTED' ? 'Candidature retenue !' : 'Candidature non retenue';
            const content = newStatus === 'ACCEPTED'
              ? `Vous avez été sélectionné pour la mission « ${missionTitle} ». Contactez le client pour démarrer.`
              : `Votre candidature pour la mission « ${missionTitle} » n'a pas été retenue cette fois-ci.`;

            const { error: notifError } = await supabaseAdmin.from('notifications').insert({
              user_id: pro_id,
              type: 'mission',
              title,
              content,
              link: `/missions/${mission_id}`,
              is_read: false,
            });
            if (notifError) logger.error('Webhook sélection : notification in-app échouée', notifError);

            const preferences = recipient?.user?.user_metadata?.notification_preferences;
            if (preferences?.push !== false) {
              await sendPushNotification(pro_id, title, content, undefined, `/missions/${mission_id}`);
            }
          } catch (err) {
            logger.error('Webhook sélection : traitement échoué', err);
          }
        })();
      }
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    logger.error('Erreur webhook supabase', err);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

export default router;
