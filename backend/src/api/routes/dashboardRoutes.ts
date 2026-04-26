/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour le dashboard utilisateur
 * @created 2026-04-26
 */

import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Toutes les routes du dashboard nécessitent une authentification
router.use(requireAuth);

// @route   GET /api/dashboard-user/stats
// @desc    Récupérer les statistiques du dashboard utilisateur
router.get('/stats', getDashboardStats);

export default router;
