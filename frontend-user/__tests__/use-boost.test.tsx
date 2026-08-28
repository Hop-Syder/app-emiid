/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests unitaires du hook useBoost — grille tarifaire, validation
 *              de la cible avant checkout, référentiel des communes.
 * @created 2026-08-26
 * 🌐 ceo.nexuspartners.xyz
 */

/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useBoost, plansForScope, BOOST_PLANS } from '@/hooks/use-boost'

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null }),
        })),
    }),
}))

describe('grille tarifaire boosts', () => {
    it('couvre les 6 forfaits avec des montants entiers FCFA', () => {
        expect(Object.keys(BOOST_PLANS)).toHaveLength(6)
        expect(BOOST_PLANS.COMMUNE_48H.amount).toBe(500)
        expect(BOOST_PLANS.DEPARTMENT_30D.amount).toBe(10000)
    })

    it('plansForScope ne renvoie que les forfaits de la portée demandée', () => {
        const commune = plansForScope('COMMUNE')
        expect(commune).toHaveLength(3)
        commune.forEach((id) => expect(BOOST_PLANS[id].scope).toBe('COMMUNE'))

        const department = plansForScope('DEPARTMENT')
        expect(department).toHaveLength(3)
        department.forEach((id) => expect(BOOST_PLANS[id].scope).toBe('DEPARTMENT'))
    })
})

describe('useBoost', () => {
    it("exige une cible avant de lancer le checkout d'un boost communal", async () => {
        const { result } = renderHook(() => useBoost())

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.error).toBeNull()

        // Sans cible : le hook refuse et expose l'erreur, sans jamais rediriger.
        await act(async () => {
            await result.current.startBoostCheckout('COMMUNE_48H', '')
        })

        expect(result.current.error).toMatch(/commune/i)
        expect(result.current.checkoutLoading).toBeNull()
    })
})
