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
exports.manageParticipant = exports.leaveGroup = exports.getGroupMembers = exports.createGroup = exports.deleteConversation = exports.getConversationMessages = exports.getConversations = exports.markAdminAsRead = exports.updateMediationStatus = exports.replyToMediation = exports.requestMediation = exports.getSupportUser = exports.getAdminDisputes = exports.getAdminConversationMessages = exports.uploadMessageImage = exports.sendMessage = exports.upload = void 0;
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
    // SÉCURITÉ : autorisation basée sur la colonne dédiée `is_admin`, jamais sur
    // le libellé métier `role` (modifiable par l'utilisateur). Cf. authMiddleware.requireAdmin.
    const { data, error } = await supabase_1.supabaseAdmin
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', userId)
        .single();
    if (error || !data) {
        return false;
    }
    return data.is_admin === true;
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
// ─── Appartenance à une conversation ────────────────────────────────────────
// Vérifie via conversation_participants (compatible DM legacy — backfillés — ET
// groupes). Remplace l'ancien check .or(participant1/2_id) qui ne gère pas les groupes.
// NB: table récente non encore dans database.types.ts → cast until Étape 5 (regen types).
const isMember = async (conversationId, userId) => {
    const { data } = await supabase_1.supabaseAdmin.from('conversation_participants')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .eq('status', 'joined')
        .maybeSingle();
    return !!data;
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
        // Vérifier que l'utilisateur est bien membre (DM ou groupe)
        if (!(await isMember(conversation_id, userId))) {
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
        // Vérifier accès à la conversation (membre DM ou groupe)
        if (!(await isMember(conversationId, userId))) {
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
            .or('is_admin.eq.true,first_name.ilike.%service client%')
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
        // 1. Conversations où je suis membre (joined) — DM + groupes
        const { data: memberships, error: mErr } = await supabase_1.supabaseAdmin
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId)
            .eq('status', 'joined');
        if (mErr)
            throw mErr;
        const convIds = (memberships || []).map((m) => m.conversation_id);
        if (convIds.length === 0) {
            return res.json([]);
        }
        // 2. Charger ces conversations
        const { data: convData, error: convError } = await supabase_1.supabaseAdmin
            .from('conversations')
            .select('*')
            .in('id', convIds)
            .order('last_message_at', { ascending: false });
        if (convError)
            throw convError;
        const rows = (convData || []);
        // 3. Profils des autres membres (DM uniquement, dérivés de participant1/2 legacy)
        const otherUserIds = rows
            .filter(c => !c.is_group)
            .map(c => (c.participant1_id === userId ? c.participant2_id : c.participant1_id))
            .filter(Boolean);
        const profileLookup = await getProfilesByUserIds(otherUserIds);
        // 4. Compteurs non lus
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
        // 5. Formater : DM → other_participant (rétro-compatible) ; groupe → infos du groupe
        const formatted = rows.map((conv) => {
            const base = {
                id: conv.id,
                is_group: !!conv.is_group,
                last_message: conv.last_message_content,
                last_message_at: conv.last_message_at,
                unread_count: unreadCountMap[conv.id] || 0,
                updated_at: conv.updated_at || conv.last_message_at || new Date().toISOString(),
            };
            if (conv.is_group) {
                return {
                    ...base,
                    name: conv.name,
                    avatar_url: conv.avatar_url,
                    is_community: !!conv.is_community,
                    member_count: conv.member_count ?? 0,
                    // Compat rendu : le frontend affiche other_participant (name/avatar).
                    // Un groupe est présenté comme un pseudo-interlocuteur (nom + avatar du groupe).
                    other_participant: {
                        id: conv.id,
                        user_id: '',
                        first_name: conv.name || 'Groupe',
                        last_name: '',
                        avatar_url: conv.avatar_url || '',
                        role: null,
                    },
                };
            }
            const otherUserId = conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id;
            const otherUser = profileLookup[otherUserId];
            return {
                ...base,
                participant1_id: conv.participant1_id,
                participant2_id: conv.participant2_id,
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
        // Vérifier l'accès (membre DM ou groupe)
        if (!(await isMember(conversationId, userId))) {
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
        // Vérifier l'accès (membre)
        if (!(await isMember(conversationId, userId))) {
            return res.status(403).json({ error: "Accès refusé ou conversation introuvable" });
        }
        // Garde-fou groupe : seul le propriétaire peut supprimer un salon de groupe
        // (un simple membre doit « quitter », pas détruire le groupe pour tous).
        const { data: convMeta } = await supabase_1.supabaseAdmin
            .from('conversations').select('is_group').eq('id', conversationId).maybeSingle();
        if (convMeta?.is_group) {
            const { data: myPart } = await supabase_1.supabaseAdmin.from('conversation_participants')
                .select('role').eq('conversation_id', conversationId).eq('user_id', userId).maybeSingle();
            if (myPart?.role !== 'owner') {
                return res.status(403).json({ error: "Seul le propriétaire peut supprimer ce groupe. Vous pouvez le quitter." });
            }
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
// ═══════════════════ GROUPES DE DISCUSSION (Étape 3) ═══════════════════════
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'groupe';
/**
 * Crée un groupe de discussion. Le créateur devient 'owner'.
 * POST /api/messages/groups
 */
const createGroup = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Non authentifié' });
    try {
        const { body } = zod_1.z.object({
            body: zod_1.z.object({
                name: zod_1.z.string().trim().min(2).max(80),
                avatar_url: zod_1.z.string().url().nullable().optional(),
                is_community: zod_1.z.boolean().optional(),
                join_policy: zod_1.z.enum(['invite', 'request', 'open']).optional(),
                badge_style: zod_1.z.string().nullable().optional(),
                member_ids: zod_1.z.array(zod_1.z.string().uuid()).max(200).optional(),
            }),
        }).parse(req);
        const isCommunity = !!body.is_community;
        const slug = isCommunity ? `${slugify(body.name)}-${Math.random().toString(36).slice(2, 7)}` : null;
        const { data: conv, error: convErr } = await supabase_1.supabaseAdmin
            .from('conversations')
            .insert({
            is_group: true,
            name: body.name,
            avatar_url: body.avatar_url || null,
            created_by: userId,
            is_community: isCommunity,
            join_policy: body.join_policy || 'invite',
            badge_style: body.badge_style || null,
            slug,
        })
            .select('id, slug')
            .single();
        if (convErr)
            throw convErr;
        const now = new Date().toISOString();
        const rows = [{ conversation_id: conv.id, user_id: userId, role: 'owner', status: 'joined', joined_at: now }];
        for (const mid of (body.member_ids || [])) {
            if (mid && mid !== userId) {
                rows.push({ conversation_id: conv.id, user_id: mid, role: 'member', status: 'joined', joined_at: now, invited_by: userId });
            }
        }
        const { error: partErr } = await supabase_1.supabaseAdmin.from('conversation_participants').insert(rows);
        if (partErr)
            throw partErr;
        return res.status(201).json({ id: conv.id, slug: conv.slug });
    }
    catch (err) {
        logger_1.logger.error('Error creating group', err);
        return res.status(500).json({ error: 'Erreur lors de la création du groupe' });
    }
};
exports.createGroup = createGroup;
/**
 * Liste des membres d'un groupe (réservé aux membres).
 * GET /api/messages/groups/:id/members
 */
const getGroupMembers = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Non authentifié' });
    try {
        const id = String(req.params.id);
        if (!(await isMember(id, userId))) {
            return res.status(403).json({ error: 'Accès refusé' });
        }
        const { data: parts } = await supabase_1.supabaseAdmin.from('conversation_participants')
            .select('user_id, role, status, joined_at')
            .eq('conversation_id', id)
            .neq('status', 'left')
            .order('role', { ascending: true });
        const profiles = await getProfilesByUserIds((parts || []).map((p) => p.user_id));
        const members = (parts || []).map((p) => ({
            user_id: p.user_id,
            role: p.role,
            status: p.status,
            joined_at: p.joined_at,
            profile: profiles[p.user_id] || null,
        }));
        return res.json(members);
    }
    catch (err) {
        logger_1.logger.error('Error fetching group members', err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
    }
};
exports.getGroupMembers = getGroupMembers;
/**
 * Quitter un groupe (status → 'left'). L'owner doit d'abord transférer ou supprimer.
 * POST /api/messages/groups/:id/leave
 */
const leaveGroup = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Non authentifié' });
    try {
        const id = String(req.params.id);
        const { data: me } = await supabase_1.supabaseAdmin.from('conversation_participants')
            .select('role').eq('conversation_id', id).eq('user_id', userId).maybeSingle();
        if (!me)
            return res.status(404).json({ error: 'Vous n\'êtes pas membre de ce groupe' });
        if (me.role === 'owner') {
            return res.status(400).json({ error: 'Le propriétaire doit transférer le groupe ou le supprimer.' });
        }
        await supabase_1.supabaseAdmin.from('conversation_participants')
            .update({ status: 'left' }).eq('conversation_id', id).eq('user_id', userId);
        return res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Error leaving group', err);
        return res.status(500).json({ error: 'Erreur lors de la sortie du groupe' });
    }
};
exports.leaveGroup = leaveGroup;
/**
 * Actions admin sur un participant : accept | remove | ban | promote | demote.
 * POST /api/messages/groups/:id/participant
 */
const manageParticipant = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Non authentifié' });
    try {
        const id = String(req.params.id);
        const { body } = zod_1.z.object({
            body: zod_1.z.object({
                user_id: zod_1.z.string().uuid(),
                action: zod_1.z.enum(['accept', 'remove', 'ban', 'promote', 'demote']),
            }),
        }).parse(req);
        // Vérifier que l'appelant est admin/owner du groupe
        const { data: caller } = await supabase_1.supabaseAdmin.from('conversation_participants')
            .select('role').eq('conversation_id', id).eq('user_id', userId).eq('status', 'joined').maybeSingle();
        if (!caller || !['owner', 'admin'].includes(caller.role)) {
            return res.status(403).json({ error: 'Action réservée aux administrateurs du groupe' });
        }
        if (body.user_id === userId) {
            return res.status(400).json({ error: 'Action impossible sur soi-même' });
        }
        const patch = {};
        if (body.action === 'accept') {
            patch.status = 'joined';
            patch.joined_at = new Date().toISOString();
        }
        else if (body.action === 'remove')
            patch.status = 'left';
        else if (body.action === 'ban')
            patch.status = 'banned';
        else if (body.action === 'promote')
            patch.role = 'admin';
        else if (body.action === 'demote')
            patch.role = 'member';
        await supabase_1.supabaseAdmin.from('conversation_participants')
            .update(patch).eq('conversation_id', id).eq('user_id', body.user_id);
        return res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Error managing participant', err);
        return res.status(500).json({ error: 'Erreur lors de la gestion du participant' });
    }
};
exports.manageParticipant = manageParticipant;
