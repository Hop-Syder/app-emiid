/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la messagerie entre membres Nexus
 * @created 2026-01-25
*/

import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

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
 * Récupère les conversations de l'utilisateur
 * GET /api/messages/conversations
 */
export const getMyConversations = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    if (!data || data.length === 0) {
      return res.json([]);
    }

    const conversationIds = data.map((conv: any) => conv.id);
    const profileLookup = await getProfilesByUserIds(
      data.flatMap((conv: any) => [conv.participant1_id, conv.participant2_id]),
    );
    const { data: unreadMessages, error: unreadError } = await supabaseAdmin
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (unreadError) {
      return res.status(400).json({ error: unreadError.message });
    }

    const unreadCountByConversation = (unreadMessages || []).reduce<Record<string, number>>((acc, message: any) => {
      acc[message.conversation_id] = (acc[message.conversation_id] || 0) + 1;
      return acc;
    }, {});

    const conversations = data.map((conv: any) =>
      formatConversation(conv, userId, unreadCountByConversation[conv.id] || 0, profileLookup),
    );

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du chargement des conversations" });
  }
};

/**
 * Récupère les messages d'une conversation
 * GET /api/messages/conversation/:id
 */
export const getConversationMessages = async (req: any, res: Response) => {
    const conversationId = req.params.id;

    try {
        // 1. Vérifier si l'utilisateur est participant de cette conversation
        const { data: conv, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .or(`participant1_id.eq.${req.user.id},participant2_id.eq.${req.user.id}`)
            .single();

        if (convError || !conv) {
            return res.status(403).json({ error: "Accès refusé à cette conversation" });
        }

        const { data, error } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) return res.status(400).json({ error: error.message });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors du chargement des messages" });
    }
};

/**
 * Envoie un message
 * POST /api/messages/send
 */
export const sendMessage = async (req: any, res: Response) => {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    const trimmedContent = typeof content === 'string' ? content.trim() : '';

    if (!trimmedContent || !receiverId) {
        return res.status(400).json({ error: "Destinataire et contenu requis" });
    }

    if (receiverId === senderId) {
        return res.status(400).json({ error: "Vous ne pouvez pas vous envoyer un message à vous-même" });
    }

    try {
        const { data: receiverData, error: receiverError } = await supabaseAdmin.auth.admin.getUserById(receiverId);

        if (receiverError || !receiverData.user) {
            return res.status(404).json({ error: "Destinataire introuvable" });
        }

        // 1. Chercher ou créer la conversation
        const p1 = senderId < receiverId ? senderId : receiverId;
        const p2 = senderId < receiverId ? receiverId : senderId;

        let { data: conv, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('participant1_id', p1)
            .eq('participant2_id', p2)
            .single();

        if (convError && convError.code !== 'PGRST116') {
            return res.status(400).json({ error: convError.message });
        }

        if (!conv) {
             const { data: newConv, error: createError } = await supabaseAdmin
                .from('conversations')
                .insert({ participant1_id: p1, participant2_id: p2 })
                .select('id')
                .single();
             if (createError) return res.status(400).json({ error: createError.message || "Erreur création conversation" });
             conv = newConv;
        }

        // 2. Envoyer le message
        const { data: msg, error: msgError } = await supabaseAdmin
            .from('messages')
            .insert({
                conversation_id: conv.id,
                sender_id: senderId,
                content: trimmedContent,
                is_read: false,
            })
            .select()
            .single();

        if (msgError || !msg) {
            return res.status(400).json({ error: msgError?.message || "Erreur lors de l'envoi du message" });
        }

        // 3. Mettre à jour la conversation
        await supabaseAdmin
            .from('conversations')
            .update({
                last_message_content: trimmedContent,
                last_message_at: new Date().toISOString()
            })
            .eq('id', conv.id);

        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'envoi du message" });
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
            .select('conversation_id')
            .ilike('content', '%[MÉDIATION DEMANDÉE]%');

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
            lastMessageAt: conv.last_message_at
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
 * Marque les messages d'une conversation comme lus
...
...
 * POST /api/messages/read/:conversationId
 */
export const markAsRead = async (req: any, res: Response) => {
    const userId = req.user.id;
    const { conversationId } = req.params;

    try {
        // 1. Vérifier participation
        const { data: conv, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .single();

        if (convError || !conv) {
            return res.status(403).json({ error: "Accès refusé" });
        }

        const { error } = await supabaseAdmin
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId);

        if (error) return res.status(400).json({ error: error.message });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors du marquage comme lu" });
    }
};
