/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la messagerie entre membres Nexus
 * @created 2026-01-25
*/

import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

/**
 * Récupère les conversations de l'utilisateur
 * GET /api/messages/conversations
 */
export const getMyConversations = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        user1:participant1_id (first_name, last_name, avatar_url, role),
        user2:participant2_id (first_name, last_name, avatar_url, role)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    // Nettoyer les données pour renvoyer l'interlocuteur
    const conversations = data.map((conv: any) => {
      const otherUser = conv.participant1_id === userId ? conv.user2 : conv.user1;
      return {
        id: conv.id,
        otherUser: {
          id: conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id,
          name: `${otherUser.first_name} ${otherUser.last_name}`,
          avatar: otherUser.avatar_url,
          role: otherUser.role
        },
        lastMessage: conv.last_message_content,
        lastMessageAt: conv.last_message_at
      };
    });

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

    if (!content || !receiverId) return res.status(400).json({ error: "Destinataire et contenu requis" });

    try {
        // 1. Chercher ou créer la conversation
        const p1 = senderId < receiverId ? senderId : receiverId;
        const p2 = senderId < receiverId ? receiverId : senderId;

        let { data: conv, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('participant1_id', p1)
            .eq('participant2_id', p2)
            .single();

        if (!conv) {
             const { data: newConv, error: createError } = await supabaseAdmin
                .from('conversations')
                .insert({ participant1_id: p1, participant2_id: p2 })
                .select('id')
                .single();
             if (createError) return res.status(400).json({ error: "Erreur création conversation" });
             conv = newConv;
        }

        // 2. Envoyer le message
        const { data: msg, error: msgError } = await supabaseAdmin
            .from('messages')
            .insert({
                conversation_id: conv.id,
                sender_id: senderId,
                content: content
            })
            .select()
            .single();

        // 3. Mettre à jour la conversation
        await supabaseAdmin
            .from('conversations')
            .update({
                last_message_content: content,
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
            .select(`
                *,
                user1:participant1_id (first_name, last_name, avatar_url, role),
                user2:participant2_id (first_name, last_name, avatar_url, role)
            `)
            .in('id', uniqueConvIds)
            .order('last_message_at', { ascending: false });

        if (convError) throw convError;

        // Formater pour l'admin
        const formatted = convs.map((conv: any) => ({
            id: conv.id,
            user1: {
                id: conv.participant1_id,
                name: `${conv.user1.first_name || ""} ${conv.user1.last_name || ""}`,
                avatar: conv.user1.avatar_url,
                role: conv.user1.role
            },
            user2: {
                id: conv.participant2_id,
                name: `${conv.user2.first_name || ""} ${conv.user2.last_name || ""}`,
                avatar: conv.user2.avatar_url,
                role: conv.user2.role
            },
            lastMessage: conv.last_message_content,
            lastMessageAt: conv.last_message_at
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Admin disputes error:", err);
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
            .select(`
              id,
              participant1_id,
              participant2_id,
              user1:participant1_id (first_name),
              user2:participant2_id (first_name)
            `)
            .eq('id', conversationId)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .single();

        if (convError || !conv) {
            return res.status(403).json({ error: "Accès refusé à cette conversation" });
        }

        const requesterName = userId === conv.participant1_id ?
            (conv.user1 as any).first_name : (conv.user2 as any).first_name;

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
        console.error("Mediation error:", err);
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
        console.error("Admin reply error:", err);
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
