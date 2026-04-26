/**
 * Utility functions for input validation
 */

// UUID regex pattern
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID
 */
export function isValidUUID(value: string): boolean {
    return UUID_PATTERN.test(value);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, ''); // Remove < and > to prevent HTML injection
}
