/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Extension des types Express pour inclure l'utilisateur Supabase
 * @created 2026-01-04
*/

import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: User; // On ajoute la propriété optionnelle user
    }
  }
}
