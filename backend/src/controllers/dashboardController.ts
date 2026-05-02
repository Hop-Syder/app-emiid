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
 *
 *   Implémentation :
 *   - Chemin rapide : RPC Postgres `get_network_stats()` (1 seul appel DB,
 *     agrégation native avec FILTER — cf. `sql/migrations/create_get_network_stats.sql`).
 *   - Chemin de secours : 4 requêtes PostgREST en parallèle — utilisé tant que
 *     la migration n'est pas appliquée ou si la RPC renvoie une erreur.
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

const EMPTY_STATS: DashboardStats = {
  totalEntrepreneurs: 0,
  verifiedMembers: 0,
  countriesCovered: 0,
  premiumMembers: 0,
};

/**
 * Tente d'utiliser la RPC `get_network_stats()` (optimale).
 * Renvoie `null` si la fonction n'existe pas encore ou échoue.
 */
async function fetchStatsViaRpc(): Promise<DashboardStats | null> {
  const { data, error } = await supabaseAdmin.rpc('get_network_stats');

  if (error) {
    // Code 42883 = "function does not exist" → migration pas appliquée.
    // On ne bruite pas les logs à chaque requête dans ce cas connu.
    const isMissingFunction =
      error.code === '42883' ||
      (typeof error.message === 'string' && error.message.includes('get_network_stats'));

    if (!isMissingFunction) {
      logger.warn('[Dashboard] RPC get_network_stats en erreur, fallback', error);
    }
    return null;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as Partial<DashboardStats>;
  return {
    totalEntrepreneurs: Number(payload.totalEntrepreneurs) || 0,
    verifiedMembers: Number(payload.verifiedMembers) || 0,
    countriesCovered: Number(payload.countriesCovered) || 0,
    premiumMembers: Number(payload.premiumMembers) || 0,
  };
}

/**
 * Fallback : 4 requêtes PostgREST en parallèle + DISTINCT côté JS.
 */
async function fetchStatsViaQueries(): Promise<DashboardStats> {
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

  if (totalResult.error) logger.error('[Dashboard] total count error', totalResult.error);
  if (verifiedResult.error) logger.error('[Dashboard] verified count error', verifiedResult.error);
  if (premiumResult.error) logger.error('[Dashboard] premium count error', premiumResult.error);
  if (countriesResult.error) logger.error('[Dashboard] countries query error', countriesResult.error);

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
    const rpcStats = await fetchStatsViaRpc();
    const stats = rpcStats ?? (await fetchStatsViaQueries());
    res.json(stats);
  } catch (err) {
    logger.error('[Dashboard] Critical error in getDashboardStats:', err);
    // Dernier filet : on renvoie des zéros pour ne pas casser le dashboard.
    res.status(200).json(EMPTY_STATS);
  }
};
