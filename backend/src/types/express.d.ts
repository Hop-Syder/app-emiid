/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Extension du type Request d'Express pour inclure l'utilisateur authentifié
 * @created 2026-05-11
*/

import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        id: string;
        email?: string;
      };
    }
  }
}
