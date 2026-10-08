/**
 * @author @hopsyder
 * @description Tests unitaires des schémas Zod du profil — sans dépendance à Supabase.
 */
require('ts-node/register/transpile-only')

const test = require('node:test')
const assert = require('node:assert/strict')
const { updateProfileSchema, setPinSchema } = require('../src/api/validations/userValidations.ts')

const valid = (body) => updateProfileSchema.safeParse({ body }).success

test('accepte des horaires, prestations et expériences bien formés', () => {
  assert.equal(valid({
    opening_hours: [{ day: 1, open: '08:00', close: '18:00', closed: false }, { day: 0, open: '', close: '', closed: true }],
    services: [{ title: 'Pose', price: 15000, description: '' }, { title: 'Devis', price: null, description: 'Gratuit' }],
    experiences: [{ id: 'a1', title: 'Menuisier', company: 'Atelier', startDate: '2020-01', endDate: null, current: true }],
  }), true)
})

test('refuse les formats JSONB invalides et les textes trop longs', () => {
  assert.equal(valid({ opening_hours: [{ day: 9, open: '08:00', close: '18:00', closed: false }] }), false)
  assert.equal(valid({ opening_hours: [{ day: 1, open: '25:00', close: '18:00', closed: false }] }), false)
  assert.equal(valid({ services: [{ title: 'x', price: -5, description: '' }] }), false)
  assert.equal(valid({ bio: 'a'.repeat(1201) }), false)
  assert.equal(valid({ tags: Array(9).fill('t') }), false)
})

test('une sauvegarde partielle (champs modifiés seulement) reste valide', () => {
  assert.equal(valid({ slogan: 'Nouveau slogan' }), true)
  assert.equal(valid({}), true)
})

test('le nouveau PIN doit faire exactement 6 chiffres', () => {
  assert.equal(setPinSchema.safeParse({ body: { new_pin: '123456' } }).success, true)
  assert.equal(setPinSchema.safeParse({ body: { new_pin: '12345' } }).success, false)
  assert.equal(setPinSchema.safeParse({ body: { new_pin: 'abcdef' } }).success, false)
})
