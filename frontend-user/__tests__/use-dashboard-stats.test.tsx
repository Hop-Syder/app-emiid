/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardStats, EMPTY_DASHBOARD_STATS } from '@/hooks/use-dashboard-stats'

describe('useDashboardStats', () => {
    const originalConsoleWarn = console.warn

    beforeEach(() => {
        console.warn = jest.fn()
    })

    afterEach(() => {
        console.warn = originalConsoleWarn
    })

    it('falls back to zero stats when the first request fails (so the dashboard still renders)', async () => {
        const fetcher = jest.fn().mockRejectedValue(new Error('network error'))

        const { result } = renderHook(() =>
            useDashboardStats({
                endpoint: '/api/dashboard-user/stats',
                fetcher,
                refreshIntervalMs: 30000,
            }),
        )

        await waitFor(() => {
            expect(result.current.statsLoading).toBe(false)
        })

        // On affiche toujours un dashboard (valeurs à zéro) même quand le backend est injoignable
        expect(result.current.statsLoaded).toBe(true)
        expect(result.current.stats).toEqual(EMPTY_DASHBOARD_STATS)
        expect(result.current.statsError).toBe('Impossible de charger les statistiques pour le moment.')
        expect(result.current.isSyncing).toBe(false)
    })

    it('marks stats as loaded after a successful request', async () => {
        const stats = {
            totalEntrepreneurs: 12,
            verifiedMembers: 8,
            countriesCovered: 4,
            premiumMembers: 3,
        }

        const fetcher = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => stats,
        } as Response)

        const { result } = renderHook(() =>
            useDashboardStats({
                endpoint: '/api/dashboard-user/stats',
                fetcher,
                refreshIntervalMs: 30000,
            }),
        )

        await waitFor(() => {
            expect(result.current.statsLoaded).toBe(true)
        })

        expect(result.current.statsLoading).toBe(false)
        expect(result.current.stats).toEqual(stats)
        expect(result.current.statsError).toBeNull()
        expect(result.current.isSyncing).toBe(false)
    })
})
