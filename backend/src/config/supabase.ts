/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Configuration du client Supabase pour le Backend
 * @created 2026-01-04
*/

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
