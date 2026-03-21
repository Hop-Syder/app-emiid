"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes publiques accessibles sans authentification
 * @created 2026-01-24
 * 🌐 ceo.nexuspartners.xyz
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/userController");
const dashboardController_1 = require("../../controllers/dashboardController");
const router = (0, express_1.Router)();
// @route   GET /api/public/profiles
// @desc    Récupérer tous les profils publiés
router.get('/profiles', (req, res) => (0, userController_1.getPublicProfiles)(req, res));
// @route   GET /api/public/profiles/:id
// @desc    Récupérer un profil spécifique
router.get('/profiles/:id', (req, res) => (0, userController_1.getPublicProfileById)(req, res));
// @route   GET /api/public/stats
// @desc    Récupérer les statistiques globales publiques
router.get('/stats', (req, res) => (0, dashboardController_1.getPublicStats)(req, res));
exports.default = router;
