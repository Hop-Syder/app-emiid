/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la messagerie
 * @created 2026-01-25
*/

import { Router } from 'express';
import {
  getAdminConversationMessages,
  getSupportUser,
  markAdminAsRead,
  requestMediation,
  getAdminDisputes,
  replyToMediation,
  updateMediationStatus,
  getConversations,
  getConversationMessages,
  deleteConversation,
  sendMessage,
  uploadMessageImage,
  upload,
} from '../../controllers/messageController';
import { requireAuth, requireAdmin } from '../../middlewares/authMiddleware';
import {
  replyMediationSchema,
  updateMediationStatusSchema,
  requestMediationSchema,
} from '../validations/messageValidations';

const router = Router();

// Toutes les routes ici nécessitent une authentification
router.use(requireAuth);

// @route   GET /api/messages/admin/disputes
// @desc    Liste des litiges pour l'administration
router.get('/admin/disputes', requireAdmin, getAdminDisputes);

// @route   POST /api/messages/admin/reply/:conversationId
// @desc    Réponse admin dans une médiation
router.post('/admin/reply/:conversationId', requireAdmin, replyToMediation);

// @route   POST /api/messages/admin/status/:conversationId
// @desc    Mettre à jour le statut d'une médiation
router.post('/admin/status/:conversationId', requireAdmin, updateMediationStatus);

// @route   GET /api/messages/admin/conversation/:id
// @desc    Récupérer les messages d'une conversation de médiation côté admin
router.get('/admin/conversation/:id', requireAdmin, getAdminConversationMessages);

// @route   POST /api/messages/admin/read/:conversationId
// @desc    Marquer les messages d'une conversation de médiation comme lus côté admin
router.post('/admin/read/:conversationId', requireAdmin, markAdminAsRead);

// @route   POST /api/messages/dispute/:conversationId
// @desc    Inviter l'Admin pour une médiation
router.post('/dispute/:conversationId', requestMediation);

// @route   GET /api/messages/support
// @desc    Récupérer le service client
router.get('/support', getSupportUser);

// @route   GET /api/messages/conversations
// @desc    Liste des conversations de l'utilisateur
router.get('/conversations', getConversations);

// @route   GET /api/messages/conversation/:id
// @desc    Liste des messages d'une conversation spécifique
router.get('/conversation/:id', getConversationMessages);

// @route   DELETE /api/messages/conversation/:id
// @desc    Supprimer une conversation
router.delete('/conversation/:id', deleteConversation);

// @route   POST /api/messages/send
// @desc    Envoyer un message texte ou emoji
router.post('/send', sendMessage);

// @route   POST /api/messages/upload/:conversationId
// @desc    Uploader une image et envoyer le message image (max 5 Mo, JPG/PNG/GIF/WEBP)
router.post('/upload/:conversationId', upload.single('image'), uploadMessageImage);

export default router;
