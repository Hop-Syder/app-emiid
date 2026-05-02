import { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { ApiError } from '../utils/apiError';

function sanitizeText(value: unknown, maxLength: number) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, maxLength) : null;
}

/**
 * @description Gère l'enregistrement d'un utilisateur via le Backend (mode Admin)
 * @route POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, first_name, last_name, role } = req.body;

    try {
        // 1. Création de l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                first_name: sanitizeText(first_name, 100),
                last_name: sanitizeText(last_name, 100),
            }
        });

        if (authError) {
            return next(new ApiError(400, 'BAD_REQUEST', authError.message));
        }

        // Note: Le trigger SQL 'handle_new_user' devrait normalement créer le profil.
        // On renvoie les données de l'utilisateur créé.
        return res.status(201).json({ 
            message: "Utilisateur créé avec succès", 
            user: authData.user
                ? { id: authData.user.id, email: authData.user.email }
                : null
        });
    } catch (error: any) {
        return next(new ApiError(500, 'INTERNAL_SERVER_ERROR', "Erreur serveur lors de l'enregistrement", error?.message));
    }
};
