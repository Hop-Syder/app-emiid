/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Types TypeScript centralisés pour l'application frontend-user
 * @created 2026-03-26
 */

// ==================== TYPES UTILISATEUR ====================

export interface UserProfile {
    id: string;
    user_id?: string;
    first_name: string;
    last_name: string;
    email?: string;
    avatar_url?: string;
    bio?: string;
    role?: string;
    specialty?: string;
    category?: string;
    activity_domain?: string;
    country_id?: string;
    city?: string;
    phone?: string;
    website?: string;
    is_verified?: boolean;
    is_premium?: boolean;
    is_published?: boolean;
    pin_enabled?: boolean;
    tags?: string[];
}

export interface PublicProfile {
    id: string;
    name: string;
    role: string;
    location: string;
    avatar: string;
    specialty: string;
    category?: string;
    verified: boolean;
    premium: boolean;
    followers: number;
    isFollowed?: boolean;
    tags?: string[];
}

// ==================== TYPES AUTHENTIFICATION ====================

export interface AuthSession {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: AuthUser;
}

export interface AuthUser {
    id: string;
    email: string;
    phone?: string;
    created_at: string;
}

// ==================== TYPES MESSAGERIE ====================

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
    type?: 'text' | 'image' | 'file' | 'audio';
    reactions?: string[];
}

export interface Conversation {
    id: string;
    otherUser: {
        id: string;
        name: string;
        avatar: string | null;
        role: string | null;
        isOnline: boolean;
        lastSeen: string | null;
    };
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
    isPinned?: boolean;
    isMuted?: boolean;
}

// ==================== TYPES PAYS & LOCALISATION ====================

export interface Country {
    id: string;
    name: string;
    iso_code: string;
    phone_code: string;
}

export interface LocationData {
    country: {
        name: string;
        isoCode: string;
    };
    city: string;
}

// ==================== TYPES API ====================

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
}

// ==================== TYPES FORMULAIRES ====================

export interface ProfileFormData {
    first_name: string;
    last_name: string;
    role: string;
    category: string;
    specialty: string;
    bio: string;
    phone: string;
    email: string;
    website: string;
    country_id: string;
    city: string;
    tags: string[];
    is_published: boolean;
}

export interface FollowData {
    user_id: string;
    followed_id: string;
    created_at: string;
    note?: string;
}

// ==================== TYPES STATS & DASHBOARD ====================

export interface DashboardStats {
    totalEntrepreneurs: number;
    verifiedMembers: number;
    countriesCovered: number;
    premiumMembers: number;
    categoryCounts?: Record<string, number>;
}

export interface EntrepreneurStats {
    id: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    city?: string;
    countries?: {
        name: string;
        iso_code?: string;
    };
    avatar_url?: string;
    specialty?: string;
    category?: string;
    is_verified?: boolean;
    is_premium?: boolean;
    followers_count?: number;
    tags?: string[];
    card_variant?: string;
}

// ==================== TYPES NOTIFICATIONS ====================

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    content: string;
    type: string;
    is_read: boolean;
    link?: string;
    created_at: string;
}

// ==================== TYPES RÉFÉRENCES ====================

export interface Sector {
    id: string;
    name: string;
    code?: string;
}

export interface Profession {
    id: string;
    name: string;
    sector_id?: string;
}

// ==================== TYPE GUARDS ====================

export function isUserProfile(data: unknown): data is UserProfile {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'first_name' in data &&
        'last_name' in data
    )
}

export function isMessage(data: unknown): data is Message {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'conversation_id' in data &&
        'sender_id' in data &&
        'content' in data
    )
}
