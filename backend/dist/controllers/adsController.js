"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Controleur pour la gestion des annonces (Ads)
 * @created 2026-01-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAds = exports.getMyAds = exports.createAd = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Creer une nouvelle annonce
 * POST /api/ads
 */
const createAd = async (req, res) => {
    const userId = req.user.id;
    const { title, description, content, target_audience, category, budget_limit } = req.body;
    try {
        const { data, error } = await supabase_1.supabase
            .from('ads')
            .insert({
            user_id: userId,
            title,
            description,
            content,
            target_audience,
            category,
            budget_limit,
            status: 'pending',
            created_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(201).json(data);
    }
    catch {
        return res.status(500).json({ error: "Erreur interne lors de la creation de l'annonce" });
    }
};
exports.createAd = createAd;
/**
 * Recuperer les annonces de l'utilisateur connecte
 * GET /api/ads/my-ads
 */
const getMyAds = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase_1.supabase
            .from('ads')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.json(data);
    }
    catch {
        return res.status(500).json({ error: "Erreur interne lors de la recuperation des annonces" });
    }
};
exports.getMyAds = getMyAds;
/**
 * Recuperer toutes les annonces actives
 * GET /api/ads
 */
const getAllAds = async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('ads')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.json(data);
    }
    catch {
        return res.status(500).json({ error: "Erreur interne lors de la recuperation des annonces" });
    }
};
exports.getAllAds = getAllAds;
