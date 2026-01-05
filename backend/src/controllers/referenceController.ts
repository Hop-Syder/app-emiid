/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour les données de référence (Secteurs, Professions)
 * @created 2026-01-05
*/

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Récupère tous les secteurs d'activité
 */
export const getSectors = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('activity_sectors')
      .select('*')
      .order('name');

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des secteurs" });
  }
};

/**
 * Récupère les professions, optionnellement filtrées par secteur
 */
export const getProfessions = async (req: Request, res: Response) => {
  const { sector_id } = req.query;

  try {
    let query = supabase
      .from('professions')
      .select('*, activity_sectors(name, slug)')
      .order('name');

    if (sector_id) {
      query = query.eq('sector_id', sector_id);
    }

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des professions" });
  }
};

/**
 * Récupère tous les pays
 */
export const getCountries = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name');

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des pays" });
  }
};
