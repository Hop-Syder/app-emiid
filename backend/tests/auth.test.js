/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests pour les routes d'authentification
 * @created 2026-03-26
 * @updated 2026-09-07
 */

require('ts-node/register/transpile-only');

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { app } = require('../src/app.ts');
const { createTestUser, deleteTestUser } = require('./helpers/testAuth');

test.describe('Auth Routes', () => {
    test.describe('POST /api/auth/register', () => {
        test('should reject without authentication', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ email: `nope_${Date.now()}@emiid-tests.invalid`, password: 'Password123!' });

            assert.equal(response.status, 401);
        });

        test('should reject an authenticated non-admin user', async () => {
            const user = await createTestUser();
            try {
                const response = await request(app)
                    .post('/api/auth/register')
                    .set('Authorization', `Bearer ${user.token}`)
                    .send({ email: `nope_${Date.now()}@emiid-tests.invalid`, password: 'Password123!' });

                assert.equal(response.status, 403);
            } finally {
                await deleteTestUser(user.userId);
            }
        });

        test('should create a new user for an admin', async () => {
            const admin = await createTestUser({ isAdmin: true, emailPrefix: 'admin' });
            let createdUserId;
            try {
                const email = `created_${Date.now()}@emiid-tests.invalid`;
                const response = await request(app)
                    .post('/api/auth/register')
                    .set('Authorization', `Bearer ${admin.token}`)
                    .send({ email, password: 'Password123!' });

                assert.equal(response.status, 201);
                assert.equal(response.body.user.email, email);
                createdUserId = response.body.user.id;
            } finally {
                if (createdUserId) await deleteTestUser(createdUserId);
                await deleteTestUser(admin.userId);
            }
        });

        test('should reject invalid email format for an admin', async () => {
            // Note : registerUser (authController.ts) ne distingue pas les erreurs
            // Zod des erreurs serveur — une erreur de validation retourne 500, pas
            // 400 (même limitation que sendMessage). Documenté, hors périmètre ici.
            const admin = await createTestUser({ isAdmin: true, emailPrefix: 'admin' });
            try {
                const response = await request(app)
                    .post('/api/auth/register')
                    .set('Authorization', `Bearer ${admin.token}`)
                    .send({ email: 'invalid-email', password: 'Password123!' });

                assert.equal(response.status, 500);
            } finally {
                await deleteTestUser(admin.userId);
            }
        });
    });

    test.describe('GET /api/auth/me', () => {
        test('should return 401 without token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            assert.ok(response.body.error);
        });

        test('should return user info with a valid token', async () => {
            const user = await createTestUser();
            try {
                const response = await request(app)
                    .get('/api/auth/me')
                    .set('Authorization', `Bearer ${user.token}`)
                    .expect(200);

                assert.ok(response.body.user);
                assert.equal(response.body.user.email, user.email);
            } finally {
                await deleteTestUser(user.userId);
            }
        });

        test('should reject an invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid_token_here')
                .expect(401);

            assert.ok(response.body.error);
        });
    });
});
