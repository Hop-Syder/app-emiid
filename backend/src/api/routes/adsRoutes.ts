/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la gestion des annonces
 * @created 2026-01-04
*/

import { Router } from 'express'
import { createAd, getAllAds, getMyAds } from '../../controllers/adsController'
import { requireAuth } from '../../middlewares/authMiddleware'

const router = Router()

router.get('/', getAllAds)
router.post('/', requireAuth, createAd)
router.get('/my-ads', requireAuth, getMyAds)

export default router
