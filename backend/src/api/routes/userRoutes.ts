/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes pour la gestion des utilisateurs
 * @created 2026-01-04
 * @updated 2026-05-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/ // ──────────────────────────────────

import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateMySettings,
  deactivateMyAccount,
  deleteMyAccount,
  verifyPin,
  requestPhoneVerification,
  verifyPhone,
  unlockUserPin,
} from '../../controllers/userController';
import { getFollowedProfiles, toggleFollowProfile, getFollowers, updateFollowNote } from '../../controllers/followController';
import { requireAuth, requireAdmin } from '../../middlewares/authMiddleware';

const router = Router();

// Toutes les routes ici nécessitent une authentification
router.use(requireAuth);

// @route   GET /api/users/me
// @desc    Récupérer le profil connecté
router.get('/me', getMyProfile);

// @route   PUT /api/users/me
// @desc    Mettre à jour le profil connecté
router.put('/me', updateMyProfile);

// @route   PUT /api/users/settings
// @desc    Mettre à jour les paramètres du compte connecté
router.put('/settings', updateMySettings);

// @route   POST /api/users/account/deactivate
// @desc    Désactiver temporairement le compte connecté
router.post('/account/deactivate', deactivateMyAccount);

// @route   DELETE /api/users/account
// @desc    Supprimer définitivement le compte connecté
router.delete('/account', deleteMyAccount);

// @route   POST /api/users/verify-pin
// @desc    Vérifier le code PIN
router.post('/verify-pin', verifyPin);



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

// @route   POST /api/users/phone/request
// @desc    Demander un code OTP par WhatsApp ou SMS
router.post('/phone/request', requestPhoneVerification);

// @route   POST /api/users/phone/verify
// @desc    Vérifier le code OTP
router.post('/phone/verify', verifyPhone);

// @route   POST /api/users/:id/unlock-pin
// @desc    Débloquer le PIN d'un utilisateur (Admin seulement)
router.post('/:id/unlock-pin', requireAdmin, unlockUserPin);

export default router;
