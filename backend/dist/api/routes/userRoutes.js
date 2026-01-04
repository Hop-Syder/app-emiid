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
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Toutes les routes ici nécessitent une authentification
router.use(authMiddleware_1.requireAuth);
// @route   GET /api/users/me
// @desc    Récupérer le profil connecté
router.get('/me', userController_1.getMyProfile);
// @route   PUT /api/users/me
// @desc    Mettre à jour le profil connecté
router.put('/me', userController_1.updateMyProfile);
// @route   GET /api/users
// @desc    Récupérer tous les profils (Artisans, Freelances, etc)
router.get('/', userController_1.getAllUsers);
exports.default = router;
