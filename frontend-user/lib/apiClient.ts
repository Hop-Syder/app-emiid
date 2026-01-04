/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Utilitaire pour effectuer des requêtes authentifiées vers le Backend
 * @created 2026-01-04
*/

import { createClient } from './supabase/client';

const supabase = createClient();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Wrapper autour de fetch qui injecte automatiquement le token d'accès Supabase.
 * @param endpoint - Le chemin de l'API (ex: '/api/auth/me')
 * @param options - Options standards de fetch
 */
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // 1. Récupérer la session active via le client Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  // 2. Préparer les headers avec le token
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
  };

  // 3. Exécuter la requête vers l'URL du Backend
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers,
  });
};
