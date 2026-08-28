/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contrôleur pour les données de référence (pays, etc.)
 * @created 2026-05-24
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/
// ──────────────────────────────────

import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { logger } from '../utils/logger'

export const getReferenceCountries = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('countries')
      .select('id, name, iso_code')
      .order('name')

    if (error) {
      logger.error('Erreur lors de la récupération des pays:', error)
      return res.status(500).json({ error: 'Erreur lors de la récupération des pays' })
    }

    return res.status(200).json(data)
  } catch (error) {
    logger.error('Erreur inattendue dans getReferenceCountries:', error)
    return res.status(500).json({ error: 'Erreur inattendue' })
  }
}

export const getReferenceSectors = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('industries')
      .select('id, name')
      .order('name')

    if (error) {
      logger.error('Erreur lors de la récupération des secteurs:', error)
      return res.status(500).json({ error: 'Erreur lors de la récupération des secteurs' })
    }

    return res.status(200).json(data)
  } catch (error) {
    logger.error('Erreur inattendue dans getReferenceSectors:', error)
    return res.status(500).json({ error: 'Erreur inattendue' })
  }
}

export const getReferenceProfessions = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('id, name')
      .order('name')

    if (error) {
      logger.error('Erreur lors de la récupération des professions:', error)
      return res.status(500).json({ error: 'Erreur lors de la récupération des professions' })
    }

    return res.status(200).json(data)
  } catch (error) {
    logger.error('Erreur inattendue dans getReferenceProfessions:', error)
    return res.status(500).json({ error: 'Erreur inattendue' })
  }
}
