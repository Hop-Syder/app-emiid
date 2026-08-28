/**
 * @description Routes publiques (sans authentification).
 * Exposent les stats globales du réseau pour le dashboard public.
 */

import { Router } from 'express';
import { getDashboardStats } from '../../controllers/dashboardController';

const router = Router();

// @route   GET /api/public/stats
// @desc    Stats globales du réseau (accessible sans authentification)
router.get('/stats', getDashboardStats);

export default router;
