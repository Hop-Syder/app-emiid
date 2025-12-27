import { Router } from 'express';
import { registerUser } from '../../controllers/authController';

const router = Router();

// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur
// @access  Public
router.post('/register', registerUser);

export default router;