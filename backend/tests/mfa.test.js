/**
 * @author @hopsyder
 * @description Tests unitaires des outils 2FA (TOTP) — sans dépendance à Supabase.
 */
require('ts-node/register/transpile-only')

const test = require('node:test')
const assert = require('node:assert/strict')
const { decodeJwtClaims, hasVerifiedTotp, hasRecentTotp } = require('../src/utils/mfa.ts')

const jwt = (payload) => `h.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.s`

test('decodeJwtClaims lit aal et amr, et tolère un jeton invalide', () => {
  assert.deepEqual(decodeJwtClaims(jwt({ aal: 'aal2', amr: [] })), { aal: 'aal2', amr: [] })
  assert.deepEqual(decodeJwtClaims('pas-un-jwt'), {})
})

test('hasVerifiedTotp ne compte que les facteurs TOTP vérifiés', () => {
  assert.equal(hasVerifiedTotp({ factors: [{ factor_type: 'totp', status: 'verified' }] }), true)
  assert.equal(hasVerifiedTotp({ factors: [{ factor_type: 'totp', status: 'unverified' }] }), false)
  assert.equal(hasVerifiedTotp({ factors: [{ factor_type: 'phone', status: 'verified' }] }), false)
  assert.equal(hasVerifiedTotp({}), false)
})

test('hasRecentTotp exige aal2 et un code TOTP de moins de 5 minutes', () => {
  const now = 1_000_000_000_000
  const at = (secondsAgo) => now / 1000 - secondsAgo
  assert.equal(hasRecentTotp({ aal: 'aal2', amr: [{ method: 'totp', timestamp: at(60) }] }, 300, now), true)
  assert.equal(hasRecentTotp({ aal: 'aal2', amr: [{ method: 'totp', timestamp: at(600) }] }, 300, now), false)
  assert.equal(hasRecentTotp({ aal: 'aal1', amr: [{ method: 'totp', timestamp: at(10) }] }, 300, now), false)
  assert.equal(hasRecentTotp({ aal: 'aal2', amr: [{ method: 'password', timestamp: at(10) }] }, 300, now), false)
})
