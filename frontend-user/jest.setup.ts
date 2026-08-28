import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
            getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
            onAuthStateChange: jest.fn(() => ({
                subscription: jest.fn(),
            })),
            signUp: jest.fn(),
            signIn: jest.fn(),
            signOut: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            lt: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            like: jest.fn().mockReturnThis(),
            ilike: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            contains: jest.fn().mockReturnThis(),
            containedBy: jest.fn().mockReturnThis(),
            rangeGt: jest.fn().mockReturnThis(),
            rangeGte: jest.fn().mockReturnThis(),
            rangeLt: jest.fn().mockReturnThis(),
            rangeLte: jest.fn().mockReturnThis(),
            rangeAdjacent: jest.fn().mockReturnThis(),
            overlaps: jest.fn().mockReturnThis(),
            textSearch: jest.fn().mockReturnThis(),
            match: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            filter: jest.fn().mockReturnThis(),
            single: jest.fn(),
            maybeSingle: jest.fn(),
            limit: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            abortSignal: jest.fn().mockReturnThis(),
            then: jest.fn(),
        })),
        channel: jest.fn(() => ({
            on: jest.fn().mockReturnThis(),
            subscribe: jest.fn().mockReturnThis(),
            unsubscribe: jest.fn(),
        })),
        removeChannel: jest.fn(),
    }),
}))

// Mock fetchWithAuth
jest.mock('@/lib/apiClient', () => ({
    fetchWithAuth: jest.fn(),
    fetchPublic: jest.fn(),
}))

// Mock Sonner toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
        loading: jest.fn(),
        promise: jest.fn(),
    },
    Toaster: () => null,
}))

// Reset all mocks after each test
afterEach(() => {
    jest.clearAllMocks()
})
