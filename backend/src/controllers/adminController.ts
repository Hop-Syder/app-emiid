/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur des opérations d'administration (campagnes email)
 * @created 2026-07-12
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';
import { sendCampaignEmail } from '../services/mailService';

const broadcastEmailSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(120),
    content: z.string().trim().min(1).max(5000),
    segment: z.enum(['all', 'published', 'verified', 'premium', 'suspended']),
    link: z.string().trim().max(500).optional(),
  }),
});

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

/**
 * Envoie une campagne email au segment choisi.
 * SÉCURITÉ / CONFORMITÉ : opt-in strict — seuls les utilisateurs ayant activé
 * la newsletter (notification_preferences.email_enabled = true) sont contactés.
 * POST /api/admin/broadcast-email
 */
export const broadcastEmailCampaign = async (req: Request, res: Response) => {
  try {
    const { body: { title, content, segment, link } } = broadcastEmailSchema.parse(req);

    // 1. Résolution du segment → profils (mêmes filtres que l'annonce in-app).
    let query = supabaseAdmin.from('user_profiles').select('user_id, email');
    if (segment === 'published') query = query.eq('is_published', true);
    else if (segment === 'premium') query = query.eq('is_premium', true);
    else if (segment === 'verified') query = query.eq('is_verified', true);
    // NB: is_suspended absent des types générés (regen nécessaire) → cast temporaire.
    else if (segment === 'suspended') query = query.eq('is_suspended' as 'is_admin', true);

    const { data: profiles, error: profilesError } = await query;
    if (profilesError) {
      logger.error('broadcastEmailCampaign: erreur résolution segment', profilesError);
      return res.status(400).json({ error: 'Impossible de résoudre le segment de destinataires' });
    }

    const candidates = (profiles || []).filter((p) => !!p.user_id);
    if (candidates.length === 0) {
      return res.status(400).json({ error: 'Aucun destinataire pour ce segment' });
    }

    // 2. Filtre opt-in newsletter (email_enabled), par lots pour éviter les URLs trop longues.
    const optedInIds = new Set<string>();
    for (const ids of chunk(candidates.map((p) => p.user_id as string), 500)) {
      const { data: prefs, error: prefsError } = await supabaseAdmin
        .from('notification_preferences')
        .select('user_id')
        .eq('email_enabled', true)
        .in('user_id', ids);

      if (prefsError) {
        logger.error('broadcastEmailCampaign: erreur lecture préférences', prefsError);
        return res.status(400).json({ error: 'Impossible de vérifier les préférences email' });
      }
      for (const p of prefs || []) optedInIds.add(p.user_id as string);
    }

    const recipients = candidates.filter((p) => optedInIds.has(p.user_id as string) && !!p.email);
    const skipped = candidates.length - recipients.length;

    if (recipients.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        failed: 0,
        skipped,
        message: 'Aucun destinataire abonné à la newsletter dans ce segment',
      });
    }

    // 3. Envoi avec concurrence limitée pour ménager le serveur SMTP.
    const CONCURRENCY = 5;
    let sent = 0;
    let failed = 0;
    for (const batch of chunk(recipients, CONCURRENCY)) {
      const results = await Promise.allSettled(
        batch.map((r) => sendCampaignEmail(r.email as string, title, content, link)),
      );
      for (const result of results) {
        if (result.status === 'fulfilled') sent += 1;
        else failed += 1;
      }
    }

    const adminId = req.user?.id;
    logger.info(
      `[CAMPAGNE EMAIL] admin=${adminId} segment=${segment} envoyés=${sent} échecs=${failed} ignorés(opt-out)=${skipped}`,
    );

    return res.json({ success: true, sent, failed, skipped });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données de campagne invalides' });
    }
    logger.error('broadcastEmailCampaign: erreur serveur', err);
    return res.status(500).json({ error: "Erreur lors de l'envoi de la campagne email" });
  }
};
