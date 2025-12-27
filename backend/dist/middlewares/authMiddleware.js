"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL or Anon Key is missing in backend .env');
}
/**
 * Middleware to protect routes using Supabase Auth.
 * Expects a Bearer token in the Authorization header.
 * Attaches the user object to req.user.
 */
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Missing Bearer token' });
    }
    try {
        // Create a temporary client scoped to this request/user
        const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
            auth: {
                persistSession: false,
            }
        });
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            console.error('Auth Error:', error);
            return res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
        }
        // Attach user to request for downstream controllers
        req.user = user;
        next();
    }
    catch (err) {
        console.error('Unexpected Auth Middleware Error:', err);
        res.status(500).json({ error: 'Internal Server Error during Authentication' });
    }
};
exports.requireAuth = requireAuth;
