/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la gestion des profils utilisateurs
 * @created 2026-01-04
*/

import { Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Récupère le profil de l'utilisateur actuellement connecté (via Token Relay)
 * GET /api/users/me
 */
export const getMyProfile = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
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
  } catch (err) {
    res.status(500).json({ error: "Erreur interne lors de la récupération du profil" });
  }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 * PUT /api/users/me
 */
export const updateMyProfile = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { 
    first_name, last_name, bio, avatar_url, 
    role, specialty, category, activity_domain,
    country_id, country_code, country_name, city 
  } = req.body;

  try {
    let finalCountryId = country_id;

    // Si on a un code pays mais pas d'ID, on cherche ou on crée
    if (!finalCountryId && country_code) {
      const { data: countryData, error: countryError } = await supabase
        .from('countries')
        .select('id')
        .eq('iso_code', country_code)
        .single();

      if (countryData) {
        finalCountryId = countryData.id;
      } else {
        // Créer le pays s'il n'existe pas
        const { data: newCountry, error: createError } = await supabase
          .from('countries')
          .insert({ name: country_name, iso_code: country_code })
          .select()
          .single();
        
        if (newCountry) finalCountryId = newCountry.id;
      }
    }

    const { data, error } = await supabase
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
        activity_domain,
        country_id: finalCountryId,
        city,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne lors de la mise à jour du profil" });
  }
};

/**
 * Récupère tous les profils (public)
 * GET /api/users
 */
export const getAllUsers = async (req: any, res: Response) => {
  const { category } = req.query;
  
  try {
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne lors de la récupération des profils" });
  }
};
