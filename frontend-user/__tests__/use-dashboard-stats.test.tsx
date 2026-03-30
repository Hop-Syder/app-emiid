/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

describe('useDashboardStats', () => {
    const originalConsoleError = console.error

    beforeEach(() => {
        console.error = jest.fn()
    })

    afterEach(() => {
        console.error = originalConsoleError
    })

    it('does not mark stats as loaded when the first request fails', async () => {
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

        expect(result.current.statsLoaded).toBe(false)
        expect(result.current.stats).toBeNull()
        expect(result.current.statsError).toBe('Impossible de charger les statistiques pour le moment.')
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
    })
})
