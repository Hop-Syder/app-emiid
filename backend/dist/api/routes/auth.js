"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../../controllers/authController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur
// @access  Public (rate-limité : anti-abus / énumération)
router.post('/register', rateLimiter_1.authLimiter, authController_1.registerUser);
// @route   GET /api/auth/me
// @desc    Récupérer les infos de l'utilisateur connecté (Test Relay)
// @access  Private
router.get('/me', authMiddleware_1.requireAuth, (req, res) => {
    res.json({
        message: "Authentification réussie !",
        user: req.user
    });
});
exports.default = router;
