/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Configuration du client Supabase pour le Dashboard Admin
 * @created 2026-03-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./env";

export function createClient() {
  // Variables lues strictement : une absence lève une erreur nommée, plutôt
  // qu'un client silencieusement dépourvu de clé.
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
