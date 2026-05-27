import { Router } from 'express';
import { registerUser } from '../../controllers/authController';
import { requireAuth } from '../../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema } from '../validations/authValidations';

const router = Router();

// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur
// @access  Public
router.post('/register', validateRequest(registerSchema), registerUser);

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