"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour les données du dashboard-user (Stats & Discovery)
 * @created 2026-01-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeaturedEntrepreneurs = exports.getPublicStats = exports.getGlobalStats = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Récupère les statistiques globales pour le dashboard-user
 * GET /api/dashboard-user/stats
 */
const getGlobalStats = async (req, res) => {
    try {
        const { count: userCount, error: userError } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);
        const { count: verifiedCount, error: verifiedError } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true)
            .eq('is_verified', true);
        const { data: countryData, error: countryError } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select('country_id')
            .eq('is_published', true)
            .not('country_id', 'is', null);
        const { count: premiumCount, error: premiumError } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true)
            .eq('is_premium', true);
        const uniqueCountries = new Set(countryData?.map((u) => u.country_id)).size;
        if (userError || verifiedError || countryError || premiumError) {
            return res.status(400).json({
                error: userError?.message || verifiedError?.message || countryError?.message || premiumError?.message,
            });
        }
        res.json({
            totalEntrepreneurs: userCount || 0,
            verifiedMembers: verifiedCount || 0,
            countriesCovered: uniqueCountries > 0 ? uniqueCountries : 15, // Fallback si vide
            premiumMembers: premiumCount || 0,
        });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la récupération des stats" });
    }
};
exports.getGlobalStats = getGlobalStats;
/**
 * Récupère les statistiques publiques (identique à GlobalStats mais pour l'accès public)
 */
const getPublicStats = (req, res) => {
    (0, exports.getGlobalStats)(req, res);
};
exports.getPublicStats = getPublicStats;
/**
 * Récupère les entrepreneurs en vedette (Discovery)
 * GET /api/dashboard-user/featured-entrepreneurs
 */
const getFeaturedEntrepreneurs = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select(`
        *,
        countries(name, iso_code),
        profile_tags(tags(name))
      `)
            .eq('is_published', true)
            .limit(6)
            .order('updated_at', { ascending: false });
        if (error)
            return res.status(400).json({ error: error.message });
        // Nettoyage identique à getPublicProfiles
        const cleanedData = data?.map((p) => ({
            ...p,
            tags: p.profile_tags?.map((pt) => pt.tags?.name) || []
        }));
        res.json(cleanedData);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne" });
    }
};
exports.getFeaturedEntrepreneurs = getFeaturedEntrepreneurs;
