/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Utilitaire pour effectuer des requêtes authentifiées vers le Backend
 * @created 2026-01-04
*/

import { createClient } from './supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

const getSupabaseClient = () => createClient();

const buildRequestId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

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
  const supabase = getSupabaseClient();
  // 1. Récupérer la session active via le client Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  const requestId = buildRequestId();

  // 2. Préparer les headers avec le token
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'x-request-id': requestId,
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
  };

  // 3. Exécuter la requête vers l'URL du Backend
  const url = buildTargetUrl(endpoint);
  
  const finalOptions: RequestInit = {
    cache: 'no-store', // Évite la mise en cache agressive du navigateur
    ...options,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    if (response.status === 502 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("emiid:backend-down"));
    }
    return response;
  } catch (err) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("emiid:backend-down"));
    }
    throw err;
  }
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
  
  const finalOptions: RequestInit = {
    cache: 'no-store', // Évite la mise en cache agressive du navigateur
    ...options,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    if (response.status === 502 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("emiid:backend-down"));
    }
    return response;
  } catch (err) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("emiid:backend-down"));
    }
    throw err;
  }
};

export const readApiError = async (response: Response, fallbackMessage: string) => {
  try {
    const data = await response.json();

    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error;
    }

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
};
