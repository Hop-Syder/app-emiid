/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Extension des types Express pour inclure l'utilisateur Supabase et les métadonnées de requête
 * @created 2026-01-04
 * @updated 2026-05-07
*/

import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      authToken?: string;
      requestId?: string;
    }
  }
}

export {};
