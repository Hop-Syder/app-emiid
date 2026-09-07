/**
 * Helper de test : crée de vrais utilisateurs Supabase Auth (service role) et
 * récupère un access token réel via signInWithPassword. Nécessaire car aucun
 * bypass d'authentification n'existe dans le code (DEV_AUTH_BYPASS n'a jamais
 * été implémenté) et POST /api/auth/register est désormais réservé aux admins.
 *
 * Chaque utilisateur créé doit être supprimé par l'appelant via deleteTestUser
 * pour ne pas polluer le projet Supabase réel utilisé par les tests.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

async function createTestUser({ isAdmin = false, emailPrefix = 'test' } = {}) {
  const email = `${emailPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@emiid-tests.invalid`;

  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (createError) throw createError;

  const userId = createData.user.id;

  if (isAdmin) {
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ is_admin: true })
      .eq('user_id', userId);
    if (updateError) throw updateError;
  }

  // signInWithPassword est protégé par le captcha Turnstile du projet (public,
  // anti-bot) — on obtient une vraie session sans mot de passe ni captcha via
  // generateLink (admin, service role) + verifyOtp (échange serveur-à-serveur,
  // non concerné par la protection anti-bot des flux publics).
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError) throw linkError;

  const { data: verifyData, error: verifyError } = await supabaseAnon.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  });
  if (verifyError) throw verifyError;

  return { userId, email, token: verifyData.session.access_token };
}

async function deleteTestUser(userId) {
  if (!userId) return;
  await supabaseAdmin.auth.admin.deleteUser(userId);
}

module.exports = { createTestUser, deleteTestUser, supabaseAdmin };
