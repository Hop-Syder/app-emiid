import { Router } from 'express';
import { registerUser } from '../../controllers/authController';
import { requireAuth } from '../../middlewares/authMiddleware';
import { validateBody } from '../../middlewares/validate';
import { registerUserSchema } from '../schemas/authSchemas';

const router = Router();

// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur
// @access  Public
router.post('/register', validateBody(registerUserSchema), registerUser);

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
