/**
 * Admin authorization utilities
 */

const ADMIN_ROLE_PATTERN = /^(admin|administrator|administrateur|superadmin)$/i;

/**
 * Check if user has admin role from auth metadata
 */
export function isAdminFromAuthMetadata(user: any): boolean {
    const appMetadata = user?.app_metadata || {};
    const roles = [
        appMetadata.role,
        appMetadata.app_role,
        ...(Array.isArray(appMetadata.roles) ? appMetadata.roles : []),
    ].filter(Boolean);

    return roles.some((role) => typeof role === 'string' && ADMIN_ROLE_PATTERN.test(role.trim()));
}

/**
 * Check if user email is in admin allowlist
 */
export function isAdminFromAllowlist(email?: string | null): boolean {
    const configuredEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

    return !!email && configuredEmails.includes(email.toLowerCase());
}

/**
 * Comprehensive admin check - combines all methods
 */
export async function verifyAdminAccess(user: any, profile: any): Promise<boolean> {
    // Method 1: Check auth metadata (most reliable)
    if (isAdminFromAuthMetadata(user)) {
        return true;
    }

    // Method 2: Check email allowlist (for legacy admins)
    if (isAdminFromAllowlist(user?.email)) {
        return true;
    }

    // Method 3: Check profile email + role (legacy method, more restrictive)
    if (
        profile?.email &&
        isAdminFromAllowlist(profile.email) &&
        typeof profile.role === 'string' &&
        ADMIN_ROLE_PATTERN.test(profile.role.trim())
    ) {
        return true;
    }

    return false;
}
