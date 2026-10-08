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
  checkSlugAvailability,
  updateMyProfile,
  updateMySettings,
  deactivateMyAccount,
  deleteMyAccount,
  verifyPin,
  setMyPin,
  disableMyPin,
  requestPinReset,
  resetMyPin,
  requestPhoneVerification,
  verifyPhone,
  unlockUserPin,
  getMyVerificationDocs,
  addMyVerificationDoc,
} from '../../controllers/userController';
import { getFollowedProfiles, toggleFollowProfile, getFollowers, updateFollowNote } from '../../controllers/followController';
import { requireAuth, requireAdmin } from '../../middlewares/authMiddleware';
import {
  updateProfileSchema,
  updateSettingsSchema,
  verifyPinSchema,
  resetPinSchema,
  requestPhoneVerificationSchema,
  verifyPhoneSchema,
  updateFollowNoteSchema,
} from '../validations/userValidations';
import { pinLimiter, pinResetRequestLimiter, pinResetVerifyLimiter, phoneVerificationLimiter, phoneVerifyLimiter } from '../../middlewares/rateLimiter';

const router = Router();

// Toutes les routes ici nécessitent une authentification
router.use(requireAuth);

// @route   GET /api/users/me
// @desc    Récupérer le profil connecté
router.get('/me', getMyProfile);

// @route   GET /api/users/check-slug
// @desc    Vérifier la disponibilité réelle d'un slug (unicité DB)
router.get('/check-slug', checkSlugAvailability);

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
router.post('/verify-pin', pinLimiter, verifyPin);

// @route   POST /api/users/pin
// @desc    Créer ou changer le PIN (ancien PIN ou code TOTP récent exigé)
router.post('/pin', pinLimiter, setMyPin);

// @route   POST /api/users/pin/disable
// @desc    Désactiver le PIN (ancien PIN ou code TOTP récent exigé)
router.post('/pin/disable', pinLimiter, disableMyPin);

// @route   POST /api/users/pin/request-reset
// @desc    Demander un OTP par e-mail pour réinitialiser le code PIN
router.post('/pin/request-reset', pinResetRequestLimiter, requestPinReset);

// @route   POST /api/users/reset-pin
// @desc    Vérifier l'OTP email et définir un nouveau code PIN
router.post('/reset-pin', pinResetVerifyLimiter, resetMyPin);



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
router.post('/phone/request', phoneVerificationLimiter, requestPhoneVerification);

// @route   POST /api/users/phone/verify
// @desc    Vérifier le code OTP
router.post('/phone/verify', phoneVerifyLimiter, verifyPhone);

// @route   GET /api/users/me/verification-docs
// @desc    Lister mes documents de vérification (KYC)
router.get('/me/verification-docs', getMyVerificationDocs);

// @route   POST /api/users/me/verification-docs
// @desc    Enregistrer la référence d'un document téléversé (bucket privé)
router.post('/me/verification-docs', addMyVerificationDoc);

// @route   POST /api/users/:id/unlock-pin
// @desc    Débloquer le PIN d'un utilisateur (Admin seulement)
router.post('/:id/unlock-pin', requireAdmin, unlockUserPin);

export default router;
