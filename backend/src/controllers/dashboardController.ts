/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour les données du Dashboard (Stats & Discovery)
 * @created 2026-01-04
*/

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Récupère les statistiques globales pour le dashboard
 * GET /api/dashboard/stats
 */
export const getGlobalStats = async (req: Request, res: Response) => {
  try {
    // 1. Compter les entrepreneurs (user_profiles)
    const { count: userCount, error: userError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Compter les projets actifs (ads)
    const { count: adsCount, error: adsError } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (userError || adsError) {
      return res.status(400).json({ error: userError?.message || adsError?.message });
    }

    res.json({
      totalEntrepreneurs: userCount || 0,
      activeProjects: adsCount || 0,
      countriesCovered: 15, // Valeur statique demandée par Nexus
      totalFunding: 0 // À implémenter quand on aura des transactions
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur interne lors de la récupération des stats" });
  }
};

/**
 * Récupère les entrepreneurs en vedette (Discovery)
 * GET /api/dashboard/featured-entrepreneurs
 */
export const getFeaturedEntrepreneurs = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(6)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne" });
  }
};
