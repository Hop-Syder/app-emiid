"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Middleware d'authentification pour valider les tokens Supabase
 * @created 2026-01-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Middleware pour sécuriser les routes avec un Access Token Supabase.
 * Attend le token dans le header "Authorization: Bearer <token>".
 */
const requireAuth = async (req, res, next) => {
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
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                error: 'Session invalide',
                message: 'Le token est expiré ou corrompu.'
            });
        }
        // Injection de l'utilisateur dans l'objet Request pour les controllers suivants
        req.user = user;
        next();
    }
    catch (err) {
        console.error('Erreur Auth Middleware:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur lors de l\'authentification' });
    }
};
exports.requireAuth = requireAuth;
