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
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL ou Anon Key manquante dans les variables d\'environnement.');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
