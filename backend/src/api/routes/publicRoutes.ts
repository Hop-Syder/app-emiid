/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes publiques accessibles sans authentification
 * @created 2026-01-24
 * 🌐 ceo.nexuspartners.xyz
 */

import { Router, Request, Response } from 'express';
import { getPublicProfiles } from '../../controllers/userController';
import { getPublicStats } from '../../controllers/dashboardController';

const router = Router();

// @route   GET /api/public/profiles
// @desc    Récupérer tous les profils publiés
router.get('/profiles', (req: any, res: Response) => getPublicProfiles(req, res));

// @route   GET /api/public/stats
// @desc    Récupérer les statistiques globales publiques
router.get('/stats', (req: any, res: Response) => getPublicStats(req, res));

export default router;
