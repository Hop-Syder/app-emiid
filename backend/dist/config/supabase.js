"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Configuration du client Supabase pour le Backend avec support WebSocket
 * @created 2026-01-04
 * @updated 2026-06-02
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const ws_1 = __importDefault(require("ws"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
// Injection globale pour les bibliothèques qui cherchent WebSocket nativement.
// On force l'utilisation de 'ws' car l'implémentation native de Node.js 20+ 
// peut être instable ou expérimentale dans certains environnements (comme Railway).
globalThis.WebSocket = ws_1.default;
function requireEnv(name) {
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
        const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
        logger_1.logger.info(`[Supabase Admin Key Role]: ${payload}`);
    }
    else {
        logger_1.logger.warn('[Supabase Admin Key]: Format de clé invalide (pas 3 parties JWT)');
    }
}
catch (e) {
    logger_1.logger.error('[Supabase Admin Key]: Impossible de décoder le JWT', e);
}
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    logger_1.logger.error('Configuration invalide: SUPABASE_URL doit commencer par https://.', supabaseUrl);
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
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, clientOptions);
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, clientOptions);
