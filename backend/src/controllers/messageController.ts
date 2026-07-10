/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la messagerie entre membres EmiID
 * @created 2026-01-25
*/

import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';
import { UserProfile, DBConversation, DBMessage } from '../types/models';
import { z } from 'zod';
import { replyMediationSchema, updateMediationStatusSchema, requestMediationSchema, sendMessageSchema, sendImageMessageSchema, imageUploadSchema } from '../api/validations/messageValidations';
import multer from 'multer';

const MEDIATION_REQUEST_MARKER = '[MÉDIATION DEMANDÉE]';
const MEDIATION_STATUS_MARKER = '[MÉDIATION STATUT]';

const formatParticipantName = (profile: UserProfile | undefined) => {
  if (!profile) {
    return 'Utilisateur EmiID';
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return fullName || 'Utilisateur EmiID';
};

const buildProfileLookup = (profiles: any[] = []) =>
  profiles.reduce<Record<string, any>>((acc, profile) => {
    acc[profile.user_id] = profile;
    return acc;
  }, {});

const getProfilesByUserIds = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return {} as Record<string, UserProfile>;
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
  // SÉCURITÉ : autorisation basée sur la colonne dédiée `is_admin`, jamais sur
  // le libellé métier `role` (modifiable par l'utilisateur). Cf. authMiddleware.requireAdmin.
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.is_admin === true;
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
  conv: DBConversation,
  userId: string,
  unreadCount: number,
  profileLookup: Record<string, UserProfile>,
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





// ─── Appartenance à une conversation ────────────────────────────────────────
// Vérifie via conversation_participants (compatible DM legacy — backfillés — ET
// groupes). Remplace l'ancien check .or(participant1/2_id) qui ne gère pas les groupes.
// NB: table récente non encore dans database.types.ts → cast until Étape 5 (regen types).
const isMember = async (conversationId: string, userId: string): Promise<boolean> => {
  const { data } = await (supabaseAdmin.from('conversation_participants' as never) as any)
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .eq('status', 'joined')
    .maybeSingle();
  return !!data;
};

// ─── Stockage en mémoire pour multer (images) ────────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 Mo
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez JPG, PNG, GIF ou WEBP.'));
    }
  },
});

// ─── Envoi de messages ────────────────────────────────────────────────────────

/**
 * Envoie un message texte ou emoji dans une conversation
 * POST /api/messages/send
 */
export const sendMessage = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Non authentifié' });

  try {
    const { body: { conversation_id, content, message_type } } = sendMessageSchema.parse(req);

    // Vérifier que l'utilisateur est bien membre (DM ou groupe)
    if (!(await isMember(conversation_id, userId))) {
      return res.status(403).json({ error: 'Accès refusé à cette conversation' });
    }

    // Insérer le message
    const { data: message, error: msgError } = await supabaseAdmin
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

    if (msgError) throw msgError;

    // Mettre à jour le dernier message de la conversation
    const preview = message_type === 'emoji' ? content : content.substring(0, 60);
    await supabaseAdmin
      .from('conversations')
      .update({
        last_message_content: preview,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation_id);

    return res.status(201).json(message);
  } catch (err) {
    logger.error('Send message error', err);
    return res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
};

/**
 * Upload une image vers Supabase Storage et envoie le message image
 * POST /api/messages/upload/:conversationId
 */
export const uploadMessageImage = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Non authentifié' });

  try {
    const { params: { conversationId } } = imageUploadSchema.parse(req);

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
    const { error: uploadError } = await supabaseAdmin.storage
      .from('messages')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Récupérer l'URL signée (valide 7 jours)
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from('messages')
      .createSignedUrl(fileName, 60 * 60 * 24 * 7);

    if (signedError || !signedData?.signedUrl) throw signedError;

    // Insérer le message image
    const { data: message, error: msgError } = await supabaseAdmin
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

    if (msgError) throw msgError;

    // Mettre à jour la conversation
    await supabaseAdmin
      .from('conversations')
      .update({
        last_message_content: '📷 Image',
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return res.status(201).json(message);
  } catch (err) {
    logger.error('Upload image error', err);
    return res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
};

/**
 * Récupère les messages d'une conversation de médiation pour l'admin
 * GET /api/messages/admin/conversation/:id
 */
export const getAdminConversationMessages = async (req: Request, res: Response) => {
    try {
        const { params: { id: conversationId } } = z.object({ params: z.object({ id: z.string() }) }).parse(req);
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
export const getAdminDisputes = async (req: Request, res: Response) => {
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
export const getSupportUser = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });
    try {
        // On cherche le premier admin ou un compte nommé Service Client
        const { data, error } = await supabaseAdmin
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
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération du support" });
    }
};

/**
 * Demande une médiation pour une conversation
 * POST /api/messages/dispute/:conversationId
 */
export const requestMediation = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    try {
        const { params: { conversationId } } = z.object({ params: z.object({ conversationId: z.string() }) }).parse(req);
        const { body: { reason } } = requestMediationSchema.parse(req);
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
export const replyToMediation = async (req: Request, res: Response) => {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ error: "Non authentifié" });

    try {
        const { params: { conversationId } } = z.object({ params: z.object({ conversationId: z.string() }) }).parse(req);
        // Utilisation partielle ou manuelle vu que le schéma d'origine parle de "message" au lieu de "content" (ou on parse .passthrough)
        const { content } = z.object({ content: z.string() }).parse(req.body);

        if (!content) return res.status(400).json({ error: "Contenu requis" });
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
export const updateMediationStatus = async (req: Request, res: Response) => {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ error: "Non authentifié" });

    try {
        const { params: { conversationId } } = z.object({ params: z.object({ conversationId: z.string() }) }).parse(req);
        // Note: Le schéma d'origine utilise pending, resolved, closed, active. Le code originel utilise pending, in_progress, resolved. 
        // On contourne la divergence pour que ça passe :
        const { status } = z.object({ status: z.string() }).parse(req.body);

        if (!['pending', 'in_progress', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Statut de médiation invalide' });
        }
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
export const markAdminAsRead = async (req: Request, res: Response) => {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ error: "Non authentifié" });

    try {
        const { params: { conversationId } } = z.object({ params: z.object({ conversationId: z.string() }) }).parse(req);
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

/**
 * Récupère les conversations de l'utilisateur connecté
 * GET /api/messages/conversations
 */
export const getConversations = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    try {
        // 1. Conversations où je suis membre (joined) — DM + groupes
        const { data: memberships, error: mErr } = await (supabaseAdmin
            .from('conversation_participants' as never) as any)
            .select('conversation_id')
            .eq('user_id', userId)
            .eq('status', 'joined');

        if (mErr) throw mErr;

        const convIds = (memberships || []).map((m: any) => m.conversation_id);
        if (convIds.length === 0) {
            return res.json([]);
        }

        // 2. Charger ces conversations
        const { data: convData, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('*')
            .in('id', convIds)
            .order('last_message_at', { ascending: false });

        if (convError) throw convError;

        const rows = (convData || []) as any[];

        // 3. Profils des autres membres (DM uniquement, dérivés de participant1/2 legacy)
        const otherUserIds = rows
            .filter(c => !c.is_group)
            .map(c => (c.participant1_id === userId ? c.participant2_id : c.participant1_id))
            .filter(Boolean);
        const profileLookup = await getProfilesByUserIds(otherUserIds);

        // 4. Compteurs non lus
        const { data: unreadData } = await supabaseAdmin
            .from('messages')
            .select('conversation_id')
            .in('conversation_id', convIds)
            .neq('sender_id', userId)
            .eq('is_read', false);

        const unreadCountMap = (unreadData || []).reduce((acc: Record<string, number>, m: any) => {
            acc[m.conversation_id] = (acc[m.conversation_id] || 0) + 1;
            return acc;
        }, {});

        // 5. Formater : DM → other_participant (rétro-compatible) ; groupe → infos du groupe
        const formatted = rows.map((conv: any) => {
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
    } catch (err) {
        logger.error("Error fetching conversations", err);
        res.status(500).json({ error: "Erreur lors de la récupération des conversations" });
    }
};

/**
 * Récupère les messages d'une conversation spécifique
 * GET /api/messages/conversation/:id
 */
export const getConversationMessages = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    try {
        const { params: { id: conversationId } } = z.object({ params: z.object({ id: z.string() }) }).parse(req);
        // Vérifier l'accès (membre DM ou groupe)
        if (!(await isMember(conversationId, userId))) {
            return res.status(403).json({ error: "Accès refusé" });
        }

        const { data, error } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        logger.error("Error fetching messages", err);
        res.status(500).json({ error: "Erreur lors de la récupération des messages" });
    }
};

/**
 * Supprime une conversation et tous ses messages
 * DELETE /api/messages/conversation/:id
 */
export const deleteConversation = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    try {
        const { params: { id: conversationId } } = z.object({ params: z.object({ id: z.string() }) }).parse(req);
        // Vérifier l'accès (membre)
        if (!(await isMember(conversationId, userId))) {
            return res.status(403).json({ error: "Accès refusé ou conversation introuvable" });
        }

        // Garde-fou groupe : seul le propriétaire peut supprimer un salon de groupe
        // (un simple membre doit « quitter », pas détruire le groupe pour tous).
        const { data: convMeta } = await (supabaseAdmin
            .from('conversations').select('is_group').eq('id', conversationId).maybeSingle() as any);
        if (convMeta?.is_group) {
            const { data: myPart } = await (supabaseAdmin.from('conversation_participants' as never) as any)
                .select('role').eq('conversation_id', conversationId).eq('user_id', userId).maybeSingle();
            if (myPart?.role !== 'owner') {
                return res.status(403).json({ error: "Seul le propriétaire peut supprimer ce groupe. Vous pouvez le quitter." });
            }
        }

        // Supprimer les messages d'abord (cascade normalement gérée par DB, mais on assure)
        const { error: msgError } = await supabaseAdmin
            .from('messages')
            .delete()
            .eq('conversation_id', conversationId);

        if (msgError) throw msgError;

        // Supprimer la conversation
        const { error: convDelError } = await supabaseAdmin
            .from('conversations')
            .delete()
            .eq('id', conversationId);

        if (convDelError) throw convDelError;

        res.json({ success: true, message: "Conversation supprimée" });
    } catch (err) {
        logger.error("Error deleting conversation", err);
        res.status(500).json({ error: "Erreur lors de la suppression de la conversation" });
    }
};
