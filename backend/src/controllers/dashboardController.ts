/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour les statistiques du dashboard utilisateur
 * @created 2026-04-26
 */

import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

export interface DashboardStats {
  total_followers: number;
  total_messages: number;
  profile_views: number;
  followers_growth: number;
  messages_growth: number;
  profile_views_growth: number;
}

/**
 * Récupère les statistiques du dashboard pour l'utilisateur connecté
 * GET /api/dashboard-user/stats
 */
export const getDashboardStats = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Récupération des conversations utilisateur (nécessaire pour plusieurs compteurs)
    const { data: userConversations, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    if (convError) {
      logger.error('[Dashboard] Error fetching conversations:', convError);
    }

    const convIds = (userConversations || []).map((c: any) => c.id);

    // 2. Exécution en parallèle de toutes les requêtes de comptage
    const baseFollowers = supabaseAdmin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    const followersThisWeek = supabaseAdmin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .gte('created_at', thisWeekStart.toISOString());

    const followersLastWeek = supabaseAdmin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .gte('created_at', lastWeekStart.toISOString())
      .lt('created_at', thisWeekStart.toISOString());

    const profileViewsQuery = supabaseAdmin
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', userId);

    const messagesPromises = convIds.length > 0
      ? [
          supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', convIds),
          supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', convIds)
            .gte('created_at', thisWeekStart.toISOString()),
          supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', convIds)
            .gte('created_at', lastWeekStart.toISOString())
            .lt('created_at', thisWeekStart.toISOString()),
        ]
      : [];

    const [
      followersResult,
      followersThisWeekResult,
      followersLastWeekResult,
      profileViewsResult,
      ...messagesResults
    ] = await Promise.all([
      baseFollowers,
      followersThisWeek,
      followersLastWeek,
      profileViewsQuery,
      ...messagesPromises,
    ]);

    const totalFollowers = followersResult.count || 0;
    const newFollowersThisWeek = followersThisWeekResult.count || 0;
    const newFollowersLastWeek = followersLastWeekResult.count || 0;
    const profileViews = profileViewsResult.error ? 0 : (profileViewsResult.count || 0);

    const totalMessages = messagesResults[0]?.count || 0;
    const messagesThisWeek = messagesResults[1]?.count || 0;
    const messagesLastWeek = messagesResults[2]?.count || 0;

    const stats: DashboardStats = {
      total_followers: totalFollowers,
      total_messages: totalMessages,
      profile_views: profileViews,
      followers_growth: calculateGrowth(newFollowersThisWeek, newFollowersLastWeek),
      messages_growth: calculateGrowth(messagesThisWeek, messagesLastWeek),
      profile_views_growth: 0,
    };

    res.json(stats);
  } catch (err) {
    logger.error('[Dashboard] Critical error in getDashboardStats:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des statistiques' });
  }
};

/**
 * Calcule le pourcentage de croissance entre deux périodes
 */
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}
