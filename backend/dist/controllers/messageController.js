"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la messagerie entre membres EmiID
 * @created 2026-01-25
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConversation = exports.getConversationMessages = exports.getConversations = exports.markAdminAsRead = exports.updateMediationStatus = exports.replyToMediation = exports.requestMediation = exports.getSupportUser = exports.getAdminDisputes = exports.getAdminConversationMessages = exports.uploadMessageImage = exports.sendMessage = exports.upload = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const zod_1 = require("zod");
const messageValidations_1 = require("../api/validations/messageValidations");
const multer_1 = __importDefault(require("multer"));
const MEDIATION_REQUEST_MARKER = '[MÉDIATION DEMANDÉE]';
const MEDIATION_STATUS_MARKER = '[MÉDIATION STATUT]';
const formatParticipantName = (profile) => {
    if (!profile) {
        return 'Utilisateur EmiID';
    }
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return fullName || 'Utilisateur EmiID';
};
const buildProfileLookup = (profiles = []) => profiles.reduce((acc, profile) => {
    acc[profile.user_id] = profile;
    return acc;
}, {});
const getProfilesByUserIds = async (userIds) => {
    if (userIds.length === 0) {
        return {};
    }
    const uniqueUserIds = Array.from(new Set(userIds));
    const { data, error } = await supabase_1.supabaseAdmin
        .from('user_profiles')
        .select('user_id, first_name, last_name, avatar_url, role')
        .in('user_id', uniqueUserIds);
    if (error) {
        throw error;
    }
    return buildProfileLookup(data || []);
};
const isAdminUser = async (userId) => {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
    if (error || !data?.role) {
        return false;
    }
    return data.role.toLowerCase().includes('admin');
};
const isConversationInMediation = async (conversationId) => {
    const { count, error } = await supabase_1.supabaseAdmin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .ilike('content', `%${MEDIATION_REQUEST_MARKER}%`);
    if (error) {
        throw error;
    }
    return (count || 0) > 0;
};
const extractMediationStatus = (messages) => {
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
const formatConversation = (conv, userId, unreadCount, profileLookup) => {
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
// ─── Stockage en mémoire pour multer (images) ────────────────────────────────
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5 Mo
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Format non supporté. Utilisez JPG, PNG, GIF ou WEBP.'));
        }
    },
});
// ─── Envoi de messages ────────────────────────────────────────────────────────
/**
 * Envoie un message texte ou emoji dans une conversation
 * POST /api/messages/send
 */
const sendMessage = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Non authentifié' });
    try {
        const { body: { conversation_id, content, message_type } } = messageValidations_1.sendMessageSchema.parse(req);
        // Vérifier que l'utilisateur est bien participant
        const { data: conv, error: convError } = await supabase_1.supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('id', conversation_id)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .single();
        if (convError || !conv) {
            return res.status(403).json({ error: 'Accès refusé à cette conversation' });
        }
        // Insérer le message
        const { data: message, error: msgError } = await supabase_1.supabaseAdmin
            .from('messages')
            .insert({
            conversation_id,
            sender_id: userId,
            content,
            message_type,
            is_read: false,
        })
            .select()
            .single();
        if (msgError)
            throw msgError;
        // Mettre à jour le dernier message de la conversation
        const preview = message_type === 'emoji' ? content : content.substring(0, 60);
        await supabase_1.supabaseAdmin
            .from('conversations')
            .update({
            last_message_content: preview,
            last_message_at: new Date().toISOString(),
        })
            .eq('id', conversation_id);
        return res.status(201).json(message);
    }
    catch (err) {
        logger_1.logger.error('Send message error', err);
        return res.status(500).json({ error: "Erreur lors de l'envoi du message" });
    }
};
exports.sendMessage = sendMessage;
/**
 * Upload une image vers Supabase Storage et envoie le message image
 * POST /api/messages/upload/:conversationId
 */
const uploadMessageImage = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Non authentifié' });
    try {
        const { params: { conversationId } } = messageValidations_1.imageUploadSchema.parse(req);
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }
        // Vérifier accès à la conversation
        const { data: conv, error: convError } = await supabase_1.supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .single();
        if (convError || !conv) {
            return res.status(403).json({ error: 'Accès refusé à cette conversation' });
        }
        // Générer un nom de fichier unique dans le dossier de l'utilisateur
        const ext = req.file.originalname.split('.').pop();
        const fileName = `${userId}/${conversationId}/${Date.now()}.${ext}`;
        // Upload vers le bucket 'messages'
        const { error: uploadError } = await supabase_1.supabaseAdmin.storage
            .from('messages')
            .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
        });
        if (uploadError)
            throw uploadError;
        // Récupérer l'URL signée (valide 7 jours)
        const { data: signedData, error: signedError } = await supabase_1.supabaseAdmin.storage
            .from('messages')
            .createSignedUrl(fileName, 60 * 60 * 24 * 7);
        if (signedError || !signedData?.signedUrl)
            throw signedError;
        // Insérer le message image
        const { data: message, error: msgError } = await supabase_1.supabaseAdmin
            .from('messages')
            .insert({
            conversation_id: conversationId,
            sender_id: userId,
            content: req.body.caption || null,
            message_type: 'image',
            media_url: signedData.signedUrl,
            is_read: false,
        })
            .select()
            .single();
        if (msgError)
            throw msgError;
        // Mettre à jour la conversation
        await supabase_1.supabaseAdmin
            .from('conversations')
            .update({
            last_message_content: '📷 Image',
            last_message_at: new Date().toISOString(),
        })
            .eq('id', conversationId);
        return res.status(201).json(message);
    }
    catch (err) {
        logger_1.logger.error('Upload image error', err);
        return res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
    }
};
exports.uploadMessageImage = uploadMessageImage;
/**
 * Récupère les messages d'une conversation de médiation pour l'admin
 * GET /api/messages/admin/conversation/:id
 */
const getAdminConversationMessages = async (req, res) => {
    try {
        const { params: { id: conversationId } } = zod_1.z.object({ params: zod_1.z.object({ id: zod_1.z.string() }) }).parse(req);
        const hasMediation = await isConversationInMediation(conversationId);
        if (!hasMediation) {
            return res.status(404).json({ error: "Aucune médiation trouvée pour cette conversation" });
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json(data);
    }
    catch (err) {
        logger_1.logger.error("Admin conversation load error", err);
        res.status(500).json({ error: "Erreur lors du chargement des messages admin" });
    }
};
exports.getAdminConversationMessages = getAdminConversationMessages;
/**
 * Récupère TOUTES les conversations avec demande de médiation (ADMIN)
 * GET /api/messages/admin/disputes
 */
const getAdminDisputes = async (req, res) => {
    try {
        // 1. Chercher les messages de médiation pour trouver les IDs de conversation
        const { data: mediationMsgs, error: msgError } = await supabase_1.supabaseAdmin
            .from('messages')
            .select('conversation_id, content')
            .or(`content.ilike.%${MEDIATION_REQUEST_MARKER}%,content.ilike.%${MEDIATION_STATUS_MARKER}%`);
        if (msgError)
            throw msgError;
        const uniqueConvIds = Array.from(new Set(mediationMsgs.map(m => m.conversation_id)));
        if (uniqueConvIds.length === 0)
            return res.json([]);
        // 2. Récupérer les détails des conversations
        const { data: convs, error: convError } = await supabase_1.supabaseAdmin
            .from('conversations')
            .select('*')
            .in('id', uniqueConvIds)
            .order('last_message_at', { ascending: false });
        if (convError)
            throw convError;
        const profileLookup = await getProfilesByUserIds(convs.flatMap((conv) => [conv.participant1_id, conv.participant2_id]));
        const messagesByConversation = mediationMsgs.reduce((acc, message) => {
            acc[message.conversation_id] = acc[message.conversation_id] || [];
            acc[message.conversation_id].push({ content: message.content || '' });
            return acc;
        }, {});
        // Formater pour l'admin
        const formatted = convs.map((conv) => ({
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
    }
    catch (err) {
        logger_1.logger.error("Admin disputes error", err);
        res.status(500).json({ error: "Erreur lors de la récupération des litiges" });
    }
};
exports.getAdminDisputes = getAdminDisputes;
/**
 * Récupère le compte Service Client / Support
 * GET /api/messages/support
 */
const getSupportUser = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: "Non authentifié" });
    try {
        // On cherche le premier admin ou un compte nommé Service Client
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select('user_id, first_name, last_name, avatar_url, role')
            .or('role.ilike.%admin%,first_name.ilike.%service client%')
            .neq('user_id', userId)
            .limit(1)
            .single();
        if (error || !data) {
            return res.status(404).json({ error: "Service Client non configuré" });
        }
        res.json({
            id: data.user_id,
            name: data.first_name + " " + (data.last_name || ""),
            avatar: data.avatar_url,
            role: data.role || "Support EmiID"
        });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération du support" });
    }
};
exports.getSupportUser = getSupportUser;
/**
 * Demande une médiation pour une conversation
 * POST /api/messages/dispute/:conversationId
 */
const requestMediation = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: "Non authentifié" });
    try {
        const { params: { conversationId } } = zod_1.z.object({ params: zod_1.z.object({ conversationId: zod_1.z.string() }) }).parse(req);
        const { body: { reason } } = messageValidations_1.requestMediationSchema.parse(req);
        // 1. Vérifier si l'utilisateur est participant de cette conversation
        const { data: conv, error: convError } = await supabase_1.supabaseAdmin
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
        const { data: msg, error: msgError } = await supabase_1.supabaseAdmin
            .from('messages')
            .insert({
            conversation_id: conversationId,
            sender_id: userId,
            content: `⚠️ [MÉDIATION DEMANDÉE] Motif : ${reason || 'Non précisé'}. Demandé par ${requesterName}.`,
            is_read: false
        })
            .select()
            .single(); // Added .select().single() to match common pattern and get the inserted message
        if (msgError)
            throw msgError;
        // 3. Ici on pourrait envoyer un email à l'admin ou créer un ticket
        // Pour l'instant, on marque la conversation (facultatif si champ existe)
        res.json({ success: true, message: "Médiation demandée avec succès" });
    }
    catch (err) {
        logger_1.logger.error("Mediation error", err);
        res.status(500).json({ error: "Erreur lors de la demande de médiation" });
    }
};
exports.requestMediation = requestMediation;
/**
 * Permet à l'Admin de répondre dans une conversation de médiation
 * POST /api/messages/admin/reply/:conversationId
 */
const replyToMediation = async (req, res) => {
    const adminId = req.user?.id;
    if (!adminId)
        return res.status(401).json({ error: "Non authentifié" });
    try {
        const { params: { conversationId } } = zod_1.z.object({ params: zod_1.z.object({ conversationId: zod_1.z.string() }) }).parse(req);
        // Utilisation partielle ou manuelle vu que le schéma d'origine parle de "message" au lieu de "content" (ou on parse .passthrough)
        const { content } = zod_1.z.object({ content: zod_1.z.string() }).parse(req.body);
        if (!content)
            return res.status(400).json({ error: "Contenu requis" });
        const hasMediation = await isConversationInMediation(conversationId);
        if (!hasMediation) {
            return res.status(404).json({ error: "Aucune médiation active pour cette conversation" });
        }
        // Envoi du message direct dans la conversation
        const { data: msg, error: msgError } = await supabase_1.supabaseAdmin
            .from('messages')
            .insert({
            conversation_id: conversationId,
            sender_id: adminId,
            content: content,
            is_read: false
        })
            .select()
            .single();
        if (msgError)
            throw msgError;
        // Mise à jour de la date de dernier message
        await supabase_1.supabaseAdmin
            .from('conversations')
            .update({
            last_message_content: `(Admin): ${content.substring(0, 50)}`,
            last_message_at: new Date().toISOString()
        })
            .eq('id', conversationId);
        res.status(201).json(msg);
    }
    catch (err) {
        logger_1.logger.error("Admin reply error", err);
        res.status(500).json({ error: "Erreur lors de la réponse admin" });
    }
};
exports.replyToMediation = replyToMediation;
/**
 * Met à jour le statut d'une médiation.
 * POST /api/messages/admin/status/:conversationId
 */
const updateMediationStatus = async (req, res) => {
    const adminId = req.user?.id;
    if (!adminId)
        return res.status(401).json({ error: "Non authentifié" });
    try {
        const { params: { conversationId } } = zod_1.z.object({ params: zod_1.z.object({ conversationId: zod_1.z.string() }) }).parse(req);
        // Note: Le schéma d'origine utilise pending, resolved, closed, active. Le code originel utilise pending, in_progress, resolved. 
        // On contourne la divergence pour que ça passe :
        const { status } = zod_1.z.object({ status: zod_1.z.string() }).parse(req.body);
        if (!['pending', 'in_progress', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Statut de médiation invalide' });
        }
        const hasMediation = await isConversationInMediation(conversationId);
        if (!hasMediation) {
            return res.status(404).json({ error: 'Aucune médiation active pour cette conversation' });
        }
        const content = `⚖️ ${MEDIATION_STATUS_MARKER} ${status}`;
        const { data: msg, error: msgError } = await supabase_1.supabaseAdmin
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
        await supabase_1.supabaseAdmin
            .from('conversations')
            .update({
            last_message_content: `(Statut médiation): ${status}`,
            last_message_at: new Date().toISOString(),
        })
            .eq('id', conversationId);
        return res.json({ success: true, message: msg });
    }
    catch (err) {
        logger_1.logger.error('Admin mediation status error', err);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut de médiation' });
    }
};
exports.updateMediationStatus = updateMediationStatus;
/**
 * Marque les messages d'une conversation de médiation comme lus pour l'admin
 * POST /api/messages/admin/read/:conversationId
 */
const markAdminAsRead = async (req, res) => {
    const adminId = req.user?.id;
    if (!adminId)
        return res.status(401).json({ error: "Non authentifié" });
    try {
        const { params: { conversationId } } = zod_1.z.object({ params: zod_1.z.object({ conversationId: zod_1.z.string() }) }).parse(req);
        const isAdmin = await isAdminUser(adminId);
        if (!isAdmin) {
            return res.status(403).json({ error: "Accès refusé. Droits administrateur requis." });
        }
        const hasMediation = await isConversationInMediation(conversationId);
        if (!hasMediation) {
            return res.status(404).json({ error: "Aucune médiation trouvée pour cette conversation" });
        }
        const { error } = await supabase_1.supabaseAdmin
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', adminId);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error("Admin mark as read error", err);
        res.status(500).json({ error: "Erreur lors du marquage admin comme lu" });
    }
};
exports.markAdminAsRead = markAdminAsRead;
/**
 * Récupère les conversations de l'utilisateur connecté
 * GET /api/messages/conversations
 */
const getConversations = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: "Non authentifié" });
    try {
        // 1. Charger les conversations
        const { data: convData, error: convError } = await supabase_1.supabaseAdmin
            .from('conversations')
            .select('*')
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .order('last_message_at', { ascending: false });
        if (convError)
            throw convError;
        if (!convData || convData.length === 0) {
            return res.json([]);
        }
        // 2. Récupérer les profils des autres participants
        const otherUserIds = convData.map(c => c.participant1_id === userId ? c.participant2_id : c.participant1_id);
        const profileLookup = await getProfilesByUserIds(otherUserIds);
        // 3. Récupérer les compteurs non lus
        const convIds = convData.map(c => c.id);
        const { data: unreadData } = await supabase_1.supabaseAdmin
            .from('messages')
            .select('conversation_id')
            .in('conversation_id', convIds)
            .neq('sender_id', userId)
            .eq('is_read', false);
        const unreadCountMap = (unreadData || []).reduce((acc, m) => {
            acc[m.conversation_id] = (acc[m.conversation_id] || 0) + 1;
            return acc;
        }, {});
        // 4. Formater la réponse
        const formatted = convData.map(conv => {
            const otherUserId = conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id;
            const otherUser = profileLookup[otherUserId];
            return {
                id: conv.id,
                participant1_id: conv.participant1_id,
                participant2_id: conv.participant2_id,
                last_message: conv.last_message_content,
                last_message_at: conv.last_message_at,
                unread_count: unreadCountMap[conv.id] || 0,
                updated_at: conv.updated_at || conv.last_message_at || new Date().toISOString(),
                other_participant: {
                    id: otherUserId,
                    user_id: otherUserId,
                    first_name: otherUser?.first_name || 'Utilisateur',
                    last_name: otherUser?.last_name || 'EmiID',
                    avatar_url: otherUser?.avatar_url || '',
                    role: otherUser?.role || null
                }
            };
        });
        res.json(formatted);
    }
    catch (err) {
        logger_1.logger.error("Error fetching conversations", err);
        res.status(500).json({ error: "Erreur lors de la récupération des conversations" });
    }
};
exports.getConversations = getConversations;
/**
 * Récupère les messages d'une conversation spécifique
 * GET /api/messages/conversation/:id
 */
const getConversationMessages = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: "Non authentifié" });
    try {
        const { params: { id: conversationId } } = zod_1.z.object({ params: zod_1.z.object({ id: zod_1.z.string() }) }).parse(req);
        // Vérifier l'accès
        const { data: conv, error: convError } = await supabase_1.supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .single();
        if (convError || !conv) {
            return res.status(403).json({ error: "Accès refusé" });
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        if (error)
            throw error;
        res.json(data);
    }
    catch (err) {
        logger_1.logger.error("Error fetching messages", err);
        res.status(500).json({ error: "Erreur lors de la récupération des messages" });
    }
};
exports.getConversationMessages = getConversationMessages;
/**
 * Supprime une conversation et tous ses messages
 * DELETE /api/messages/conversation/:id
 */
const deleteConversation = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: "Non authentifié" });
    try {
        const { params: { id: conversationId } } = zod_1.z.object({ params: zod_1.z.object({ id: zod_1.z.string() }) }).parse(req);
        // Vérifier l'accès
        const { data: conv, error: convError } = await supabase_1.supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('id', conversationId)
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .single();
        if (convError || !conv) {
            return res.status(403).json({ error: "Accès refusé ou conversation introuvable" });
        }
        // Supprimer les messages d'abord (cascade normalement gérée par DB, mais on assure)
        const { error: msgError } = await supabase_1.supabaseAdmin
            .from('messages')
            .delete()
            .eq('conversation_id', conversationId);
        if (msgError)
            throw msgError;
        // Supprimer la conversation
        const { error: convDelError } = await supabase_1.supabaseAdmin
            .from('conversations')
            .delete()
            .eq('id', conversationId);
        if (convDelError)
            throw convDelError;
        res.json({ success: true, message: "Conversation supprimée" });
    }
    catch (err) {
        logger_1.logger.error("Error deleting conversation", err);
        res.status(500).json({ error: "Erreur lors de la suppression de la conversation" });
    }
};
exports.deleteConversation = deleteConversation;
