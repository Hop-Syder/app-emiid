/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Configuration du client Supabase pour le Backend avec support WebSocket
 * @created 2026-01-04
 * @updated 2026-06-02
*/

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
import { logger } from '../utils/logger';
import type { Database } from '../types/database.types';

dotenv.config();

// Injection globale pour les bibliothèques qui cherchent WebSocket nativement.
// On force l'utilisation de 'ws' car l'implémentation native de Node.js 20+ 
// peut être instable ou expérimentale dans certains environnements (comme Render).
(globalThis as any).WebSocket = ws;

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

try {
  const parts = supabaseServiceRoleKey.split('.');
  if (parts.length === 3) {
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    logger.info(`[Supabase Admin Key Role]: ${decoded.role || 'unknown'}`);
  } else {
    logger.warn('[Supabase Admin Key]: Format de clé invalide (pas 3 parties JWT)');
  }
} catch (e) {
  logger.error('[Supabase Admin Key]: Impossible de décoder le JWT');
}

if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  logger.error('Configuration invalide: SUPABASE_URL doit commencer par https://.', supabaseUrl);
  throw new Error('Configuration Supabase invalide: SUPABASE_URL');
}

// Configuration standard
// L'injection globale ci-dessus s'occupe du support WebSocket automatiquement
const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, clientOptions);
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, clientOptions);

// Cast non typé partagé : `Database` (types/database.types.ts) est généré depuis
// le schéma distant et ne connaît donc pas les tables ajoutées par des
// migrations locales pas encore appliquées/régénérées (ex. moteur Missions —
// credit_wallets, missions, mission_applications, credit_transactions). Import
// à préférer à un cast `as any` local dupliqué dans chaque controller/route ;
// à supprimer une fois `npm run gen:types` relancé après application de ces
// migrations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdminUntyped = supabaseAdmin as any;
