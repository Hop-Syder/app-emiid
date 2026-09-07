import { Router } from 'express';
import { registerUser } from '../../controllers/authController';
import { requireAuth, requireAdmin } from '../../middlewares/authMiddleware';
import { authLimiter } from '../../middlewares/rateLimiter';
import { registerSchema } from '../validations/authValidations';

const router = Router();

// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur (création directe, email confirmé)
// @access  Admin uniquement — aucun frontend/flux public ne consomme cet endpoint ;
//          un accès public créerait des comptes pré-confirmés sans passer par
//          le flux d'inscription normal (OAuth/OTP Supabase Auth).
router.post('/register', authLimiter, requireAuth, requireAdmin, registerUser);

// @route   GET /api/auth/me
// @desc    Récupérer les infos de l'utilisateur connecté (Test Relay)
// @access  Private
router.get('/me', requireAuth, (req: any, res) => {
  res.json({
    message: "Authentification réussie !",
    user: req.user
  });
});

export default router;