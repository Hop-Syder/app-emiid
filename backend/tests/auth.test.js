/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests pour les routes d'authentification
 * @created 2026-03-26
 */

require('ts-node/register/transpile-only');

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { app } = require('../src/app.ts');

test.describe('Auth Routes', () => {
    test.describe('POST /api/auth/signup', () => {
        test('should create a new user with valid credentials', async () => {
            const testData = {
                email: `test_${Date.now()}@example.com`,
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'User'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(testData)
                .expect(201);

            assert.ok(response.body.user);
            assert.equal(typeof response.body.user.email, 'string');
            assert.ok(response.body.token);

            // Cleanup: Le user devrait être supprimé après le test
            // Note: Dans un vrai scénario, on utiliserait une base de données de test
        });

        test('should reject invalid email format', async () => {
            const testData = {
                email: 'invalid-email',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'User'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(testData)
                .expect(400);

            assert.ok(response.body.error);
        });

        test('should reject weak password', async () => {
            const testData = {
                email: `test_${Date.now()}@example.com`,
                password: '123',
                firstName: 'Test',
                lastName: 'User'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(testData)
                .expect(400);

            assert.ok(response.body.error);
        });

        test('should reject missing first name', async () => {
            const testData = {
                email: `test_${Date.now()}@example.com`,
                password: 'Password123!',
                lastName: 'User'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(testData)
                .expect(400);

            assert.ok(response.body.error);
        });
    });

    test.describe('POST /api/auth/login', () => {
        test('should login with valid credentials', async () => {
            // D'abord, on crée un utilisateur
            const signupData = {
                email: `login_test_${Date.now()}@example.com`,
                password: 'Password123!',
                firstName: 'Login',
                lastName: 'Test'
            };

            await request(app)
                .post('/api/auth/signup')
                .send(signupData);

            // Ensuite, on tente de se connecter
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: signupData.email,
                    password: signupData.password
                })
                .expect(200);

            assert.ok(loginResponse.body.token);
            assert.ok(loginResponse.body.user);
            assert.equal(loginResponse.body.user.email, signupData.email);
        });

        test('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'WrongPassword123!'
                })
                .expect(401);

            assert.ok(response.body.error);
        });

        test('should reject invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'Password123!'
                })
                .expect(400);

            assert.ok(response.body.error);
        });
    });

    test.describe('GET /api/auth/me', () => {
        test('should return 401 without token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            assert.ok(response.body.error);
        });

        test('should return user profile with valid token', async () => {
            // Créer un utilisateur et récupérer son token
            const signupData = {
                email: `me_test_${Date.now()}@example.com`,
                password: 'Password123!',
                firstName: 'Me',
                lastName: 'Test'
            };

            const signupResponse = await request(app)
                .post('/api/auth/signup')
                .send(signupData);

            const token = signupResponse.body.token;

            // Utiliser le token pour récupérer le profil
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            assert.ok(response.body.user);
            assert.equal(response.body.user.email, signupData.email);
        });

        test('should reject invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid_token_here')
                .expect(401);

            assert.ok(response.body.error);
        });
    });

    test.describe('POST /api/auth/logout', () => {
        test('should logout successfully', async () => {
            const signupData = {
                email: `logout_test_${Date.now()}@example.com`,
                password: 'Password123!',
                firstName: 'Logout',
                lastName: 'Test'
            };

            const signupResponse = await request(app)
                .post('/api/auth/signup')
                .send(signupData);

            const token = signupResponse.body.token;

            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            assert.equal(response.body.message, 'Déconnexion réussie');
        });
    });
});
