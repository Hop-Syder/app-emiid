require('ts-node/register/transpile-only')

const test = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')

const { app } = require('../src/app.ts')

test('GET / retourne un statut ok', async () => {
  const response = await request(app).get('/')

  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'ok')
  assert.equal(typeof response.body.port, 'number')
})

test('GET /health expose l etat de la base', async () => {
  const response = await request(app).get('/health')

  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'ok')
  assert.equal(response.body.checks.database.status, 'up')
})

test('GET /health repond avec un statut de service', async () => {
  const response = await request(app).get('/health')

  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'ok')
})

test('GET /api/auth/me sans token retourne 401', async () => {
  const response = await request(app).get('/api/auth/me')

  assert.equal(response.status, 401)
})

test('CORS refuse une origine non autorisee proprement', async () => {
  const response = await request(app)
    .get('/health')
    .set('Origin', 'https://evil.example.com')

  assert.equal(response.status, 403)
  assert.equal(response.body.error, 'CORS_FORBIDDEN')
})
