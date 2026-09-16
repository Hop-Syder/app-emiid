/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Routes de paiement (checkout d'abonnement Pro). Le webhook est
 *              monté séparément dans app.ts (raw body requis pour la signature).
 * @created 2026-08-23
 */

import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/authMiddleware'
import {
    createCheckout,
    createBoostCheckout,
    createCreditPackCheckout,
    createMissionEscrowCheckout,
    releaseMissionEscrow,
    refundMissionEscrow,
    resolveMissionDispute,
    recordSponsorshipStrike,
    runMissionMaintenance,
    createSourcingRequestCheckout,
    fulfillSourcingRequest,
    cancelSourcingRequest,
} from '../../controllers/paymentController'

const router = Router()

// Initialisation d'un paiement d'abonnement Pro (authentifié).
router.post('/checkout', requireAuth, createCheckout)

// Initialisation d'un paiement de boost communal (authentifié).
router.post('/boost/checkout', requireAuth, createBoostCheckout)

// Initialisation d'un achat de pack de crédits (moteur Missions, authentifié).
router.post('/credits/checkout', requireAuth, createCreditPackCheckout)

// Paiement du séquestre d'une mission par le client (moteur Missions, authentifié).
router.post('/missions/:missionId/escrow/checkout', requireAuth, createMissionEscrowCheckout)

// Enregistrement du reversement MANUEL (Mobile Money, hors application) au
// prestataire — admin uniquement. Ne déclenche aucun virement automatisé.
router.post('/missions/:missionId/escrow/release', requireAuth, requireAdmin, releaseMissionEscrow)

// Enregistrement du remboursement MANUEL (Mobile Money, hors application) au
// client suite à litige ou annulation — admin uniquement.
router.post('/missions/:missionId/escrow/refund', requireAuth, requireAdmin, refundMissionEscrow)

// Arbitrage d'un litige sur une mission (RELEASE_TO_PRO ou REFUND_CLIENT) — admin uniquement.
router.post('/missions/:missionId/dispute/resolve', requireAuth, requireAdmin, resolveMissionDispute)

// Enregistrement d'un manquement (strike) sur un filleul parrainé — admin uniquement.
router.post('/sponsorship/strike', requireAuth, requireAdmin, recordSponsorshipStrike)

// Déclenchement manuel de la maintenance périodique (expiration + auto-release
// des missions) — pas de pg_cron branché dans ce projet, admin uniquement.
router.post('/missions/maintenance/run', requireAuth, requireAdmin, runMissionMaintenance)

// Initialisation d'une commande Sourcing Express B2B (15 000 FCFA, authentifié).
router.post('/sourcing/checkout', requireAuth, createSourcingRequestCheckout)

// Pourvoi d'une demande Sourcing Express avec 3 profils vérifiés — admin uniquement.
router.post('/sourcing/:requestId/fulfill', requireAuth, requireAdmin, fulfillSourcingRequest)

// Annulation d'une demande Sourcing Express payée non pourvue — admin uniquement.
router.post('/sourcing/:requestId/cancel', requireAuth, requireAdmin, cancelSourcingRequest)

export default router
