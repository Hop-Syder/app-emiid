/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour les webhooks (venant de Supabase)
 * @created 2026-04-17
 */

import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';

const router = Router();

// Middleware optionnel pour vérifier un token secret webhook
// const verifyWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
//   const secret = req.headers['x-webhook-secret'];
//   if (secret !== process.env.WEBHOOK_SECRET) return res.status(401).send('Unauthorized');
//   next();
// };

// @route   POST /api/webhooks/supabase
// @desc    Reçoit les événements de la DB Supabase
router.post('/supabase', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    logger.info('Webhook reçu depuis Supabase', { type: payload.type, table: payload.table });
    
    // TODO: Traiter l'événement (ex: envoi d'email, mise à jour stats, etc.)
    
    res.status(200).json({ success: true });
  } catch (err) {
    logger.error('Erreur webhook supabase', err);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

export default router;
