"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Middleware d'authentification pour valider les tokens Supabase
 * @created 2026-01-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAuth = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const ADMIN_ROLE_PATTERN = /^(admin|administrator|administrateur|superadmin)$/i;
function isAdminFromAuthMetadata(user) {
    const appMetadata = user?.app_metadata || {};
    const roles = [
        appMetadata.role,
        appMetadata.app_role,
        ...(Array.isArray(appMetadata.roles) ? appMetadata.roles : []),
    ].filter(Boolean);
    return roles.some((role) => typeof role === 'string' && ADMIN_ROLE_PATTERN.test(role.trim()));
}
function isAdminFromAllowlist(user) {
    const configuredEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
    return !!user?.email && configuredEmails.includes(String(user.email).toLowerCase());
}
/**
 * Middleware pour sécuriser les routes avec un Access Token Supabase.
 * Attend le token dans le header "Authorization: Bearer <token>".
 */
const requireAuth = async (req, res, next) => {
    const devBypassEnabled = process.env.DEV_AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production';
    const devUserIdHeader = req.headers['x-dev-user-id'];
    const devUserEmailHeader = req.headers['x-dev-user-email'];
    if (devBypassEnabled && typeof devUserIdHeader === 'string' && devUserIdHeader.trim()) {
        req.user = {
            id: devUserIdHeader,
            email: typeof devUserEmailHeader === 'string' && devUserEmailHeader.trim()
                ? devUserEmailHeader
                : `${devUserIdHeader}@dev.local`,
        };
        req.authToken = undefined;
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
        req.authToken = token;
        // Vérification du token via Supabase
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
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
        req.user = user;
        next();
    }
    catch (err) {
        logger_1.logger.error('Erreur auth middleware', err);
        return res.status(500).json({ error: 'Erreur interne du serveur lors de l\'authentification' });
    }
};
exports.requireAuth = requireAuth;
/**
 * Middleware pour vérifier si l'utilisateur est un administrateur
 */
const requireAdmin = async (req, res, next) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ error: "Authentification requise" });
    try {
        if (isAdminFromAuthMetadata(user) || isAdminFromAllowlist(user)) {
            return next();
        }
        const { data: profile, error } = await supabase_1.supabaseAdmin
            .from('user_profiles')
            .select('role, email')
            .eq('user_id', user.id)
            .single();
        if (error || !profile) {
            return res.status(403).json({ error: "Accès refusé. Droits administrateur requis." });
        }
        const hasAdminRole = typeof profile.role === 'string' && ADMIN_ROLE_PATTERN.test(profile.role.trim());
        // Admin validé par : (1) rôle DB, (2) email dans ADMIN_EMAILS (allowlist),
        // ou (3) combinaison des deux. Chaque condition est suffisante.
        const isAuthorizedAdmin = hasAdminRole ||
            isAdminFromAllowlist({ email: profile.email }) ||
            isAdminFromAllowlist({ email: user.email });
        if (!isAuthorizedAdmin) {
            return res.status(403).json({ error: "Accès refusé. Droits administrateur requis." });
        }
        next();
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la vérification des droits" });
    }
};
exports.requireAdmin = requireAdmin;
