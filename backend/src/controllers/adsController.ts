/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Controleur pour la gestion des annonces (Ads)
 * @created 2026-01-04
*/

import { Response } from 'express'
import { supabase } from '../config/supabase'

/**
 * Creer une nouvelle annonce
 * POST /api/ads
 */
export const createAd = async (req: any, res: Response) => {
  const userId = req.user.id
  const { title, description, content, target_audience, category, budget_limit } = req.body

  try {
    const { data, error } = await supabase
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
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json(data)
  } catch {
    return res.status(500).json({ error: "Erreur interne lors de la creation de l'annonce" })
  }
}

/**
 * Recuperer les annonces de l'utilisateur connecte
 * GET /api/ads/my-ads
 */
export const getMyAds = async (req: any, res: Response) => {
  const userId = req.user.id

  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json(data)
  } catch {
    return res.status(500).json({ error: "Erreur interne lors de la recuperation des annonces" })
  }
}

/**
 * Recuperer toutes les annonces actives
 * GET /api/ads
 */
export const getAllAds = async (_req: any, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json(data)
  } catch {
    return res.status(500).json({ error: "Erreur interne lors de la recuperation des annonces" })
  }
}
