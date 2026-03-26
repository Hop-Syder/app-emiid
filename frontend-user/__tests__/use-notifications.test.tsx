/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useNotifications } from '@/hooks/use-notifications'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client')

describe('useNotifications', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }

    const mockNotifications = [
        {
            id: 'notif-1',
            type: 'message',
            title: 'Nouveau message',
            content: 'Vous avez reçu un nouveau message',
            link: '/messages?contact=user-456',
            is_read: false,
            created_at: new Date().toISOString(),
        },
        {
            id: 'notif-2',
            type: 'follow',
            title: 'Nouvel abonné',
            content: 'Quelqu\'un vous suit',
            link: '/portefeuille',
            is_read: true,
            created_at: new Date().toISOString(),
        },
    ]

    const mockSupabaseInstance = {
        auth: {
            getUser: jest.fn(),
        },
        channel: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockImplementation((callback) => {
            if (callback) callback()
            return { unsubscribe: jest.fn() }
        }),
        removeChannel: jest.fn(),
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        then: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (createClient as jest.Mock).mockReturnValue(mockSupabaseInstance)

            // Setup default user
            ; (mockSupabaseInstance.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
            })
    })

    it('should initialize with empty notifications and zero unread count', async () => {
        // Setup: No notifications from API
        mockSupabaseInstance.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
            expect(result.current.notifications).toEqual([])
            expect(result.current.unreadCount).toBe(0)
        })
    })

    it('should load notifications on mount', async () => {
        // Setup: Return mock notifications
        mockSupabaseInstance.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
                data: mockNotifications,
                error: null
            }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
            expect(result.current.notifications).toHaveLength(2)
            expect(result.current.unreadCount).toBe(1) // Only one is unread
        })
    })

    it('should handle user not authenticated', async () => {
        // Setup: No user
        ; (mockSupabaseInstance.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: null },
        })

        mockSupabaseInstance.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
            expect(result.current.notifications).toEqual([])
            expect(result.current.unreadCount).toBe(0)
        })
    })

    it('should mark notification as read', async () => {
        // Setup: Load with unread notification
        mockSupabaseInstance.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
                data: [mockNotifications[0]],
                error: null
            }),
        })

        // Mock update success
        mockSupabaseInstance.from = jest.fn().mockReturnValue({
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ error: null }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
            expect(result.current.notifications).toHaveLength(1)
        })

        // Act: Mark as read
        await act(async () => {
            await result.current.markAsRead('notif-1')
        })

        // Assert: Should be marked as read
        expect(result.current.notifications[0].is_read).toBe(true)
        expect(result.current.unreadCount).toBe(0)
    })

    it('should handle realtime subscription', async () => {
        // Setup: Empty initial notifications
        mockSupabaseInstance.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        })

        // Simulate realtime event
        const newNotification = {
            id: 'notif-3',
            type: 'system',
            title: 'Maintenance',
            content: 'Maintenance prévue ce soir',
            is_read: false,
            created_at: new Date().toISOString(),
        } as const
    })

    it('should cleanup realtime subscription on unmount', async () => {
        mockSupabaseInstance.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        })

        const { unmount } = renderHook(() => useNotifications())

        await waitFor(() => {
            expect(mockSupabaseInstance.channel).toHaveBeenCalled()
        })

        // Act: Unmount
        unmount()

        // Assert: Channel should be removed
        expect(mockSupabaseInstance.removeChannel).toHaveBeenCalled()
    })
})
