/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes admin — mailing en masse (protégé requireAuth + requireAdmin).
 * @created 2026-07-12
 */

import { Router } from 'express';
import { sendBulkMail } from '../../controllers/adminMailController';
import { requireAuth, requireAdmin } from '../../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

// @route POST /api/admin/mailing   Envoi d'un mailing en masse
router.post('/mailing', requireAdmin, sendBulkMail);

export default router;
