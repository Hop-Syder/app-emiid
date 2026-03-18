/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la messagerie
 * @created 2026-01-25
*/

import { Router } from 'express';
import { getMyConversations, getConversationMessages, sendMessage, getSupportUser } from '../../controllers/messageController';
import { requireAuth } from '../../middlewares/authMiddleware';

const router = Router();

// Toutes les routes ici nécessitent une authentification
router.use(requireAuth);

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

export default router;
