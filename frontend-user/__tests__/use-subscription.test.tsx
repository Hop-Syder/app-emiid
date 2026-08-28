/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests unitaires du hook useSubscription — chargement abonnement,
 *              calcul isPro, factures, autoRenew et résiliation (RPC).
 * @created 2026-08-26
 * 🌐 ceo.nexuspartners.xyz
 */

/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useSubscription } from '@/hooks/use-subscription'

const FUTURE_END = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()

/** Construit un client Supabase mocké avec des réponses par table. */
function makeSupabaseMock({
    user,
    subscription,
    transactions = [],
}: {
    user: { id: string } | null
    subscription?: Record<string, unknown> | null
    transactions?: Record<string, unknown>[]
}) {
    const rpc = jest.fn().mockResolvedValue({ error: null })

    const builderFor = (table: string) => {
        if (table === 'payment_transactions') {
            return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({ data: transactions }),
            }
        }
        if (table === 'subscriptions') {
            return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                maybeSingle: jest.fn().mockResolvedValue({ data: subscription ?? null }),
            }
        }
        // profile_analytics / profile_views
        return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
                data: table === 'profile_analytics' ? { whatsapp_clicks: 1, call_clicks: 2, shares_count: 3 } : null,
            }),
            ...(table === 'profile_views'
                ? { maybeSingle: undefined as unknown, limit: jest.fn().mockResolvedValue({ count: 7 }) }
                : {}),
        }
    }

    const supabase = {
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: jest.fn((table: string) => builderFor(table)),
        rpc,
    }

    // profile_views utilise select(..., {count}) sans maybeSingle → il faut une
    // terminaison résoluble. On remplace après coup.
    const originalFrom = supabase.from
    supabase.from = jest.fn((table: string) => {
        const builder = originalFrom(table)
        if (table === 'profile_views') {
            const b = builder as unknown as Record<string, jest.Mock>
            b.limit = jest.fn().mockResolvedValue({ count: 7 })
        }
        return builder
    })

    return { supabase, rpc }
}

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => (globalThis as unknown as { __supabaseMock: object }).__supabaseMock,
}))

function setSupabaseMock(mock: object) {
    ;(globalThis as unknown as { __supabaseMock: object }).__supabaseMock = mock
}

describe('useSubscription', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renvoie isPro=false et aucune donnée si non connecté', async () => {
        setSupabaseMock(makeSupabaseMock({ user: null }))

        const { result } = renderHook(() => useSubscription())

        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.isPro).toBe(false)
        expect(result.current.subscription).toBeNull()
    })

    it('charge un abonnement Pro actif avec ses factures', async () => {
        const { supabase } = makeSupabaseMock({
            user: { id: 'u1' },
            subscription: { tier: 'PRO_MONTHLY', status: 'ACTIVE', end_date: FUTURE_END, auto_renew: false },
            transactions: [
                { id: 't1', amount: 1000, currency: 'XOF', status: 'SUCCESS', created_at: '2026-08-01T10:00:00Z' },
            ],
        })
        setSupabaseMock(supabase)

        const { result } = renderHook(() => useSubscription())

        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.isPro).toBe(true)
        expect(result.current.subscription?.tier).toBe('PRO_MONTHLY')
        expect(result.current.invoices).toHaveLength(1)
        expect(result.current.invoices[0]).toMatchObject({ id: 't1', amount: 1000, status: 'SUCCESS' })
    })

    it("bascule l'autoRenew via la RPC et met à jour l'état local", async () => {
        const { supabase, rpc } = makeSupabaseMock({
            user: { id: 'u1' },
            subscription: { tier: 'PRO_ANNUAL', status: 'ACTIVE', end_date: FUTURE_END, auto_renew: false },
        })
        setSupabaseMock(supabase)

        const { result } = renderHook(() => useSubscription())
        await waitFor(() => expect(result.current.loading).toBe(false))

        let toggled = false
        await act(async () => {
            toggled = await result.current.toggleAutoRenew(true)
        })

        expect(toggled).toBe(true)
        expect(rpc).toHaveBeenCalledWith('set_auto_renew', { p_enabled: true })
        expect(result.current.subscription?.autoRenew).toBe(true)
    })

    it('résilie via la RPC et recharge l\'abonnement', async () => {
        const { supabase, rpc } = makeSupabaseMock({
            user: { id: 'u1' },
            subscription: { tier: 'PRO_MONTHLY', status: 'ACTIVE', end_date: FUTURE_END, auto_renew: true },
        })
        setSupabaseMock(supabase)

        const fromCallsBefore = (supabase.from as jest.Mock).mock.calls.filter(([t]) => t === 'subscriptions').length

        const { result } = renderHook(() => useSubscription())
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.isPro).toBe(true)

        let cancelled = false
        await act(async () => {
            cancelled = await result.current.cancelSubscription()
        })

        expect(cancelled).toBe(true)
        expect(rpc).toHaveBeenCalledWith('cancel_my_subscription')
        // Le rechargement a bien réinterrogé la table subscriptions.
        const fromCallsAfter = (supabase.from as jest.Mock).mock.calls.filter(([t]) => t === 'subscriptions').length
        expect(fromCallsAfter).toBeGreaterThan(fromCallsBefore)
    })
})
