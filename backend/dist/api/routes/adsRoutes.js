"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la gestion des annonces
 * @created 2026-01-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adsController_1 = require("../../controllers/adsController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Route publique pour voir les annonces
router.get('/', adsController_1.getAllAds);
// Routes protégées
router.post('/', authMiddleware_1.requireAuth, adsController_1.createAd);
router.get('/my-ads', authMiddleware_1.requireAuth, adsController_1.getMyAds);
exports.default = router;
