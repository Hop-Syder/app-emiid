/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests pour les routes d'utilisateurs (Mode Hybrid: Register + Bypass Auth)
 * @created 2026-03-26
 */

require('ts-node/register/transpile-only');

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { app } = require('../src/app.ts');

let testUserId;
let testUserEmail;

// On s'assure que le bypass est activé pour les tests
process.env.DEV_AUTH_BYPASS = 'true';

test.describe('User Routes', () => {

    test.before(async () => {
        // 1. Créer un vrai utilisateur via l'API de register (pour avoir un profil en DB)
        testUserEmail = `test_${Date.now()}@emiid.local`;
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: testUserEmail,
                password: 'Password123!',
                first_name: 'Test',
                last_name: 'User'
            })
            .expect(201);
        
        testUserId = response.body.user.id;
    });

    test.describe('GET /api/users/me', () => {
        test('should return user profile', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .set('x-dev-user-id', testUserId)
                .set('x-dev-user-email', testUserEmail)
                .expect(200);

            assert.ok(response.body);
            assert.equal(response.body.email, testUserEmail);
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .get('/api/users/me')
                .expect(401);
        });
    });

    test.describe('PUT /api/users/me', () => {
        test('should update user profile', async () => {
            const updateData = {
                bio: 'Test bio updated',
                specialty: 'Developer',
                city: 'Paris'
            };

            const response = await request(app)
                .put('/api/users/me')
                .set('x-dev-user-id', testUserId)
                .set('x-dev-user-email', testUserEmail)
                .send(updateData)
                .expect(200);

            assert.ok(response.body);
            assert.equal(response.body.bio, updateData.bio);
        });
    });

    test.describe('GET /api/users/followers', () => {
        test('should return followers list', async () => {
            const response = await request(app)
                .get('/api/users/followers')
                .set('x-dev-user-id', testUserId)
                .expect(200);

            assert.ok(Array.isArray(response.body));
        });
    });

    test.describe('GET /api/users/follows', () => {
        test('should return following list', async () => {
            const response = await request(app)
                .get('/api/users/follows')
                .set('x-dev-user-id', testUserId)
                .expect(200);

            assert.ok(Array.isArray(response.body));
        });
    });

    test.describe('POST /api/users/follow/:id', () => {
        test('should follow another user', async () => {
            // Créer un deuxième utilisateur
            const targetResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    email: `target_${Date.now()}@emiid.local`,
                    password: 'Password123!',
                    first_name: 'Target',
                    last_name: 'User'
                })
                .expect(201);
            
            const targetUserId = targetResponse.body.user.id;

            const response = await request(app)
                .post(`/api/users/follow/${targetUserId}`)
                .set('x-dev-user-id', testUserId)
                .expect(200);

            assert.equal(typeof response.body.followed, 'boolean');
        });
    });
});
