/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour les données du dashboard-user (Stats & Discovery)
 * @created 2026-01-04
*/

import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

/**
 * Récupère les statistiques globales pour le dashboard-user
 * GET /api/dashboard-user/stats
 */
export const getGlobalStats = async (req: Request, res: Response) => {
  try {
    // 1. Compter les entrepreneurs (user_profiles)
    const { count: userCount, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // 2. Compter les projets actifs (ads)
    const { count: adsCount, error: adsError } = await supabaseAdmin
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // 3. Compter les pays couverts (ayant au moins un entrepreneur)
    const { data: countryData, error: countryError } = await supabaseAdmin
      .from('user_profiles')
      .select('country_id')
      .eq('is_published', true)
      .not('country_id', 'is', null);
    
    const uniqueCountries = new Set(countryData?.map(u => u.country_id)).size;

    // 4. Calculer le financement total (somme des budgets des annonces actives)
    const { data: adsData, error: fundingError } = await supabaseAdmin
      .from('ads')
      .select('budget_limit')
      .eq('status', 'active');

    const totalFunding = adsData?.reduce((acc, curr) => acc + (Number(curr.budget_limit) || 0), 0) || 0;

    if (userError || adsError || countryError) {
      return res.status(400).json({ error: userError?.message || adsError?.message || countryError?.message });
    }

    res.json({
      totalEntrepreneurs: userCount || 0,
      activeProjects: adsCount || 0,
      countriesCovered: uniqueCountries > 0 ? uniqueCountries : 15, // Fallback si vide
      totalFunding: totalFunding
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur interne lors de la récupération des stats" });
  }
};

/**
 * Récupère les statistiques publiques (identique à GlobalStats mais pour l'accès public)
 */
export const getPublicStats = (req: Request, res: Response) => {
  getGlobalStats(req, res);
};

/**
 * Récupère les entrepreneurs en vedette (Discovery)
 * GET /api/dashboard-user/featured-entrepreneurs
 */
export const getFeaturedEntrepreneurs = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        *,
        countries(name, iso_code),
        profile_tags(tags(name))
      `)
      .eq('is_published', true)
      .limit(6)
      .order('updated_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    
    // Nettoyage identique à getPublicProfiles
    const cleanedData = data?.map((p: any) => ({
        ...p,
        tags: p.profile_tags?.map((pt: any) => pt.tags?.name) || []
    }));

    res.json(cleanedData);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne" });
  }
};
