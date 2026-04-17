/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la messagerie entre membres Nexus
 * @created 2026-01-25
*/

import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

const MEDIATION_REQUEST_MARKER = '[MÉDIATION DEMANDÉE]';
const MEDIATION_STATUS_MARKER = '[MÉDIATION STATUT]';

const formatParticipantName = (profile: any) => {
  if (!profile) {
    return 'Utilisateur Nexus';
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return fullName || 'Utilisateur Nexus';
};

const buildProfileLookup = (profiles: any[] = []) =>
  profiles.reduce<Record<string, any>>((acc, profile) => {
    acc[profile.user_id] = profile;
    return acc;
  }, {});

const getProfilesByUserIds = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return {} as Record<string, any>;
  }

  const uniqueUserIds = Array.from(new Set(userIds));
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id, first_name, last_name, avatar_url, role')
    .in('user_id', uniqueUserIds);

  if (error) {
    throw error;
  }

  return buildProfileLookup(data || []);
};

const isAdminUser = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data?.role) {
    return false;
  }

  return data.role.toLowerCase().includes('admin');
};

const isConversationInMediation = async (conversationId: string) => {
  const { count, error } = await supabaseAdmin
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .ilike('content', `%${MEDIATION_REQUEST_MARKER}%`);

  if (error) {
    throw error;
  }

  return (count || 0) > 0;
};

const extractMediationStatus = (messages: Array<{ content: string }>) => {
  const statusMessages = messages.filter((message) => message.content.includes(MEDIATION_STATUS_MARKER));
  const latestStatus = statusMessages.length > 0 ? statusMessages[statusMessages.length - 1].content : '';

  if (latestStatus.toLowerCase().includes('resolved')) {
    return 'resolved';
  }

  if (latestStatus.toLowerCase().includes('in_progress')) {
    return 'in_progress';
  }

  return 'pending';
};

const formatConversation = (
  conv: any,
  userId: string,
  unreadCount: number,
  profileLookup: Record<string, any>,
) => {
  const otherUserId = conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id;
  const otherUser = profileLookup[otherUserId];

  return {
    id: conv.id,
    otherUser: {
      id: otherUserId,
      name: formatParticipantName(otherUser),
      avatar: otherUser?.avatar_url || null,
      role: otherUser?.role || null,
      isOnline: false,
      lastSeen: null,
    },
    lastMessage: conv.last_message_content || null,
    lastMessageAt: conv.last_message_at || null,
    unreadCount,
  };
};





/**
 * Récupère les messages d'une conversation de médiation pour l'admin
 * GET /api/messages/admin/conversation/:id
 */
export const getAdminConversationMessages = async (req: any, res: Response) => {
    const conversationId = req.params.id;

    try {
        const hasMediation = await isConversationInMediation(conversationId);

        if (!hasMediation) {
            return res.status(404).json({ error: "Aucune médiation trouvée pour cette conversation" });
        }

        const { data, error } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        logger.error("Admin conversation load error", err);
        res.status(500).json({ error: "Erreur lors du chargement des messages admin" });
    }
};


/**
 * Récupère TOUTES les conversations avec demande de médiation (ADMIN)
 * GET /api/messages/admin/disputes
 */
export const getAdminDisputes = async (req: any, res: Response) => {
    try {
        // 1. Chercher les messages de médiation pour trouver les IDs de conversation
        const { data: mediationMsgs, error: msgError } = await supabaseAdmin
            .from('messages')
            .select('conversation_id, content')
            .or(`content.ilike.%${MEDIATION_REQUEST_MARKER}%,content.ilike.%${MEDIATION_STATUS_MARKER}%`);

        if (msgError) throw msgError;

        const uniqueConvIds = Array.from(new Set(mediationMsgs.map(m => m.conversation_id)));

        if (uniqueConvIds.length === 0) return res.json([]);

        // 2. Récupérer les détails des conversations
        const { data: convs, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('*')
            .in('id', uniqueConvIds)
            .order('last_message_at', { ascending: false });

        if (convError) throw convError;

        const profileLookup = await getProfilesByUserIds(
            convs.flatMap((conv: any) => [conv.participant1_id, conv.participant2_id]),
        );

        const messagesByConversation = mediationMsgs.reduce<Record<string, Array<{ content: string }>>>((acc, message: any) => {
            acc[message.conversation_id] = acc[message.conversation_id] || [];
            acc[message.conversation_id].push({ content: message.content || '' });
            return acc;
        }, {});

        // Formater pour l'admin
        const formatted = convs.map((conv: any) => ({
            id: conv.id,
            user1: {
                id: conv.participant1_id,
                name: formatParticipantName(profileLookup[conv.participant1_id]),
                avatar: profileLookup[conv.participant1_id]?.avatar_url || null,
                role: profileLookup[conv.participant1_id]?.role || null
            },
            user2: {
                id: conv.participant2_id,
                name: formatParticipantName(profileLookup[conv.participant2_id]),
                avatar: profileLookup[conv.participant2_id]?.avatar_url || null,
                role: profileLookup[conv.participant2_id]?.role || null
            },
            lastMessage: conv.last_message_content,
            lastMessageAt: conv.last_message_at,
            status: extractMediationStatus(messagesByConversation[conv.id] || []),
        }));

        res.json(formatted);
    } catch (err) {
        logger.error("Admin disputes error", err);
        res.status(500).json({ error: "Erreur lors de la récupération des litiges" });
    }
};

/**
 * Récupère le compte Service Client / Support
 * GET /api/messages/support
 */
export const getSupportUser = async (req: any, res: Response) => {
    try {
        // On cherche le premier admin ou un compte nommé Service Client
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('user_id, first_name, last_name, avatar_url, role')
            .or('role.ilike.%admin%,first_name.ilike.%service client%')
            .neq('user_id', req.user.id)
            .limit(1)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Service Client non configuré" });
        }

        res.json({
            id: data.user_id,
            name: data.first_name + " " + (data.last_name || ""),
            avatar: data.avatar_url,
            role: data.role || "Support Nexus"
        });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération du support" });
    }
};

/**
 * Demande une médiation pour une conversation
 * POST /api/messages/dispute/:conversationId
 */
export const requestMediation = async (req: any, res: Response) => {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { reason } = req.body;

    try {
        // 1. Vérifier si l'utilisateur est participant de cette conversation
        const { data: conv, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('id, participant1_id, participant2_id')
            .eq('id', conversationId)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .single();

        if (convError || !conv) {
            return res.status(403).json({ error: "Accès refusé à cette conversation" });
        }

        const profileLookup = await getProfilesByUserIds([conv.participant1_id, conv.participant2_id]);
        const requesterProfile = userId === conv.participant1_id
            ? profileLookup[conv.participant1_id]
            : profileLookup[conv.participant2_id];
        const requesterName = requesterProfile?.first_name || formatParticipantName(requesterProfile);

        // 2. Envoyer le message système de médiation
        const { data: msg, error: msgError } = await supabaseAdmin
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: userId,
                content: `⚠️ [MÉDIATION DEMANDÉE] Motif : ${reason || 'Non précisé'}. Demandé par ${requesterName}.`,
                is_read: false
            })
            .select()
            .single(); // Added .select().single() to match common pattern and get the inserted message

        if (msgError) throw msgError;

        // 3. Ici on pourrait envoyer un email à l'admin ou créer un ticket
        // Pour l'instant, on marque la conversation (facultatif si champ existe)

        res.json({ success: true, message: "Médiation demandée avec succès" });
    } catch (err) {
        logger.error("Mediation error", err);
        res.status(500).json({ error: "Erreur lors de la demande de médiation" });
    }
};

/**
 * Permet à l'Admin de répondre dans une conversation de médiation
 * POST /api/messages/admin/reply/:conversationId
 */
export const replyToMediation = async (req: any, res: Response) => {
    const adminId = req.user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "Contenu requis" });

    try {
        const hasMediation = await isConversationInMediation(conversationId);

        if (!hasMediation) {
            return res.status(404).json({ error: "Aucune médiation active pour cette conversation" });
        }

        // Envoi du message direct dans la conversation
        const { data: msg, error: msgError } = await supabaseAdmin
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: adminId,
                content: content,
                is_read: false
            })
            .select()
            .single();

        if (msgError) throw msgError;

        // Mise à jour de la date de dernier message
        await supabaseAdmin
            .from('conversations')
            .update({
                last_message_content: `(Admin): ${content.substring(0, 50)}`,
                last_message_at: new Date().toISOString()
            })
            .eq('id', conversationId);

        res.status(201).json(msg);
    } catch (err) {
        logger.error("Admin reply error", err);
        res.status(500).json({ error: "Erreur lors de la réponse admin" });
    }
};

/**
 * Met à jour le statut d'une médiation.
 * POST /api/messages/admin/status/:conversationId
 */
export const updateMediationStatus = async (req: any, res: Response) => {
    const adminId = req.user.id;
    const { conversationId } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Statut de médiation invalide' });
    }

    try {
        const hasMediation = await isConversationInMediation(conversationId);

        if (!hasMediation) {
            return res.status(404).json({ error: 'Aucune médiation active pour cette conversation' });
        }

        const content = `⚖️ ${MEDIATION_STATUS_MARKER} ${status}`;

        const { data: msg, error: msgError } = await supabaseAdmin
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: adminId,
                content,
                is_read: false,
            })
            .select()
            .single();

        if (msgError) {
            return res.status(400).json({ error: msgError.message });
        }

        await supabaseAdmin
            .from('conversations')
            .update({
                last_message_content: `(Statut médiation): ${status}`,
                last_message_at: new Date().toISOString(),
            })
            .eq('id', conversationId);

        return res.json({ success: true, message: msg });
    } catch (err) {
        logger.error('Admin mediation status error', err);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut de médiation' });
    }
};



/**
 * Marque les messages d'une conversation de médiation comme lus pour l'admin
 * POST /api/messages/admin/read/:conversationId
 */
export const markAdminAsRead = async (req: any, res: Response) => {
    const adminId = req.user.id;
    const { conversationId } = req.params;

    try {
        const isAdmin = await isAdminUser(adminId);
        if (!isAdmin) {
            return res.status(403).json({ error: "Accès refusé. Droits administrateur requis." });
        }

        const hasMediation = await isConversationInMediation(conversationId);
        if (!hasMediation) {
            return res.status(404).json({ error: "Aucune médiation trouvée pour cette conversation" });
        }

        const { error } = await supabaseAdmin
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', adminId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ success: true });
    } catch (err) {
        logger.error("Admin mark as read error", err);
        res.status(500).json({ error: "Erreur lors du marquage admin comme lu" });
    }
};
