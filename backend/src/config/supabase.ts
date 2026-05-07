/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Configuration du client Supabase pour le Backend avec support WebSocket
 * @created 2026-01-04
 * @updated 2026-05-07
*/

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
import { logger } from '../utils/logger';

dotenv.config();

function requireEnv(name: string): string {
  const value = (process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Variable d'environnement obligatoire manquante: ${name}`);
  }
  return value;
}

const supabaseUrl = requireEnv('SUPABASE_URL');
const supabaseAnonKey = requireEnv('SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  logger.error('Configuration invalide: SUPABASE_URL doit commencer par https://.', supabaseUrl);
  throw new Error('Configuration Supabase invalide: SUPABASE_URL');
}

// Configuration pour supporter les WebSockets sur les anciennes versions de Node.js
const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  },
  global: {
    fetch: globalThis.fetch,
  },
  realtime: {
    transport: ws,
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, clientOptions);
