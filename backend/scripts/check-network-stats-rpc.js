#!/usr/bin/env node
/**
 * Vérifie que la RPC `get_network_stats()` est bien déployée sur Supabase.
 *
 * Usage :
 *   cd /app/backend && node scripts/check-network-stats-rpc.js
 *
 * Sortie :
 *   - Exit 0 : RPC trouvée et fonctionnelle (affiche le résultat)
 *   - Exit 1 : RPC absente → appliquer sql/migrations/create_get_network_stats.sql
 *   - Exit 2 : RPC présente mais erreur d'exécution
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquants dans .env');
  process.exit(2);
}

const client = createClient(url, key);

(async () => {
  const t0 = Date.now();
  const { data, error } = await client.rpc('get_network_stats');
  const latency = Date.now() - t0;

  if (error) {
    const isMissing =
      error.code === '42883' ||
      (typeof error.message === 'string' && error.message.includes('get_network_stats'));

    if (isMissing) {
      console.error('❌ RPC get_network_stats() introuvable.');
      console.error('   → Applique /app/sql/migrations/create_get_network_stats.sql');
      console.error('   → SQL Editor Supabase > colle le fichier > Run');
      process.exit(1);
    }

    console.error('⚠️  RPC présente mais a échoué :', error);
    process.exit(2);
  }

  console.log(`✅ RPC get_network_stats() OK (${latency} ms)`);
  console.log('   Payload :', JSON.stringify(data));
  process.exit(0);
})();
