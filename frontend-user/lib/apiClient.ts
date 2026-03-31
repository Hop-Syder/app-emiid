/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Utilitaire pour effectuer des requêtes authentifiées vers le Backend
 * @created 2026-01-04
*/

import { createClient } from './supabase/client';

const supabase = createClient();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
const DEV_AUTH_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
const DEV_AUTH_BYPASS_USER_ID = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS_USER_ID;
const DEV_AUTH_BYPASS_USER_EMAIL = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS_USER_EMAIL;

const buildTargetUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  if (typeof window !== 'undefined') {
    return `/api/proxy${cleanEndpoint}`;
  }

  const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  return `${cleanBase}${cleanEndpoint}`;
};

/**
 * Wrapper autour de fetch qui injecte automatiquement le token d'accès Supabase.
 * @param endpoint - Le chemin de l'API (ex: '/api/auth/me')
 * @param options - Options standards de fetch
 */
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // 1. Récupérer la session active via le client Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const useDevBypass = !session?.access_token && DEV_AUTH_BYPASS && DEV_AUTH_BYPASS_USER_ID;
  
  // 2. Préparer les headers avec le token
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    ...(useDevBypass ? {
      'x-dev-user-id': DEV_AUTH_BYPASS_USER_ID,
      'x-dev-user-email': DEV_AUTH_BYPASS_USER_EMAIL || `${DEV_AUTH_BYPASS_USER_ID}@dev.local`,
    } : {}),
  };

  // 3. Exécuter la requête vers l'URL du Backend
  const url = buildTargetUrl(endpoint);
  
  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Wrapper autour de fetch pour les routes publiques (sans auth).
 */
export const fetchPublic = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const url = buildTargetUrl(endpoint);
  
  return fetch(url, {
    ...options,
    headers,
  });
};
