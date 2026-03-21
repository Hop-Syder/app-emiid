"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la messagerie entre membres Nexus
 * @created 2026-01-25
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getSupportUser = exports.sendMessage = exports.getConversationMessages = exports.getMyConversations = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Récupère les conversations de l'utilisateur
 * GET /api/messages/conversations
 */
const getMyConversations = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('conversations')
            .select(`
        *,
        user1:participant1_id (first_name, last_name, avatar_url, role),
        user2:participant2_id (first_name, last_name, avatar_url, role)
      `)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .order('last_message_at', { ascending: false });
        if (error)
            return res.status(400).json({ error: error.message });
        // Nettoyer les données pour renvoyer l'interlocuteur
        const conversations = data.map((conv) => {
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
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors du chargement des conversations" });
    }
};
exports.getMyConversations = getMyConversations;
/**
 * Récupère les messages d'une conversation
 * GET /api/messages/conversation/:id
 */
const getConversationMessages = async (req, res) => {
    const conversationId = req.params.id;
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors du chargement des messages" });
    }
};
exports.getConversationMessages = getConversationMessages;
/**
 * Envoie un message
 * POST /api/messages/send
 */
const sendMessage = async (req, res) => {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    if (!content || !receiverId)
        return res.status(400).json({ error: "Destinataire et contenu requis" });
    try {
        // 1. Chercher ou créer la conversation
        const p1 = senderId < receiverId ? senderId : receiverId;
        const p2 = senderId < receiverId ? receiverId : senderId;
        let { data: conv, error: convError } = await supabase_1.supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('participant1_id', p1)
            .eq('participant2_id', p2)
            .single();
        if (!conv) {
            const { data: newConv, error: createError } = await supabase_1.supabaseAdmin
                .from('conversations')
                .insert({ participant1_id: p1, participant2_id: p2 })
                .select('id')
                .single();
            if (createError)
                return res.status(400).json({ error: "Erreur création conversation" });
            conv = newConv;
        }
        // 2. Envoyer le message
        const { data: msg, error: msgError } = await supabase_1.supabaseAdmin
            .from('messages')
            .insert({
            conversation_id: conv.id,
            sender_id: senderId,
            content: content
        })
            .select()
            .single();
        // 3. Mettre à jour la conversation
        await supabase_1.supabaseAdmin
            .from('conversations')
            .update({
            last_message_content: content,
            last_message_at: new Date().toISOString()
        })
            .eq('id', conv.id);
        res.status(201).json(msg);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de l'envoi du message" });
    }
};
exports.sendMessage = sendMessage;
/**
 * Récupère le compte Service Client / Support
 * GET /api/messages/support
 */
const getSupportUser = async (req, res) => {
    try {
        // On cherche le premier admin ou un compte nommé Service Client
        const { data, error } = await supabase_1.supabaseAdmin
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
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération du support" });
    }
};
exports.getSupportUser = getSupportUser;
/**
 * Marque les messages d'une conversation comme lus
 * POST /api/messages/read/:conversationId
 */
const markAsRead = async (req, res) => {
    const userId = req.user.id;
    const { conversationId } = req.params;
    try {
        const { error } = await supabase_1.supabaseAdmin
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId);
        if (error)
            return res.status(400).json({ error: error.message });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors du marquage comme lu" });
    }
};
exports.markAsRead = markAsRead;
