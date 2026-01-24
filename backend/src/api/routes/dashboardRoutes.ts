/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour le dashboard-user
 * @created 2026-01-04
*/

import { Router } from 'express';
import { getGlobalStats, getFeaturedEntrepreneurs } from '../../controllers/dashboardController';

const router = Router();

// Ces routes peuvent être publiques pour le dashboard-user "Discovery" 
// ou protégées si on veut des stats personnalisées. Ici on les laisse publiques pour l'instant.

router.get('/stats', getGlobalStats);
router.get('/featured-entrepreneurs', getFeaturedEntrepreneurs);

export default router;
