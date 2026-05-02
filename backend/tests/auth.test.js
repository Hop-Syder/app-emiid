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
    test.describe('POST /api/auth/register', () => {
        test('should create a new user with valid credentials', async () => {
            const testData = {
                email: `test_${Date.now()}@example.com`,
                password: 'Password123',
                first_name: 'Test',
                last_name: 'User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(testData)
                .expect(201);

            assert.ok(response.body.user);
            assert.equal(typeof response.body.user.email, 'string');
        });

        test('should reject invalid email format', async () => {
            const testData = {
                email: 'invalid-email',
                password: 'Password123',
                first_name: 'Test',
                last_name: 'User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(testData)
                .expect(400);

            assert.ok(response.body.error);
        });

        test('should reject weak password', async () => {
            const testData = {
                email: `test_${Date.now()}@example.com`,
                password: '123',
                first_name: 'Test',
                last_name: 'User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(testData)
                .expect(400);

            assert.ok(response.body.error);
        });

        test('should reject reserved roles', async () => {
            const testData = {
                email: `test_${Date.now()}@example.com`,
                password: 'Password123',
                first_name: 'Test',
                last_name: 'User',
                role: 'admin'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(testData)
                .expect(400);

            assert.ok(response.body.error);
        });
    });

    test.describe('GET /api/users/me', () => {
        test('should return 401 without token', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .expect(401);

            assert.ok(response.body.error);
        });
    });
});
