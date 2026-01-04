"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour le dashboard
 * @created 2026-01-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../../controllers/dashboardController");
const router = (0, express_1.Router)();
// Ces routes peuvent être publiques pour le dashboard "Discovery" 
// ou protégées si on veut des stats personnalisées. Ici on les laisse publiques pour l'instant.
router.get('/stats', dashboardController_1.getGlobalStats);
router.get('/featured-entrepreneurs', dashboardController_1.getFeaturedEntrepreneurs);
exports.default = router;
