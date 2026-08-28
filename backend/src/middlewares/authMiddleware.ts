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

    // Suspension prononcée par un administrateur.
    // Elle est stockée dans user_profiles (is_suspended / suspended_until), pas
    // dans les métadonnées d'auth : sans ce contrôle, un compte suspendu resterait
    // bloqué par le middleware Next côté client mais garderait l'accès à l'API.
    // L'échéance est évaluée ici, pour qu'une suspension temporaire expire d'elle-même.
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_suspended, suspended_until')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.is_suspended) {
      const until = profile.suspended_until ? new Date(profile.suspended_until) : null;
      if (!until || until.getTime() > Date.now()) {
        return res.status(403).json({
          error: 'Compte suspendu',
          message: until
            ? `Votre compte est suspendu jusqu'au ${until.toLocaleDateString('fr-FR')}.`
            : 'Votre compte est suspendu. Contactez le support.',
        });
      }
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
    // SÉCURITÉ : l'autorisation admin repose sur la colonne dédiée `is_admin`,
    // jamais sur `role` (qui est un libellé métier modifiable par l'utilisateur
    // via PUT /api/users/me). Voir migration 20260621_add_is_admin_authorization.sql.
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (error || !profile || profile.is_admin !== true) {
      return res.status(403).json({ error: "Accès refusé. Droits administrateur requis." });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la vérification des droits" });
  }
};
