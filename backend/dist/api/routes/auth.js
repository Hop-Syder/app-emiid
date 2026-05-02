"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../../controllers/authController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const validate_1 = require("../../middlewares/validate");
const authSchemas_1 = require("../schemas/authSchemas");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur
// @access  Public
router.post('/register', rateLimiter_1.authLimiter, (0, validate_1.validateBody)(authSchemas_1.parseRegisterUserBody), (0, asyncHandler_1.asyncHandler)(authController_1.registerUser));
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
