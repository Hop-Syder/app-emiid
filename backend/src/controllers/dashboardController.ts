/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour les statistiques globales du réseau EmiID affichées
 *   sur le dashboard utilisateur (connecté) et le dashboard public.
 *
 *   Contrat API (ne pas modifier sans aligner le frontend) :
 *     {
 *       totalEntrepreneurs: number,  // pros publiés dans le réseau
 *       verifiedMembers:    number,  // pros publiés + vérifiés
 *       countriesCovered:   number,  // pays distincts couverts par les pros publiés
 *       premiumMembers:     number,  // pros publiés + premium
 *     }
 */

import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

export interface DashboardStats {
  totalEntrepreneurs: number;
  verifiedMembers: number;
  countriesCovered: number;
  premiumMembers: number;
}

/**
 * Exécute en parallèle les 4 comptages nécessaires au dashboard.
 * Chaque requête échouée renvoie 0 (on n'empêche pas le dashboard de charger).
 */
async function computeNetworkStats(): Promise<DashboardStats> {
  const publishedFilter = (builder: any) => builder.eq('is_published', true);

  const [totalResult, verifiedResult, premiumResult, countriesResult] = await Promise.all([
    publishedFilter(
      supabaseAdmin.from('user_profiles').select('user_id', { count: 'exact', head: true }),
    ),
    publishedFilter(
      supabaseAdmin
        .from('user_profiles')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_verified', true),
    ),
    publishedFilter(
      supabaseAdmin
        .from('user_profiles')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_premium', true),
    ),
    publishedFilter(
      supabaseAdmin.from('user_profiles').select('country_id').not('country_id', 'is', null),
    ),
  ]);

  if (totalResult.error) {
    logger.error('[Dashboard] total count error', totalResult.error);
  }
  if (verifiedResult.error) {
    logger.error('[Dashboard] verified count error', verifiedResult.error);
  }
  if (premiumResult.error) {
    logger.error('[Dashboard] premium count error', premiumResult.error);
  }
  if (countriesResult.error) {
    logger.error('[Dashboard] countries query error', countriesResult.error);
  }

  // Les aggrégations DISTINCT ne sont pas exposées par PostgREST ; on déduit
  // côté JS à partir de la liste des country_id des profils publiés.
  const distinctCountries = new Set(
    ((countriesResult.data || []) as Array<{ country_id?: string | null }>)
      .map((row) => row.country_id)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  );

  return {
    totalEntrepreneurs: totalResult.count || 0,
    verifiedMembers: verifiedResult.count || 0,
    countriesCovered: distinctCountries.size,
    premiumMembers: premiumResult.count || 0,
  };
}

/**
 * GET /api/dashboard-user/stats  (authentifié)
 * GET /api/public/stats          (public)
 */
export const getDashboardStats = async (_req: any, res: Response) => {
  try {
    const stats = await computeNetworkStats();
    res.json(stats);
  } catch (err) {
    logger.error('[Dashboard] Critical error in getDashboardStats:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des statistiques' });
  }
};
