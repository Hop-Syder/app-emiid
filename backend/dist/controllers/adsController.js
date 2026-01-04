"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la gestion des annonces (Ads)
 * @created 2026-01-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAds = exports.getMyAds = exports.createAd = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Créer une nouvelle annonce
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
            created_at: new Date().toISOString()
        })
            .select()
            .single();
        if (error)
            return res.status(400).json({ error: error.message });
        res.status(201).json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la création de l'annonce" });
    }
};
exports.createAd = createAd;
/**
 * Récupérer les annonces de l'utilisateur connecté
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
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la récupération des annonces" });
    }
};
exports.getMyAds = getMyAds;
/**
 * Récupérer toutes les annonces actives (Public)
 * GET /api/ads
 */
const getAllAds = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('ads')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la récupération des annonces" });
    }
};
exports.getAllAds = getAllAds;
