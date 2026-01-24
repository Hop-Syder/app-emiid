/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour la gestion des profils utilisateurs
 * @created 2026-01-04
*/

import { Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import bcrypt from 'bcrypt';

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
    country_id, country_code, country_name, city,
    job_title, industry, pin_enabled, pin_code
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

    // --- SMART AUTOCOMPLETE LOGIC ---
    // Correction: On utilise 'role' (envoyé par le front) pour alimenter 'jobs'
    if (role) {
      await supabaseAdmin.from('jobs').upsert({ name: role }, { onConflict: 'name' });
    }
    // Correction: On utilise 'activity_domain' pour 'industries'
    if (activity_domain) {
      await supabaseAdmin.from('industries').upsert({ name: activity_domain }, { onConflict: 'name' });
    }

    // --- PIN SECURITY LOGIC ---
    // Construction sécurisée de l'objet updates pour éviter les erreurs de colonnes inexistantes
    const updates: any = { 
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
    };
    
    // Ajout conditionnel des champs PIN (seulement si présents)
    if (pin_enabled !== undefined) updates.pin_enabled = pin_enabled;

    // Si un nouveau code PIN est envoyé, on le hashe
    if (pin_code && pin_code.length === 6) {
      const salt = await bcrypt.genSalt(10);
      updates.pin_code = await bcrypt.hash(pin_code, salt);
      updates.pin_attempts = 0;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(updates, { onConflict: 'user_id' })
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

/**
 * Récupère uniquement les profils publiés (public, pas d'auth requise)
 * GET /api/public/profiles
 */
export const getPublicProfiles = async (req: Request, res: Response) => {
  const { category, search } = req.query;
  
  try {
    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        countries(name, iso_code)
      `)
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,role.ilike.%${search}%,specialty.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne lors de la récupération des profils publics" });
  }
};
/**
 * Vérifie le code PIN de l'utilisateur
 * POST /api/users/verify-pin
 */
export const verifyPin = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { pin } = req.body;

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('pin_code, pin_attempts, pin_enabled')
      .eq('user_id', userId)
      .single();

    if (error || !profile) return res.status(400).json({ error: "Profil introuvable" });

    if (!profile.pin_enabled) return res.json({ success: true, message: "PIN non activé" });

    if (profile.pin_attempts >= 6) {
      return res.status(403).json({ error: "Compte bloqué après 6 essais infructueux. Veuillez contacter le support." });
    }

    const isMatch = await bcrypt.compare(pin, profile.pin_code);

    if (isMatch) {
      // Réinitialiser les tentatives si succès
      await supabaseAdmin
        .from('user_profiles')
        .update({ pin_attempts: 0 })
        .eq('user_id', userId);
      
      return res.json({ success: true });
    } else {
      // Incrémenter les tentatives
      const newAttempts = (profile.pin_attempts || 0) + 1;
      await supabaseAdmin
        .from('user_profiles')
        .update({ pin_attempts: newAttempts })
        .eq('user_id', userId);
      
      return res.status(401).json({ 
        error: "Code PIN incorrect", 
        attempts_remaining: 6 - newAttempts 
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la vérification du PIN" });
  }
};
