"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const supabase_1 = require("../config/supabase");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESERVED_ROLE_PATTERN = /\b(admin|administrator|administrateur|superadmin|root|moderator|modérateur)\b/i;
function sanitizeText(value, maxLength) {
    if (typeof value !== 'string')
        return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, maxLength) : null;
}
/**
 * @description Gère l'enregistrement d'un utilisateur via le Backend (mode Admin)
 * @route POST /api/auth/register
 */
const registerUser = async (req, res) => {
    const { email, password, first_name, last_name, role } = req.body;
    try {
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: "Email et mot de passe requis" });
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            return res.status(400).json({ error: "Format d'email invalide" });
        }
        if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            return res.status(400).json({ error: "Mot de passe trop faible" });
        }
        if (typeof role === 'string' && RESERVED_ROLE_PATTERN.test(role)) {
            return res.status(400).json({ error: "Rôle réservé non autorisé à l'inscription" });
        }
        // 1. Création de l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password,
            email_confirm: true,
            user_metadata: {
                first_name: sanitizeText(first_name, 100),
                last_name: sanitizeText(last_name, 100),
            }
        });
        if (authError)
            return res.status(400).json({ error: authError.message });
        // Note: Le trigger SQL 'handle_new_user' devrait normalement créer le profil.
        // On renvoie les données de l'utilisateur créé.
        res.status(201).json({
            message: "Utilisateur créé avec succès",
            user: authData.user
                ? { id: authData.user.id, email: authData.user.email }
                : null
        });
    }
    catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de l'enregistrement", details: error.message });
    }
};
exports.registerUser = registerUser;
