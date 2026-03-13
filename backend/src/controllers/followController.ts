/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour le système de suivi des profils (Followers)
 * @created 2026-01-25
*/

import { Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

/**
 * Récupère les profils suivis par l'utilisateur connecté
 * GET /api/users/follows
 */
export const getFollowedProfiles = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const { data: follows, error: followsError } = await supabaseAdmin
      .from('user_follows')
      .select('following_id, notes')
      .eq('follower_id', userId);

    if (followsError) return res.status(400).json({ error: followsError.message });

    if (!follows || follows.length === 0) {
        return res.json([]);
    }

    const followingIds = follows.map(f => f.following_id);

    const { data: profilesData, error: profilesError } = await supabaseAdmin
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

    if (profilesError) return res.status(400).json({ error: profilesError.message });

    // Transformer et fusionner les notes
    const profiles = profilesData.map((p: any) => {
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
  } catch (err) {
    res.status(500).json({ error: "Erreur interne" });
  }
};

/**
 * Suit ou cesse de suivre un profil
 * POST /api/users/follow/:id
 */
export const toggleFollowProfile = async (req: any, res: Response) => {
  const followerId = req.user.id;
  const followingId = req.params.id;

  if (followerId === followingId) {
      return res.status(400).json({ error: "On ne peut pas se suivre soi-même" });
  }

  try {
    // Vérifier si déjà suivi (cet utilisateur spécifique)
    const { data: existing, error: errCheck } = await supabaseAdmin
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (existing) {
      // Unfollow
      const { error: errDel } = await supabaseAdmin
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
        
      if (errDel) throw errDel;
        
      return res.json({ followed: false });
    } else {
      // Follow (Ajouter au portefeuille)
      const { error: errIns } = await supabaseAdmin
        .from('user_follows')
        .insert({ follower_id: followerId, following_id: followingId });
        
      if (errIns) throw errIns;
        
      return res.json({ followed: true });
    }
  } catch (err: any) {
    console.error("Follow error:", err);
    res.status(500).json({ error: err.message || "Erreur lors de l'action de suivi" });
  }
};

/**
 * Récupère les profils des utilisateurs qui suivent l'utilisateur connecté
 * GET /api/users/followers
 */
export const getFollowers = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const { data: follows, error: followsError } = await supabaseAdmin
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', userId);

    if (followsError) return res.status(400).json({ error: followsError.message });

    if (!follows || follows.length === 0) {
        return res.json([]);
    }

    const followerIds = follows.map(f => f.follower_id);

    const { data: profilesData, error: profilesError } = await supabaseAdmin
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

    if (profilesError) return res.status(400).json({ error: profilesError.message });

    const profiles = profilesData.map((p: any) => ({
        ...p,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Membre',
        location: p.city || "Afrique de l'Ouest",
        followers: p.followers_count || 0
    }));

    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne" });
  }
};

/**
 * Met à jour la note privée sur un utilisateur suivi
 * PUT /api/users/follow/:id/note
 */
export const updateFollowNote = async (req: any, res: Response) => {
  const followerId = req.user.id;
  const followingId = req.params.id;
  const { note } = req.body;

  try {
    const { error } = await supabaseAdmin
      .from('user_follows')
      .update({ notes: note })
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de la note" });
  }
};
