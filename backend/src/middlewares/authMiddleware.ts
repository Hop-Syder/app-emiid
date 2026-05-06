/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Middleware d'authentification pour valider les tokens Supabase
 * @created 2026-01-04
*/

import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

/**
 * Middleware pour sécuriser les routes avec un Access Token Supabase.
 * Attend le token dans le header "Authorization: Bearer <token>".
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const devBypassEnabled = process.env.DEV_AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production';
  const devUserIdHeader = req.headers['x-dev-user-id'];
  const devUserEmailHeader = req.headers['x-dev-user-email'];

  if (devBypassEnabled && typeof devUserIdHeader === 'string' && devUserIdHeader.trim()) {
    (req as any).user = {
      id: devUserIdHeader,
      email: typeof devUserEmailHeader === 'string' && devUserEmailHeader.trim()
        ? devUserEmailHeader
        : `${devUserIdHeader}@dev.local`,
    };

    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentification requise', 
      message: 'Token de session manquant ou invalide.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Vérification du token via Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Session invalide', 
        message: 'Le token est expiré ou corrompu.' 
      });
    }

    if (user.user_metadata?.account_disabled) {
      return res.status(403).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé. Contactez le support pour le réactiver.',
      });
    }

    // Injection de l'utilisateur dans l'objet Request pour les controllers suivants
    (req as any).user = user;
    
    next();
  } catch (err) {
    logger.error('Erreur auth middleware', err);
    return res.status(500).json({ error: 'Erreur interne du serveur lors de l\'authentification' });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Authentification requise" });

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !profile || !profile.role?.toLowerCase().includes('admin')) {
      return res.status(403).json({ error: "Accès refusé. Droits administrateur requis." });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la vérification des droits" });
  }
};
