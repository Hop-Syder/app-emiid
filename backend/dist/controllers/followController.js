"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour le système de suivi des profils (Followers)
 * @created 2026-01-25
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFollowNote = exports.getFollowers = exports.toggleFollowProfile = exports.getFollowedProfiles = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Récupère les profils suivis par l'utilisateur connecté
 * GET /api/users/follows
 */
const getFollowedProfiles = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data: follows, error: followsError } = await supabase_1.supabaseAdmin
            .from('user_follows')
            .select('following_id, notes')
            .eq('follower_id', userId);
        if (followsError)
            return res.status(400).json({ error: followsError.message });
        if (!follows || follows.length === 0) {
            return res.json([]);
        }
        const followingIds = follows.map(f => f.following_id);
        const { data: profilesData, error: profilesError } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select(`
          user_id,
          first_name,
          last_name,
          role,
          avatar_url,
          city,
          category,
          specialty,
          followers_count,
          countries(name)
      `)
            .in('user_id', followingIds);
        if (profilesError)
            return res.status(400).json({ error: profilesError.message });
        // Transformer et fusionner les notes
        const profiles = profilesData.map((p) => {
            const followInfo = follows.find(f => f.following_id === p.user_id);
            return {
                ...p,
                name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Membre',
                location: p.city || "Afrique de l'Ouest",
                followers: p.followers_count || 0,
                notes: followInfo?.notes || null
            };
        });
        res.json(profiles);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne" });
    }
};
exports.getFollowedProfiles = getFollowedProfiles;
/**
 * Suit ou cesse de suivre un profil
 * POST /api/users/follow/:id
 */
const toggleFollowProfile = async (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;
    if (followerId === followingId) {
        return res.status(400).json({ error: "On ne peut pas se suivre soi-même" });
    }
    try {
        // Vérifier si déjà suivi (cet utilisateur spécifique)
        const { data: existing, error: errCheck } = await supabase_1.supabaseAdmin
            .from('user_follows')
            .select('id')
            .eq('follower_id', followerId)
            .eq('following_id', followingId)
            .maybeSingle();
        if (existing) {
            // Unfollow
            const { error: errDel } = await supabase_1.supabaseAdmin
                .from('user_follows')
                .delete()
                .eq('follower_id', followerId)
                .eq('following_id', followingId);
            if (errDel)
                throw errDel;
            return res.json({ followed: false });
        }
        else {
            // Follow (Ajouter au portefeuille)
            const { error: errIns } = await supabase_1.supabaseAdmin
                .from('user_follows')
                .insert({ follower_id: followerId, following_id: followingId });
            if (errIns)
                throw errIns;
            return res.json({ followed: true });
        }
    }
    catch (err) {
        console.error("Follow error:", err);
        res.status(500).json({ error: err.message || "Erreur lors de l'action de suivi" });
    }
};
exports.toggleFollowProfile = toggleFollowProfile;
/**
 * Récupère les profils des utilisateurs qui suivent l'utilisateur connecté
 * GET /api/users/followers
 */
const getFollowers = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data: follows, error: followsError } = await supabase_1.supabaseAdmin
            .from('user_follows')
            .select('follower_id')
            .eq('following_id', userId);
        if (followsError)
            return res.status(400).json({ error: followsError.message });
        if (!follows || follows.length === 0) {
            return res.json([]);
        }
        const followerIds = follows.map(f => f.follower_id);
        const { data: profilesData, error: profilesError } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select(`
          user_id,
          first_name,
          last_name,
          role,
          avatar_url,
          city,
          category,
          specialty,
          followers_count,
          countries(name)
      `)
            .in('user_id', followerIds);
        if (profilesError)
            return res.status(400).json({ error: profilesError.message });
        const profiles = profilesData.map((p) => ({
            ...p,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Membre',
            location: p.city || "Afrique de l'Ouest",
            followers: p.followers_count || 0
        }));
        res.json(profiles);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur interne" });
    }
};
exports.getFollowers = getFollowers;
/**
 * Met à jour la note privée sur un utilisateur suivi
 * PUT /api/users/follow/:id/note
 */
const updateFollowNote = async (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;
    const { note } = req.body;
    try {
        const { error } = await supabase_1.supabaseAdmin
            .from('user_follows')
            .update({ notes: note })
            .eq('follower_id', followerId)
            .eq('following_id', followingId);
        if (error)
            return res.status(400).json({ error: error.message });
        res.json({ success: true, note });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour de la note" });
    }
};
exports.updateFollowNote = updateFollowNote;
