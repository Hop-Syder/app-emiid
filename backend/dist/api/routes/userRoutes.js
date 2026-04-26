"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la gestion des utilisateurs
 * @created 2026-01-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/userController");
const followController_1 = require("../../controllers/followController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Toutes les routes ici nécessitent une authentification
router.use(authMiddleware_1.requireAuth);
// @route   GET /api/users/me
// @desc    Récupérer le profil connecté
router.get('/me', userController_1.getMyProfile);
// @route   PUT /api/users/me
// @desc    Mettre à jour le profil connecté
router.put('/me', userController_1.updateMyProfile);
// @route   PUT /api/users/settings
// @desc    Mettre à jour les paramètres du compte connecté
router.put('/settings', userController_1.updateMySettings);
// @route   POST /api/users/account/deactivate
// @desc    Désactiver temporairement le compte connecté
router.post('/account/deactivate', userController_1.deactivateMyAccount);
// @route   DELETE /api/users/account
// @desc    Supprimer définitivement le compte connecté
router.delete('/account', userController_1.deleteMyAccount);
// @route   POST /api/users/verify-pin
// @desc    Vérifier le code PIN
router.post('/verify-pin', rateLimiter_1.pinLimiter, userController_1.verifyPin);
// @route   GET /api/users/follows
// @desc    Récupérer les profils suivis
router.get('/follows', followController_1.getFollowedProfiles);
// @route   GET /api/users/followers
// @desc    Récupérer les profils des utilisateurs qui vous suivent
router.get('/followers', followController_1.getFollowers);
// @route   POST /api/users/follow/:id
// @desc    Suivre ou ne plus suivre un profil
router.post('/follow/:id', followController_1.toggleFollowProfile);
// @route   PUT /api/users/follow/:id/note
// @desc    Mettre à jour la note privée sur un utilisateur suivi
router.put('/follow/:id/note', followController_1.updateFollowNote);
// @route   POST /api/users/phone/request
// @desc    Demander un code OTP par WhatsApp ou SMS
router.post('/phone/request', rateLimiter_1.phoneVerificationLimiter, userController_1.requestPhoneVerification);
// @route   POST /api/users/phone/verify
// @desc    Vérifier le code OTP
router.post('/phone/verify', userController_1.verifyPhone);
// @route   POST /api/users/:id/unlock-pin
// @desc    Débloquer le PIN d'un utilisateur (Admin seulement)
router.post('/:id/unlock-pin', authMiddleware_1.requireAdmin, userController_1.unlockUserPin);
exports.default = router;
