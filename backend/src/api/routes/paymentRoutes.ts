/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes de paiement (checkout d'abonnement Pro). Le webhook est
 *              monté séparément dans app.ts (raw body requis pour la signature).
 * @created 2026-08-23
 */

import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware'
import { createCheckout, createBoostCheckout } from '../../controllers/paymentController'

const router = Router()

// Initialisation d'un paiement d'abonnement Pro (authentifié).
router.post('/checkout', requireAuth, createCheckout)

// Initialisation d'un paiement de boost communal (authentifié).
router.post('/boost/checkout', requireAuth, createBoostCheckout)

export default router
