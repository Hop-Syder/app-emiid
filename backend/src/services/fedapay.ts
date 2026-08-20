/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Service FedaPay (REST, sans dépendance) — création de transaction,
 *              génération du token de paiement et vérification de la signature
 *              des webhooks. Mobile Money Bénin (MTN / Moov / Celtiis).
 *
 *              Variables d'environnement :
 *                FEDAPAY_SECRET_KEY     (sk_sandbox_… ou sk_live_…)
 *                FEDAPAY_WEBHOOK_SECRET (secret de signature du webhook)
 *                FEDAPAY_BASE_URL       (déf. https://sandbox-api.fedapay.com/v1)
 * @created 2026-08-23
 */

import crypto from 'crypto'
import { logger } from '../utils/logger'

const BASE_URL = () => process.env.FEDAPAY_BASE_URL || 'https://sandbox-api.fedapay.com/v1'
const SECRET_KEY = () => process.env.FEDAPAY_SECRET_KEY || ''

async function fedapayFetch(path: string, init: RequestInit = {}): Promise<Record<string, unknown>> {
    const res = await fetch(`${BASE_URL()}${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${SECRET_KEY()}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    })
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) {
        throw new Error(`FedaPay ${res.status}: ${JSON.stringify(json)}`)
    }
    return json
}

export interface CreateTxParams {
    amount: number
    description: string
    callbackUrl: string
    customer: { firstname?: string; lastname?: string; email?: string; phone?: string }
}

/** Crée une transaction FedaPay et renvoie son id (à stocker comme provider_ref). */
export async function createTransaction(p: CreateTxParams): Promise<{ id: string }> {
    const body = {
        description: p.description,
        amount: p.amount,
        currency: { iso: 'XOF' },
        callback_url: p.callbackUrl,
        customer: {
            firstname: p.customer.firstname || 'Client',
            lastname: p.customer.lastname || 'EmiID',
            ...(p.customer.email ? { email: p.customer.email } : {}),
            ...(p.customer.phone ? { phone_number: { number: p.customer.phone, country: 'bj' } } : {}),
        },
    }
    const json = await fedapayFetch('/transactions', { method: 'POST', body: JSON.stringify(body) })
    const tx = (json['v1/transaction'] || json['transaction'] || json) as { id?: string | number }
    if (!tx?.id) throw new Error('FedaPay: réponse sans id de transaction')
    return { id: String(tx.id) }
}

/** Génère le token/URL de paiement pour rediriger l'utilisateur. */
export async function generatePaymentToken(txId: string): Promise<{ token: string; url: string }> {
    const json = await fedapayFetch(`/transactions/${txId}/token`, { method: 'POST' })
    const token = String(json['token'] || '')
    const url = String(json['url'] || '')
    if (!token || !url) throw new Error('FedaPay: token de paiement manquant')
    return { token, url }
}

/**
 * Vérifie la signature d'un webhook FedaPay.
 * En-tête `x-fedapay-signature` au format « t=timestamp,s=signature » ;
 * signature = HMAC-SHA256(`${t}.${rawBody}`, FEDAPAY_WEBHOOK_SECRET).
 */
export function verifyWebhookSignature(rawBody: Buffer | string, signatureHeader?: string): boolean {
    const secret = process.env.FEDAPAY_WEBHOOK_SECRET
    if (!secret || !signatureHeader) return false

    const parts: Record<string, string> = {}
    for (const kv of signatureHeader.split(',')) {
        const [k, v] = kv.split('=').map((s) => s.trim())
        if (k && v) parts[k] = v
    }
    const t = parts['t']
    const s = parts['s']
    if (!t || !s) return false

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
    const expected = crypto.createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')

    try {
        const a = Buffer.from(expected)
        const b = Buffer.from(s)
        return a.length === b.length && crypto.timingSafeEqual(a, b)
    } catch (err) {
        logger.warn('FedaPay: échec de comparaison de signature', err)
        return false
    }
}
