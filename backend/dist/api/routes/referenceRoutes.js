"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour les données de référence
 * @created 2026-01-05
*/
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const referenceController_1 = require("../../controllers/referenceController");
const router = (0, express_1.Router)();
// Routes publiques pour récupérer les listes
router.get('/sectors', referenceController_1.getSectors);
router.get('/professions', referenceController_1.getProfessions);
router.get('/countries', referenceController_1.getCountries);
exports.default = router;
