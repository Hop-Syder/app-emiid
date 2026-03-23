/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la messagerie
 * @created 2026-01-25
*/

import { Router } from 'express';
import { getMyConversations, getConversationMessages, sendMessage, getSupportUser, markAsRead, requestMediation, getAdminDisputes, replyToMediation } from '../../controllers/messageController';
import { requireAuth, requireAdmin } from '../../middlewares/authMiddleware';

const router = Router();

// Toutes les routes ici nécessitent une authentification
router.use(requireAuth);

// @route   GET /api/messages/admin/disputes
// @desc    Liste des litiges pour l'administration
router.get('/admin/disputes', requireAdmin, getAdminDisputes);

// @route   POST /api/messages/admin/reply/:conversationId
// @desc    Réponse admin dans une médiation
router.post('/admin/reply/:conversationId', requireAdmin, replyToMediation);

// @route   POST /api/messages/dispute/:conversationId
// @desc    Inviter l'Admin pour une médiation
router.post('/dispute/:conversationId', requestMediation);

// @route   GET /api/messages/conversations
// @desc    Récupérer les conversations de l'utilisateur
router.get('/conversations', getMyConversations);

// @route   GET /api/messages/conversation/:id
// @desc    Récupérer les messages d'une conversation
router.get('/conversation/:id', getConversationMessages);

// @route   POST /api/messages/send
// @desc    Envoyer un message
router.post('/send', sendMessage);

// @route   GET /api/messages/support
// @desc    Récupérer le service client
router.get('/support', getSupportUser);

// @route   POST /api/messages/read/:conversationId
// @desc    Marquer les messages comme lus
router.post('/read/:conversationId', markAsRead);

export default router;
