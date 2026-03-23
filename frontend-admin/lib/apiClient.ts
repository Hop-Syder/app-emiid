/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Utilitaire pour effectuer des requêtes authentifiées vers le Backend
 * @created 2026-03-23
*/

import { createClient } from './supabase/client';

const supabase = createClient();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
  };

  const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${cleanBase}${cleanEndpoint}`;
  
  return fetch(url, {
    ...options,
    headers,
  });
};

export const fetchPublic = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${cleanBase}${cleanEndpoint}`;
  
  return fetch(url, {
    ...options,
    headers,
  });
};
