/**
 * @description Routes d'administration (droits admin requis).
 */

import { Router } from 'express';
import { broadcastEmailCampaign } from '../../controllers/adminController';
import { requireAuth, requireAdmin } from '../../middlewares/authMiddleware';
import { campaignLimiter } from '../../middlewares/rateLimiter';

const router = Router();

router.use(requireAuth, requireAdmin);

// @route   POST /api/admin/broadcast-email
// @desc    Envoyer une campagne email à un segment (opt-in newsletter uniquement)
router.post('/broadcast-email', campaignLimiter, broadcastEmailCampaign);

export default router;
