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
import { supabaseAdmin } from '../config/supabase'
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

// Le client typé ne connaît pas encore les tables de monétisation → cast souple.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

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

        if (approved) {
            await db.from('payment_transactions')
                .update({ status: 'SUCCESS', updated_at: new Date().toISOString() })
                .eq('id', tx.id)

            if (tx.type === 'PROFILE_BOOST') {
                await activateBoost(tx.id)
            } else {
                await activateSubscription(tx.user_id, String(tx.metadata?.plan || 'PRO_MONTHLY'))
            }
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
