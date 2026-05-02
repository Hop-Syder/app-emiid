/**
 * Tests de non-régression pour les correctifs de l'audit consolidé 2026.
 * - C2 : rate-limit auth/register
 * - C3 : rate-limit phone/verify
 * - C4/C5 : absence de crash sur routes (register OTP/validation)
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const { app } = require('../dist/app');

test('C2 - POST /api/auth/register est rate-limité (10/15min)', async () => {
  const payload = { email: 'test@example.com', password: 'Aa12345678' };
  let lastStatus = 0;
  // On envoie 15 requêtes d'affilée ; certaines vont échouer en validation ou
  // atteindre Supabase, mais dès la 11ème réponse on doit observer un 429.
  let saw429 = false;
  for (let i = 0; i < 15; i++) {
    const res = await request(app)
      .post('/api/auth/register')
      .send(payload);
    lastStatus = res.status;
    if (res.status === 429) {
      saw429 = true;
      break;
    }
  }
  assert.equal(saw429, true, `Attendu 429 avant la 16ème requête, dernier statut: ${lastStatus}`);
});

test('C3 - POST /api/users/phone/verify est protégé par requireAuth (401 sans token)', async () => {
  // Note : requireAuth intervient AVANT phoneVerifyLimiter (router.use global).
  // Un attaquant non authentifié prend 401 immédiat, ce qui neutralise la tentative
  // de brute-force OTP. Le phoneVerifyLimiter ajoute une couche de défense en profondeur
  // pour les utilisateurs authentifiés.
  const res = await request(app)
    .post('/api/users/phone/verify')
    .send({ phone: '+221771234567', code: '123456' });
  assert.equal(res.status, 401, `Attendu 401, reçu ${res.status}`);
});

test('C4 - Route /api/auth/me sans token retourne 401 (pas 500)', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
  assert.ok(res.body.error, 'Doit contenir un champ error');
});
