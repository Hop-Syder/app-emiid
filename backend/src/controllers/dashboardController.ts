/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour les statistiques du dashboard utilisateur
 * @created 2026-04-26
 */

import { Request, Response } from 'express';
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
    // Compteur de followers
    const { count: totalFollowers, error: followersError } = await supabaseAdmin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followersError) {
      logger.error('[Dashboard] Error fetching followers:', followersError);
    }

    // Compteur de messages
    let totalMessages = 0;
    try {
      const { data: userConversations } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

      if (userConversations && userConversations.length > 0) {
        const convIds = userConversations.map(c => c.id);
        
        const { count, error: messagesError } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', convIds);

        if (messagesError) {
          logger.error('[Dashboard] Error fetching messages:', messagesError);
        } else {
          totalMessages = count || 0;
        }
      }
    } catch (err) {
      logger.error('[Dashboard] Exception fetching messages:', err);
    }

    // Vues de profil (si table existe, sinon 0)
    let profileViews = 0;
    try {
      const { count } = await supabaseAdmin
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', userId);
      
      profileViews = count || 0;
    } catch (err) {
      logger.info('[Dashboard] profile_views table not available, using 0');
    }

    // Calcul de la croissance (comparaison avec la semaine précédente)
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Nouveaux followers cette semaine
    const { count: newFollowersThisWeek } = await supabaseAdmin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .gte('created_at', thisWeekStart.toISOString());

    // Nouveaux followers semaine dernière
    const { count: newFollowersLastWeek } = await supabaseAdmin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .gte('created_at', lastWeekStart.toISOString())
      .lt('created_at', thisWeekStart.toISOString());

    const followersGrowth = calculateGrowth(newFollowersThisWeek || 0, newFollowersLastWeek || 0);

    // Nouveaux messages cette semaine
    const { data: userConversations } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    let messagesGrowth = 0;
    if (userConversations && userConversations.length > 0) {
      const convIds = userConversations.map(c => c.id);
      
      const { count: messagesThisWeek } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .gte('created_at', thisWeekStart.toISOString());

      const { count: messagesLastWeek } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .gte('created_at', lastWeekStart.toISOString())
        .lt('created_at', thisWeekStart.toISOString());

      messagesGrowth = calculateGrowth(messagesThisWeek || 0, messagesLastWeek || 0);
    }

    // Construction de la réponse
    const stats: DashboardStats = {
      total_followers: totalFollowers || 0,
      total_messages: totalMessages,
      profile_views: profileViews,
      followers_growth: followersGrowth,
      messages_growth: messagesGrowth,
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
