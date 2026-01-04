"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la gestion des profils utilisateurs
 * @created 2026-01-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updateMyProfile = exports.getMyProfile = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Récupère le profil de l'utilisateur actuellement connecté (via Token Relay)
 * GET /api/users/me
 */
const getMyProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase_1.supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error) {
            // Si le profil n'existe pas encore, on pourrait renvoyer les infos de base de l'auth
            if (error.code === 'PGRST116') {
                return res.json({
                    id: userId,
                    email: req.user.email,
                    message: "Profil à compléter"
                });
            }
            return res.status(400).json({ error: error.message });
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la récupération du profil" });
    }
};
exports.getMyProfile = getMyProfile;
/**
 * Met à jour le profil de l'utilisateur connecté
 * PUT /api/users/me
 */
const updateMyProfile = async (req, res) => {
    const userId = req.user.id;
    const { first_name, last_name, bio, avatar_url, role, specialty, category } = req.body;
    try {
        const { data, error } = await supabase_1.supabase
            .from('user_profiles')
            .upsert({
            user_id: userId,
            first_name,
            last_name,
            bio,
            avatar_url,
            role,
            specialty,
            category,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
            .select()
            .single();
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la mise à jour du profil" });
    }
};
exports.updateMyProfile = updateMyProfile;
/**
 * Récupère tous les profils (public)
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
    const { category } = req.query;
    try {
        let query = supabase_1.supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (category) {
            query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (error)
            return res.status(400).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne lors de la récupération des profils" });
    }
};
exports.getAllUsers = getAllUsers;
