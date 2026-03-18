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
