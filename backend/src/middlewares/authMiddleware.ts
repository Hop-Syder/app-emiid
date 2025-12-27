import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

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
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
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
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
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
    (req as any).user = user;
    
    next();
  } catch (err) {
    console.error('Unexpected Auth Middleware Error:', err);
    res.status(500).json({ error: 'Internal Server Error during Authentication' });
  }
};
