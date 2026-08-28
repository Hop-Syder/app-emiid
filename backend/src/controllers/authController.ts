import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { registerSchema } from '../api/validations/authValidations';

/**
 * @description Gère l'enregistrement d'un utilisateur via le Backend (mode Admin)
 * @route POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { body: { email, password, first_name, last_name, role } } = registerSchema.parse(req);

        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis" });
        }

        // 1. Création de l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name, last_name, role }
        });

        if (authError) return res.status(400).json({ error: authError.message });

        // Note: Le trigger SQL 'handle_new_user' devrait normalement créer le profil.
        // On renvoie les données de l'utilisateur créé.
        res.status(201).json({ 
            message: "Utilisateur créé avec succès", 
            user: authData.user 
        });
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur lors de l'enregistrement", details: error.message });
    }
};