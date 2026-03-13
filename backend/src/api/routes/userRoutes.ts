/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la gestion des utilisateurs
 * @created 2026-01-04
*/

import { Router } from 'express';
import { getMyProfile, updateMyProfile, getAllUsers, verifyPin } from '../../controllers/userController';
import { getFollowedProfiles, toggleFollowProfile, getFollowers, updateFollowNote } from '../../controllers/followController';
import { requireAuth } from '../../middlewares/authMiddleware';

const router = Router();

// Toutes les routes ici nécessitent une authentification
router.use(requireAuth);

// @route   GET /api/users/me
// @desc    Récupérer le profil connecté
router.get('/me', getMyProfile);

// @route   PUT /api/users/me
// @desc    Mettre à jour le profil connecté
router.put('/me', updateMyProfile);

// @route   POST /api/users/verify-pin
// @desc    Vérifier le code PIN
router.post('/verify-pin', verifyPin);

// @route   GET /api/users
// @desc    Récupérer tous les profils (Artisans, Freelances, etc)
router.get('/', getAllUsers);

// @route   GET /api/users/follows
// @desc    Récupérer les profils suivis
router.get('/follows', getFollowedProfiles);

// @route   GET /api/users/followers
// @desc    Récupérer les profils des utilisateurs qui vous suivent
router.get('/followers', getFollowers);

// @route   POST /api/users/follow/:id
// @desc    Suivre ou ne plus suivre un profil
router.post('/follow/:id', toggleFollowProfile);

// @route   PUT /api/users/follow/:id/note
// @desc    Mettre à jour la note privée sur un utilisateur suivi
router.put('/follow/:id/note', updateFollowNote);

export default router;
