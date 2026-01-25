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
    const { data, error } = await supabaseAdmin
      .from('user_follows')
      .select(`
        following_id,
        user_profiles:following_id (
          user_id,
          first_name,
          last_name,
          role,
          avatar_url,
          city,
          category,
          specialty,
          countries(name)
        )
      `)
      .eq('follower_id', userId);

    if (error) return res.status(400).json({ error: error.message });

    // Transformer pour un format plus simple
    const profiles = data.map((f: any) => ({
        ...f.user_profiles,
        name: `${f.user_profiles.first_name} ${f.user_profiles.last_name}`,
        location: f.user_profiles.city || "Afrique de l'Ouest"
    }));

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
    // Vérifier si déjà suivi
    const { data: existing } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      // Unfollow
      await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
        
      return res.json({ followed: false });
    } else {
      // Follow
      await supabase
        .from('user_follows')
        .insert({ follower_id: followerId, following_id: followingId });
        
      return res.json({ followed: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du suivi" });
  }
};
