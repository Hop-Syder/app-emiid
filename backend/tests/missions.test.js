/**
 * Tests de non-régression — moteur Missions Courtes (routes /api/payments/*).
 * Même périmètre que smoke.test.js : pas de fixture d'utilisateur authentifié
 * dans cette suite, donc on vérifie que chaque route est bien enregistrée
 * (pas 404) et correctement gardée par requireAuth (401 sans token). La
 * distinction admin/non-admin (requireAdmin) nécessiterait un vrai token —
 * hors de portée sans fixture, non testée ici.
 */
require('ts-node/register/transpile-only')

const test = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')

const { app } = require('../src/app.ts')

const DUMMY_ID = '00000000-0000-0000-0000-000000000000'

const missionRoutes = [
  ['post', '/api/payments/credits/checkout'],
  ['post', `/api/payments/missions/${DUMMY_ID}/escrow/checkout`],
  ['post', `/api/payments/missions/${DUMMY_ID}/escrow/release`],
  ['post', `/api/payments/missions/${DUMMY_ID}/escrow/refund`],
  ['post', `/api/payments/missions/${DUMMY_ID}/dispute/resolve`],
  ['post', '/api/payments/sponsorship/strike'],
  ['post', '/api/payments/missions/maintenance/run'],
  ['post', '/api/payments/sourcing/checkout'],
  ['post', `/api/payments/sourcing/${DUMMY_ID}/fulfill`],
  ['post', `/api/payments/sourcing/${DUMMY_ID}/cancel`],
]

for (const [method, path] of missionRoutes) {
  test(`${method.toUpperCase()} ${path} exige l'authentification (401 sans token)`, async () => {
    const response = await request(app)[method](path).send({})
    assert.equal(response.status, 401, `Attendu 401, reçu ${response.status} (${JSON.stringify(response.body)})`)
  })
}

test('POST /api/payments/missions/maintenance/run n est pas enregistrée en GET (405/404, pas un crash)', async () => {
  const response = await request(app).get('/api/payments/missions/maintenance/run')
  assert.notEqual(response.status, 500)
})
