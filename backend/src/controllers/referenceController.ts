/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Controleur pour les donnees de reference (secteurs, professions, pays)
 * @created 2026-01-05
*/

import { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'

export const getSectors = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_sectors')
      .select('*')
      .order('name')

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json(data)
  } catch {
    return res.status(500).json({ error: "Erreur lors de la recuperation des secteurs" })
  }
}

export const getProfessions = async (req: Request, res: Response) => {
  const { sector_id } = req.query

  try {
    let query = supabaseAdmin
      .from('professions')
      .select('*, activity_sectors(name, slug)')
      .order('name')

    if (sector_id) {
      query = query.eq('sector_id', sector_id)
    }

    const { data, error } = await query

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json(data)
  } catch {
    return res.status(500).json({ error: "Erreur lors de la recuperation des professions" })
  }
}

export const getCountries = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('countries')
      .select('*')
      .order('name')

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json(data)
  } catch {
    return res.status(500).json({ error: "Erreur lors de la recuperation des pays" })
  }
}
