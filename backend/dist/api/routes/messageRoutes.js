"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la messagerie
 * @created 2026-01-25
*/
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../../controllers/messageController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Toutes les routes ici nécessitent une authentification
router.use(authMiddleware_1.requireAuth);
// @route   GET /api/messages/conversations
// @desc    Récupérer les conversations de l'utilisateur
router.get('/conversations', messageController_1.getMyConversations);
// @route   GET /api/messages/conversation/:id
// @desc    Récupérer les messages d'une conversation
router.get('/conversation/:id', messageController_1.getConversationMessages);
// @route   POST /api/messages/send
// @desc    Envoyer un message
router.post('/send', messageController_1.sendMessage);
// @route   GET /api/messages/support
// @desc    Récupérer le service client
router.get('/support', messageController_1.getSupportUser);
// @route   POST /api/messages/read/:conversationId
// @desc    Marquer les messages comme lus
router.post('/read/:conversationId', messageController_1.markAsRead);
exports.default = router;
