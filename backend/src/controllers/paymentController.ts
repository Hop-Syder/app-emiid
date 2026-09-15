/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Paiements Mobile Money (FedaPay) — checkout d'abonnement Pro et
 *              webhook d'activation. Écritures via service role (RLS bypass).
 *
 *              Flux :
 *                POST /api/payments/checkout  → crée une transaction PENDING,
 *                     initialise FedaPay, renvoie token/URL de paiement.
 *                POST /api/payments/webhook   → vérifie la signature, passe la
 *                     transaction en SUCCESS (idempotent) et active l'abonnement.
 * @created 2026-08-23
 */

import { Request, Response } from 'express'
import { supabaseAdminUntyped } from '../config/supabase'
import { logger } from '../utils/logger'
import { createTransaction, generatePaymentToken, verifyWebhookSignature } from '../services/fedapay'

// Grille des forfaits Pro (montants entiers FCFA).
const PLANS: Record<string, { amount: number; months: number; label: string }> = {
    PRO_MONTHLY: { amount: 1000, months: 1, label: 'Abonnement Pro EmiID (mensuel)' },
    PRO_ANNUAL: { amount: 10000, months: 12, label: 'Abonnement Pro EmiID (annuel)' },
}

// Grille des boosts de visibilité. La portée est portée par le forfait lui-même.
type BoostScope = 'COMMUNE' | 'DEPARTMENT'
const BOOST_PLANS: Record<string, { amount: number; hours: number; scope: BoostScope; label: string }> = {
    COMMUNE_48H:    { amount: 500,   hours: 48,       scope: 'COMMUNE',    label: 'Boost communal EmiID — 48 heures' },
    COMMUNE_7D:     { amount: 1200,  hours: 24 * 7,   scope: 'COMMUNE',    label: 'Boost communal EmiID — 7 jours' },
    COMMUNE_30D:    { amount: 4000,  hours: 24 * 30,  scope: 'COMMUNE',    label: 'Boost communal EmiID — 30 jours' },
    DEPARTMENT_48H: { amount: 1200,  hours: 48,       scope: 'DEPARTMENT', label: 'Boost départemental EmiID — 48 heures' },
    DEPARTMENT_7D:  { amount: 3000,  hours: 24 * 7,   scope: 'DEPARTMENT', label: 'Boost départemental EmiID — 7 jours' },
    DEPARTMENT_30D: { amount: 10000, hours: 24 * 30,  scope: 'DEPARTMENT', label: 'Boost départemental EmiID — 30 jours' },
}

// Grille des packs de crédits "Postuler" (moteur Missions, Phase 1).
// Montants issus de docs/business-plan-missions.md §3.
const CREDIT_PACKS: Record<string, { amount: number; credits: number; label: string }> = {
    PACK_5:  { amount: 2000, credits: 5,  label: 'Pack 5 crédits EmiID Missions' },
    PACK_15: { amount: 5000, credits: 15, label: 'Pack 15 crédits EmiID Missions' },
}

// Forfait Sourcing Express B2B (moteur Missions, Phase 5) — montant fixe, un
// seul palier (pas de grille comme les autres forfaits).
const SOURCING_EXPRESS_FEE = 15000
const SOURCING_EXPRESS_LABEL = 'Sourcing Express EmiID — 3 profils vérifiés sous 24h'

// Le client typé ne connaît pas encore les tables de monétisation → cast souple
// (voir supabaseAdminUntyped dans config/supabase.ts).
const db = supabaseAdminUntyped

const appUrl = () => process.env.APP_PUBLIC_URL || process.env.APP_URL || 'https://app.emiid.com'

/** Ajoute N mois à une date (base) et renvoie la nouvelle date. */
function addMonths(base: Date, months: number): Date {
    const d = new Date(base)
    d.setMonth(d.getMonth() + months)
    return d
}

// ── POST /api/payments/checkout ───────────────────────────────────────────
export async function createCheckout(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user
        if (!user?.id) return res.status(401).json({ error: 'Authentification requise' })

        const plan = String(req.body?.plan || '')
        const config = PLANS[plan]
        if (!config) {
            return res.status(400).json({ error: 'Forfait invalide', message: 'plan doit être PRO_MONTHLY ou PRO_ANNUAL.' })
        }

        // 1. Transaction locale PENDING (traçabilité).
        const { data: tx, error: txErr } = await db
            .from('payment_transactions')
            .insert({
                user_id: user.id,
                amount: config.amount,
                currency: 'XOF',
                provider: 'FEDAPAY',
                type: 'SUBSCRIPTION_PRO',
                status: 'PENDING',
                metadata: { plan },
            })
            .select('id')
            .single()

        if (txErr || !tx) {
            logger.error('checkout: insertion transaction échouée', txErr)
            return res.status(500).json({ error: 'Impossible de créer la transaction.' })
        }

        // 2. Transaction FedaPay + token de paiement.
        try {
            const fp = await createTransaction({
                amount: config.amount,
                description: config.label,
                callbackUrl: `${appUrl()}/paiement/retour?t=${tx.id}`,
                customer: {
                    firstname: user.user_metadata?.first_name,
                    lastname: user.user_metadata?.last_name,
                    email: user.email,
                    phone: user.phone || user.user_metadata?.phone,
                },
            })

            await db.from('payment_transactions')
                .update({ provider_ref: fp.id, updated_at: new Date().toISOString() })
                .eq('id', tx.id)

            const { token, url } = await generatePaymentToken(fp.id)
            return res.json({ transactionId: tx.id, token, url })
        } catch (fpErr) {
            logger.error('checkout: FedaPay a échoué', fpErr)
            await db.from('payment_transactions')
                .update({ status: 'FAILED', updated_at: new Date().toISOString() })
                .eq('id', tx.id)
            return res.status(502).json({ error: 'Le service de paiement est indisponible.' })
        }
    } catch (err) {
        logger.error('checkout: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/boost/checkout ─────────────────────────────────────
export async function createBoostCheckout(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user
        if (!user?.id) return res.status(401).json({ error: 'Authentification requise' })

        const plan = String(req.body?.plan || '')
        const communeId = String(req.body?.communeId || '')
        const departmentId = String(req.body?.departmentId || '')
        const config = BOOST_PLANS[plan]

        if (!config) {
            return res.status(400).json({
                error: 'Forfait invalide',
                message: `plan doit être l'un de : ${Object.keys(BOOST_PLANS).join(', ')}.`,
            })
        }

        // La cible dépend de la portée du forfait et doit exister au référentiel.
        const isCommune = config.scope === 'COMMUNE'
        const targetId = isCommune ? communeId : departmentId
        if (!targetId) {
            return res.status(400).json({
                error: isCommune ? 'Commune requise' : 'Département requis',
            })
        }

        const { data: target } = await db
            .from(isCommune ? 'communes' : 'departments')
            .select('id').eq('id', targetId).maybeSingle()
        if (!target) {
            return res.status(400).json({
                error: isCommune ? 'Commune inconnue' : 'Département inconnu',
            })
        }

        // 1. Transaction locale PENDING.
        const { data: tx, error: txErr } = await db
            .from('payment_transactions')
            .insert({
                user_id: user.id,
                amount: config.amount,
                currency: 'XOF',
                provider: 'FEDAPAY',
                type: 'PROFILE_BOOST',
                status: 'PENDING',
                metadata: { plan, scope: config.scope, targetId },
            })
            .select('id')
            .single()

        if (txErr || !tx) {
            logger.error('boost checkout: insertion transaction échouée', txErr)
            return res.status(500).json({ error: 'Impossible de créer la transaction.' })
        }

        // 2. Boost PENDING, activé seulement au paiement confirmé.
        const expiresAt = new Date(Date.now() + config.hours * 3600 * 1000)
        await db.from('profile_boosts').insert({
            profile_id: user.id,
            scope: config.scope,
            commune_id: isCommune ? targetId : null,
            department_id: isCommune ? null : targetId,
            expires_at: expiresAt.toISOString(),
            status: 'PENDING',
            price_paid: config.amount,
            transaction_id: tx.id,
        })

        // 3. Paiement FedaPay.
        try {
            const fp = await createTransaction({
                amount: config.amount,
                description: config.label,
                callbackUrl: `${appUrl()}/paiement/retour?t=${tx.id}`,
                customer: {
                    firstname: user.user_metadata?.first_name,
                    lastname: user.user_metadata?.last_name,
                    email: user.email,
                    phone: user.phone || user.user_metadata?.phone,
                },
            })

            await db.from('payment_transactions')
                .update({ provider_ref: fp.id, updated_at: new Date().toISOString() })
                .eq('id', tx.id)

            const { token, url } = await generatePaymentToken(fp.id)
            return res.json({ transactionId: tx.id, token, url })
        } catch (fpErr) {
            logger.error('boost checkout: FedaPay a échoué', fpErr)
            await db.from('payment_transactions')
                .update({ status: 'FAILED', updated_at: new Date().toISOString() })
                .eq('id', tx.id)
            await db.from('profile_boosts')
                .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
                .eq('transaction_id', tx.id)
            return res.status(502).json({ error: 'Le service de paiement est indisponible.' })
        }
    } catch (err) {
        logger.error('boost checkout: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

/** Erreur typée portant le code HTTP à renvoyer — voir initiateFedaPayCheckout. */
class CheckoutError extends Error {
    constructor(public httpStatus: number, message: string) {
        super(message)
    }
}

/**
 * Séquence commune à tout checkout FedaPay : transaction PENDING locale →
 * appel FedaPay → mise à jour de provider_ref → génération du token de
 * paiement, avec passage en FAILED si FedaPay échoue. Utilisée par les
 * checkouts du moteur Missions (packs de crédits, séquestre) ; createCheckout/
 * createBoostCheckout (abonnement Pro, boost) réimplémentent encore cette
 * séquence séparément — non touchés ici pour ne pas risquer de régression sur
 * des flux de paiement déjà en production.
 */
async function initiateFedaPayCheckout(params: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any
    amount: number
    type: string
    label: string
    metadata: Record<string, unknown>
}): Promise<{ transactionId: string; token: string; url: string }> {
    const { user, amount, type, label, metadata } = params

    const { data: tx, error: txErr } = await db
        .from('payment_transactions')
        .insert({ user_id: user.id, amount, currency: 'XOF', provider: 'FEDAPAY', type, status: 'PENDING', metadata })
        .select('id')
        .single()

    if (txErr || !tx) {
        logger.error(`checkout (${type}): insertion transaction échouée`, txErr)
        throw new CheckoutError(500, 'Impossible de créer la transaction.')
    }

    try {
        const fp = await createTransaction({
            amount,
            description: label,
            callbackUrl: `${appUrl()}/paiement/retour?t=${tx.id}`,
            customer: {
                firstname: user.user_metadata?.first_name,
                lastname: user.user_metadata?.last_name,
                email: user.email,
                phone: user.phone || user.user_metadata?.phone,
            },
        })

        await db.from('payment_transactions')
            .update({ provider_ref: fp.id, updated_at: new Date().toISOString() })
            .eq('id', tx.id)

        const { token, url } = await generatePaymentToken(fp.id)
        return { transactionId: tx.id, token, url }
    } catch (fpErr) {
        logger.error(`checkout (${type}): FedaPay a échoué`, fpErr)
        await db.from('payment_transactions')
            .update({ status: 'FAILED', updated_at: new Date().toISOString() })
            .eq('id', tx.id)
        throw new CheckoutError(502, 'Le service de paiement est indisponible.')
    }
}

// ── POST /api/payments/credits/checkout ───────────────────────────────────
export async function createCreditPackCheckout(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user
        if (!user?.id) return res.status(401).json({ error: 'Authentification requise' })

        const plan = String(req.body?.plan || '')
        const config = CREDIT_PACKS[plan]
        if (!config) {
            return res.status(400).json({
                error: 'Forfait invalide',
                message: `plan doit être l'un de : ${Object.keys(CREDIT_PACKS).join(', ')}.`,
            })
        }

        const result = await initiateFedaPayCheckout({
            user,
            amount: config.amount,
            type: 'CREDIT_PACK',
            label: config.label,
            metadata: { plan, credits: config.credits },
        })
        return res.json(result)
    } catch (err) {
        if (err instanceof CheckoutError) return res.status(err.httpStatus).json({ error: err.message })
        logger.error('credit pack checkout: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/missions/:missionId/escrow/checkout ────────────────
// Séquestre "manuel" : ce endpoint ne fait qu'ENCAISSER via FedaPay (comme les
// autres checkouts). Le reversement au prestataire n'est PAS automatisé — un
// admin l'enregistre après un virement Mobile Money fait à la main, via
// releaseMissionEscrow ci-dessous (voir 20260915d_missions_engine_phase3_escrow.sql).
//
// HYPOTHÈSE DE CALCUL (à confirmer avec le métier, pas une certitude) : le
// client paie le prix proposé par le prestataire retenu + les frais de
// séquestre (escrow_fee_bps, 3-5%) ; EmiID garde ces frais, le prestataire
// reçoit le prix plein lors du versement manuel.
export async function createMissionEscrowCheckout(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user
        if (!user?.id) return res.status(401).json({ error: 'Authentification requise' })

        const missionId = String(req.params?.missionId || '')
        if (!missionId) return res.status(400).json({ error: 'missionId requis' })

        // Les deux lectures sont indépendantes (aucune ne dépend du résultat de
        // l'autre) : la candidature ACCEPTED d'une mission est unique par
        // construction (select_mission_applicant rejette toutes les autres),
        // donc filtrer par mission_id + status suffit sans devoir d'abord
        // connaître selected_pro_id.
        const [{ data: mission, error: missionErr }, { data: acceptedApp }] = await Promise.all([
            db.from('missions')
                .select('id, client_id, title, has_escrow, escrow_fee_bps, escrow_status, selected_pro_id')
                .eq('id', missionId)
                .single(),
            db.from('mission_applications')
                .select('proposed_price')
                .eq('mission_id', missionId)
                .eq('status', 'ACCEPTED')
                .single(),
        ])

        if (missionErr || !mission) return res.status(404).json({ error: 'Mission introuvable' })
        if (mission.client_id !== user.id) return res.status(403).json({ error: 'Vous n\'êtes pas le client de cette mission' })
        if (!mission.has_escrow) return res.status(400).json({ error: 'Cette mission n\'a pas de séquestre activé' })
        if (mission.escrow_status !== 'PENDING_PAYMENT') {
            return res.status(400).json({ error: `Séquestre non payable dans son état actuel (${mission.escrow_status})` })
        }
        if (!mission.selected_pro_id) return res.status(400).json({ error: 'Aucun prestataire sélectionné pour cette mission' })

        // "Introuvable" et "prix à 0" sont deux cas distincts : proposed_price
        // >= 0 est autorisé en base (mission gracieuse/promotionnelle), donc
        // <= 0 seul ne suffit pas à détecter une candidature manquante.
        if (!acceptedApp) {
            logger.error(`mission escrow checkout: candidature acceptée introuvable pour la mission ${missionId}`)
            return res.status(500).json({ error: 'Impossible de déterminer le montant du séquestre.' })
        }
        const proposedPrice = Number(acceptedApp.proposed_price)
        if (!Number.isFinite(proposedPrice) || proposedPrice < 0) {
            logger.error(`mission escrow checkout: proposed_price invalide pour la mission ${missionId}`, acceptedApp)
            return res.status(500).json({ error: 'Impossible de déterminer le montant du séquestre.' })
        }

        const escrowFee = Math.ceil((proposedPrice * mission.escrow_fee_bps) / 10000)
        const amount = proposedPrice + escrowFee

        const result = await initiateFedaPayCheckout({
            user,
            amount,
            type: 'MISSION_ESCROW',
            label: `Séquestre EmiID Missions — « ${mission.title} »`,
            metadata: { missionId, proposedPrice, escrowFeeBps: mission.escrow_fee_bps, escrowFee },
        })
        return res.json({ ...result, amount })
    } catch (err) {
        if (err instanceof CheckoutError) return res.status(err.httpStatus).json({ error: err.message })
        logger.error('mission escrow checkout: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/missions/:missionId/escrow/release (admin) ─────────
// Enregistre qu'un admin a reversé MANUELLEMENT (Mobile Money, hors
// application) le prestataire. Ne déclenche AUCUN mouvement d'argent — la
// route est protégée par requireAdmin (paymentRoutes.ts) ; release_mission_escrow
// n'a aucun GRANT public, donc n'est atteignable que via cet endpoint.
export async function releaseMissionEscrow(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const admin = (req as any).user
        if (!admin?.id) return res.status(401).json({ error: 'Authentification requise' })

        const missionId = String(req.params?.missionId || '')
        if (!missionId) return res.status(400).json({ error: 'missionId requis' })

        const { error } = await db.rpc('release_mission_escrow', { p_mission_id: missionId, p_admin_id: admin.id })
        if (error) {
            logger.error(`releaseMissionEscrow: échec pour la mission ${missionId}`, error)
            return res.status(400).json({ error: error.message || 'Impossible de reverser le séquestre.' })
        }

        return res.json({ success: true })
    } catch (err) {
        logger.error('releaseMissionEscrow: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/missions/:missionId/escrow/refund (admin) ──────────
// Enregistre qu'un admin a remboursé MANUELLEMENT (Mobile Money) le client.
export async function refundMissionEscrow(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const admin = (req as any).user
        if (!admin?.id) return res.status(401).json({ error: 'Authentification requise' })

        const missionId = String(req.params?.missionId || '')
        if (!missionId) return res.status(400).json({ error: 'missionId requis' })

        const { error } = await db.rpc('refund_mission_escrow', { p_mission_id: missionId, p_admin_id: admin.id })
        if (error) {
            logger.error(`refundMissionEscrow: échec pour la mission ${missionId}`, error)
            return res.status(400).json({ error: error.message || 'Impossible d\'enregistrer le remboursement.' })
        }

        return res.json({ success: true })
    } catch (err) {
        logger.error('refundMissionEscrow: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/missions/:missionId/dispute/resolve (admin) ────────
// Arbitrage d'un litige par un administrateur (RELEASE_TO_PRO ou REFUND_CLIENT).
export async function resolveMissionDispute(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const admin = (req as any).user
        if (!admin?.id) return res.status(401).json({ error: 'Authentification requise' })

        const missionId = String(req.params?.missionId || '')
        const resolution = String(req.body?.resolution || '')
        const notes = req.body?.notes ? String(req.body.notes) : null

        if (!missionId) return res.status(400).json({ error: 'missionId requis' })
        if (resolution !== 'RELEASE_TO_PRO' && resolution !== 'REFUND_CLIENT') {
            return res.status(400).json({ error: 'resolution invalide (doit être RELEASE_TO_PRO ou REFUND_CLIENT)' })
        }

        const { error } = await db.rpc('resolve_mission_dispute', {
            p_mission_id: missionId,
            p_resolution: resolution,
            p_admin_id: admin.id,
            p_admin_notes: notes,
        })

        if (error) {
            logger.error(`resolveMissionDispute: échec pour la mission ${missionId}`, error)
            return res.status(400).json({ error: error.message || 'Impossible d\'arbitrer le litige.' })
        }

        return res.json({ success: true, resolution })
    } catch (err) {
        logger.error('resolveMissionDispute: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/sponsorship/strike (admin) ─────────────────────────
// Enregistre un manquement (strike) sur un filleul dans le cadre du parrainage.
// Déclenche automatiquement la règle des 2 manquements et l'engagement partagé.
export async function recordSponsorshipStrike(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const admin = (req as any).user
        if (!admin?.id) return res.status(401).json({ error: 'Authentification requise' })

        const sponsoredId = String(req.body?.sponsoredId || '')
        const missionId = req.body?.missionId ? String(req.body.missionId) : null
        const reason = String(req.body?.reason || '')

        if (!sponsoredId) return res.status(400).json({ error: 'sponsoredId requis' })
        if (!reason || reason.trim().length < 10) {
            return res.status(400).json({ error: 'Un motif détaillé (au moins 10 caractères) est requis' })
        }

        const { data, error } = await db.rpc('record_sponsorship_strike', {
            p_sponsored_id: sponsoredId,
            p_mission_id: missionId,
            p_reason: reason.trim(),
            p_admin_id: admin.id,
        })

        if (error) {
            logger.error(`recordSponsorshipStrike: échec pour le professionnel ${sponsoredId}`, error)
            return res.status(400).json({ error: error.message || 'Impossible d\'enregistrer le strike.' })
        }

        return res.json({ success: true, result: data })
    } catch (err) {
        logger.error('recordSponsorshipStrike: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/sourcing/checkout ───────────────────────────────────
// Une entreprise décrit un besoin et paie 15 000 FCFA pour que 3 profils
// vérifiés lui soient proposés sous 24h par un admin (fulfillSourcingRequest
// ci-dessous). Montant fixe, pas de grille comme les autres checkouts.
export async function createSourcingRequestCheckout(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user
        if (!user?.id) return res.status(401).json({ error: 'Authentification requise' })

        const companyName = req.body?.companyName ? String(req.body.companyName).trim() : null
        const title = String(req.body?.title || '').trim()
        const description = String(req.body?.description || '').trim()
        const category = req.body?.category ? String(req.body.category).trim() : null
        const communeId = req.body?.communeId ? String(req.body.communeId) : null

        if (title.length < 3 || title.length > 200) {
            return res.status(400).json({ error: 'Le titre doit faire entre 3 et 200 caractères' })
        }
        if (description.length < 10 || description.length > 5000) {
            return res.status(400).json({ error: 'La description doit faire entre 10 et 5000 caractères' })
        }

        // 1. Demande locale PENDING_PAYMENT (traçabilité).
        const { data: request, error: reqErr } = await db
            .from('sourcing_requests')
            .insert({
                requester_id: user.id,
                company_name: companyName,
                title,
                description,
                category,
                commune_id: communeId,
                status: 'PENDING_PAYMENT',
            })
            .select('id')
            .single()

        if (reqErr || !request) {
            logger.error('sourcing checkout: insertion de la demande échouée', reqErr)
            return res.status(500).json({ error: 'Impossible de créer la demande.' })
        }

        try {
            const result = await initiateFedaPayCheckout({
                user,
                amount: SOURCING_EXPRESS_FEE,
                type: 'SOURCING_EXPRESS',
                label: SOURCING_EXPRESS_LABEL,
                metadata: { requestId: request.id },
            })
            return res.json(result)
        } catch (checkoutErr) {
            // Le paiement n'a pas pu être initié : la demande reste orpheline
            // (PENDING_PAYMENT sans transaction) sinon — on l'annule pour ne
            // pas laisser une entrée qu'un admin pourrait confondre avec une
            // demande active.
            await db.from('sourcing_requests').update({ status: 'CANCELLED', updated_at: new Date().toISOString() }).eq('id', request.id)
            throw checkoutErr
        }
    } catch (err) {
        if (err instanceof CheckoutError) return res.status(err.httpStatus).json({ error: err.message })
        logger.error('sourcing checkout: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/sourcing/:requestId/fulfill (admin) ────────────────
// Un admin sélectionne les 3 profils proposés au demandeur.
export async function fulfillSourcingRequest(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const admin = (req as any).user
        if (!admin?.id) return res.status(401).json({ error: 'Authentification requise' })

        const requestId = String(req.params?.requestId || '')
        const profileIds = Array.isArray(req.body?.profileIds) ? req.body.profileIds.map(String) : []

        if (!requestId) return res.status(400).json({ error: 'requestId requis' })
        if (profileIds.length !== 3) return res.status(400).json({ error: 'Exactement 3 profils sont requis' })

        const { error } = await db.rpc('fulfill_sourcing_request', {
            p_request_id: requestId,
            p_profile_ids: profileIds,
            p_admin_id: admin.id,
        })

        if (error) {
            logger.error(`fulfillSourcingRequest: échec pour la demande ${requestId}`, error)
            return res.status(400).json({ error: error.message || 'Impossible de pourvoir la demande.' })
        }

        return res.json({ success: true })
    } catch (err) {
        logger.error('fulfillSourcingRequest: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/sourcing/:requestId/cancel (admin) ─────────────────
export async function cancelSourcingRequest(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const admin = (req as any).user
        if (!admin?.id) return res.status(401).json({ error: 'Authentification requise' })

        const requestId = String(req.params?.requestId || '')
        if (!requestId) return res.status(400).json({ error: 'requestId requis' })

        const { error } = await db.rpc('cancel_sourcing_request', { p_request_id: requestId, p_admin_id: admin.id })
        if (error) {
            logger.error(`cancelSourcingRequest: échec pour la demande ${requestId}`, error)
            return res.status(400).json({ error: error.message || 'Impossible d\'annuler la demande.' })
        }

        return res.json({ success: true })
    } catch (err) {
        logger.error('cancelSourcingRequest: erreur critique', err)
        return res.status(500).json({ error: 'Erreur interne.' })
    }
}

// ── POST /api/payments/webhook (raw body) ─────────────────────────────────
export async function handleWebhook(req: Request, res: Response) {
    // req.body = Buffer brut (monté avec express.raw avant le parser JSON).
    const raw = req.body as Buffer
    const signature = req.headers['x-fedapay-signature'] as string | undefined

    if (!verifyWebhookSignature(raw, signature)) {
        logger.warn('webhook: signature FedaPay invalide')
        return res.status(400).json({ error: 'Signature invalide' })
    }

    let event: { name?: string; entity?: { id?: string | number; status?: string } }
    try {
        event = JSON.parse(raw.toString('utf8'))
    } catch {
        return res.status(400).json({ error: 'Payload illisible' })
    }

    const entity = event.entity || {}
    const providerRef = entity.id != null ? String(entity.id) : null
    const eventName = event.name || ''
    const approved = eventName === 'transaction.approved' || entity.status === 'approved'
    const failed =
        eventName === 'transaction.canceled' ||
        eventName === 'transaction.declined' ||
        ['canceled', 'declined', 'failed'].includes(entity.status || '')

    // On acquitte toujours (200) pour éviter les rejeux inutiles de FedaPay.
    if (!providerRef) return res.status(200).json({ received: true })

    try {
        const { data: tx } = await db
            .from('payment_transactions')
            .select('id, user_id, status, type, metadata')
            .eq('provider_ref', providerRef)
            .single()

        if (!tx) {
            logger.warn(`webhook: transaction inconnue (ref ${providerRef})`)
            return res.status(200).json({ received: true })
        }
        if (tx.status === 'SUCCESS') {
            return res.status(200).json({ received: true }) // idempotent
        }

        if (approved && tx.type !== 'SUBSCRIPTION_PRO') {
            // Activation AVANT de marquer SUCCESS : sûr pour ces quatre types,
            // tous idempotents à un rejeu du même paiement — CREDIT_PACK,
            // MISSION_ESCROW et SOURCING_EXPRESS via une contrainte/vérification
            // côté RPC (credit_wallet_for_payment, activate_mission_escrow,
            // activate_sourcing_request), PROFILE_BOOST via activateBoost()
            // elle-même (`if (boost.status === 'ACTIVE') return`, déjà keyée par
            // transaction_id). Seul SUBSCRIPTION_PRO n'a aucune protection de ce
            // genre — activateSubscription() rallonge subscriptions.end_date à
            // chaque appel, donc un rejeu la ferait rallonger deux fois si on
            // l'activait avant de marquer SUCCESS.
            if (tx.type === 'CREDIT_PACK') {
                await activateCreditPack(tx.id, tx.user_id, tx.metadata)
            } else if (tx.type === 'MISSION_ESCROW') {
                await activateMissionEscrow(tx.id, tx.metadata)
            } else if (tx.type === 'SOURCING_EXPRESS') {
                await activateSourcingRequest(tx.id, tx.metadata)
            } else {
                await activateBoost(tx.id)
            }
            const { error: successUpdateErr } = await db.from('payment_transactions')
                .update({ status: 'SUCCESS', updated_at: new Date().toISOString() })
                .eq('id', tx.id)
            if (successUpdateErr) {
                // L'activation a déjà réussi (crédits/séquestre accordés, boost
                // actif) mais le marquage SUCCESS a échoué : la transaction
                // reste PENDING alors que l'effet a bien eu lieu. Journalisé
                // pour qu'une réconciliation manuelle le détecte — un rejeu
                // FedaPay ne le corrigera pas tout seul puisque le 200 est déjà
                // renvoyé plus bas, mais réactiver serait sans risque (idempotent).
                logger.error(`webhook: transaction ${tx.id} activée mais passage à SUCCESS échoué`, successUpdateErr)
            }
        } else if (approved) {
            // SUBSCRIPTION_PRO uniquement : ordre historique conservé (marquer
            // SUCCESS avant d'activer) — activateSubscription() n'est pas sûre à
            // rejouer, inverser l'ordre ferait courir le risque inverse
            // (extension de durée en double sur un rejeu webhook).
            await db.from('payment_transactions')
                .update({ status: 'SUCCESS', updated_at: new Date().toISOString() })
                .eq('id', tx.id)

            await activateSubscription(tx.user_id, String(tx.metadata?.plan || 'PRO_MONTHLY'))
        } else if (failed) {
            await db.from('payment_transactions')
                .update({ status: 'FAILED', updated_at: new Date().toISOString() })
                .eq('id', tx.id)
            await db.from('profile_boosts')
                .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
                .eq('transaction_id', tx.id)
        }

        return res.status(200).json({ received: true })
    } catch (err) {
        logger.error('webhook: traitement échoué', err)
        return res.status(500).json({ error: 'Erreur interne' })
    }
}

/** Active (ou prolonge) l'abonnement Pro de l'utilisateur. */
async function activateSubscription(userId: string, plan: string) {
    const config = PLANS[plan] || PLANS.PRO_MONTHLY
    const now = new Date()

    // Prolongation : on repart de la fin en cours si l'abonnement est encore actif.
    const { data: existing } = await db
        .from('subscriptions')
        .select('end_date, status')
        .eq('user_id', userId)
        .maybeSingle()

    let base = now
    if (existing?.status === 'ACTIVE' && existing?.end_date) {
        const currentEnd = new Date(existing.end_date)
        if (currentEnd > now) base = currentEnd
    }
    const endDate = addMonths(base, config.months)

    const { error } = await db
        .from('subscriptions')
        .upsert(
            {
                user_id: userId,
                tier: plan,
                status: 'ACTIVE',
                start_date: now.toISOString(),
                end_date: endDate.toISOString(),
                updated_at: now.toISOString(),
            },
            { onConflict: 'user_id' }
        )

    if (error) {
        logger.error('activateSubscription: upsert échoué', error)
        throw new Error(error.message)
    }
    // Le trigger sync_is_premium met user_profiles.is_premium à jour automatiquement.
}

/** Active le boost associé à une transaction payée. La fenêtre part du paiement. */
async function activateBoost(transactionId: string) {
    const { data: boost } = await db
        .from('profile_boosts')
        .select('id, expires_at, starts_at, status')
        .eq('transaction_id', transactionId)
        .maybeSingle()

    if (!boost) {
        logger.warn(`activateBoost: aucun boost pour la transaction ${transactionId}`)
        return
    }
    if (boost.status === 'ACTIVE') return // idempotent

    // La durée achetée court à partir de la confirmation, pas de la création.
    const createdExpiry = new Date(boost.expires_at).getTime()
    const createdStart = new Date(boost.starts_at).getTime()
    const durationMs = Math.max(createdExpiry - createdStart, 0)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + durationMs)

    const { error } = await db
        .from('profile_boosts')
        .update({
            status: 'ACTIVE',
            starts_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            updated_at: now.toISOString(),
        })
        .eq('id', boost.id)

    if (error) {
        logger.error('activateBoost: mise à jour échouée', error)
        throw new Error(error.message)
    }
}

/**
 * Crédite le portefeuille de crédits (moteur Missions) après paiement confirmé
 * d'un pack. Le portefeuille existe déjà normalement (créé par handle_new_user
 * à l'inscription) mais l'upsert est défensif pour les comptes créés avant la
 * migration 20260915_missions_engine_phase1.sql.
 */
async function activateCreditPack(transactionId: string, userId: string, metadata: Record<string, unknown> | null) {
    const credits = Number(metadata?.credits)
    if (!Number.isFinite(credits) || credits <= 0) {
        logger.error(`activateCreditPack: nombre de crédits invalide pour la transaction ${transactionId}`, metadata)
        return
    }

    // Écriture atomique (verrou FOR UPDATE) + idempotence garantie par un index
    // unique partiel sur credit_transactions.payment_id côté base — voir
    // credit_wallet_for_payment() dans 20260915_missions_engine_phase1.sql.
    // Un rejeu concurrent du webhook FedaPay pour la même transaction échoue
    // sur cet index (23505) au lieu de créditer deux fois.
    const { error } = await db.rpc('credit_wallet_for_payment', {
        p_user_id: userId,
        p_amount: credits,
        p_payment_id: transactionId,
    })

    if (error) {
        if (error.code === '23505') return // déjà crédité pour cette transaction
        logger.error('activateCreditPack: crédit du portefeuille échoué', error)
        throw new Error(error.message)
    }
}

/**
 * Marque le séquestre d'une mission comme détenu (HELD) après paiement
 * confirmé. N'effectue AUCUN mouvement d'argent réel — voir
 * release_mission_escrow() / releaseMissionEscrow() pour le reversement
 * manuel au prestataire. activate_mission_escrow() est idempotente par
 * transaction_id (rejeu webhook sûr).
 */
async function activateMissionEscrow(transactionId: string, metadata: Record<string, unknown> | null) {
    const missionId = String(metadata?.missionId || '')
    if (!missionId) {
        logger.error(`activateMissionEscrow: missionId manquant pour la transaction ${transactionId}`, metadata)
        return
    }

    const { error } = await db.rpc('activate_mission_escrow', {
        p_mission_id: missionId,
        p_transaction_id: transactionId,
    })

    if (error) {
        logger.error('activateMissionEscrow: activation du séquestre échouée', error)
        throw new Error(error.message)
    }
}

/**
 * Marque une demande Sourcing Express comme payée (PAID) après confirmation
 * FedaPay, et notifie les admins qu'elle doit être pourvue sous 24h.
 * activate_sourcing_request() est idempotente par transaction_id.
 */
async function activateSourcingRequest(transactionId: string, metadata: Record<string, unknown> | null) {
    const requestId = String(metadata?.requestId || '')
    if (!requestId) {
        logger.error(`activateSourcingRequest: requestId manquant pour la transaction ${transactionId}`, metadata)
        return
    }

    const { error } = await db.rpc('activate_sourcing_request', {
        p_request_id: requestId,
        p_transaction_id: transactionId,
    })

    if (error) {
        logger.error('activateSourcingRequest: activation de la demande échouée', error)
        throw new Error(error.message)
    }
}
