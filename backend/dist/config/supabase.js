"use strict";
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Configuration du client Supabase pour le Backend
 * @created 2026-01-04
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
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
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    logger_1.logger.error('Configuration invalide: SUPABASE_URL doit commencer par https://.', supabaseUrl);
    throw new Error('Configuration Supabase invalide: SUPABASE_URL');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey);
