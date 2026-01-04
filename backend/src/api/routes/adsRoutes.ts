/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la gestion des annonces
 * @created 2026-01-04
*/

import { Router } from 'express';
import { createAd, getMyAds, getAllAds } from '../../controllers/adsController';
import { requireAuth } from '../../middlewares/authMiddleware';

const router = Router();

// Route publique pour voir les annonces
router.get('/', getAllAds);

// Routes protégées
router.post('/', requireAuth, createAd);
router.get('/my-ads', requireAuth, getMyAds);

export default router;
