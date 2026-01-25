/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Client API pour le Panel Admin
 * @created 2026-01-25
*/

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const adminFetch = async (endpoint: string, options: RequestInit = {}) => {
    // Dans un vrai projet, on ajouterait ici le token admin
    const url = `${API_URL}${endpoint}`;
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
};
