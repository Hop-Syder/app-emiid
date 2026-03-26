/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests pour les routes d'utilisateurs
 * @created 2026-03-26
 */

require('ts-node/register/transpile-only');

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { app } = require('../src/app.ts');

let authToken;
let testUserId;

// Helper pour créer un utilisateur et récupérer son token
async function createTestUser() {
    const signupData = {
        email: `user_test_${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'User',
        lastName: 'Test'
    };

    const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

    authToken = response.body.token;
    testUserId = response.body.user.id;
}

test.describe('User Routes', () => {
    test.beforeEach(async () => {
        await createTestUser();
    });

    test.describe('GET /api/users/profile', () => {
        test('should return user profile', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            assert.ok(response.body.profile);
            assert.equal(typeof response.body.profile.email, 'string');
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .get('/api/users/profile')
                .expect(401);
        });
    });

    test.describe('PUT /api/users/profile', () => {
        test('should update user profile', async () => {
            const updateData = {
                bio: 'Test bio updated',
                specialty: 'Developer',
                city: 'Paris'
            };

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            assert.ok(response.body.profile);
            assert.equal(response.body.profile.bio, updateData.bio);
        });

        test('should reject invalid data', async () => {
            const updateData = {
                bio: 123 // bio devrait être une string
            };

            await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(400);
        });
    });

    test.describe('GET /api/users/followers', () => {
        test('should return followers list', async () => {
            const response = await request(app)
                .get('/api/users/followers')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            assert.ok(Array.isArray(response.body.followers));
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .get('/api/users/followers')
                .expect(401);
        });
    });

    test.describe('GET /api/users/following', () => {
        test('should return following list', async () => {
            const response = await request(app)
                .get('/api/users/following')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            assert.ok(Array.isArray(response.body.following));
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .get('/api/users/following')
                .expect(401);
        });
    });

    test.describe('POST /api/users/follow/:userId', () => {
        test('should follow another user', async () => {
            // Créer un deuxième utilisateur à suivre
            const targetUserSignup = {
                email: `target_${Date.now()}@example.com`,
                password: 'Password123!',
                firstName: 'Target',
                lastName: 'User'
            };

            const targetResponse = await request(app)
                .post('/api/auth/signup')
                .send(targetUserSignup);

            const targetUserId = targetResponse.body.user.id;

            const response = await request(app)
                .post(`/api/users/follow/${targetUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            assert.ok(response.body.success);
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .post('/api/users/follow/some-user-id')
                .expect(401);
        });

        test('should prevent self-follow', async () => {
            const response = await request(app)
                .post(`/api/users/follow/${testUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            assert.ok(response.body.error);
        });
    });

    test.describe('DELETE /api/users/unfollow/:userId', () => {
        test('should unfollow a user', async () => {
            // D'abord, suivre quelqu'un
            const targetUserSignup = {
                email: `unfollow_target_${Date.now()}@example.com`,
                password: 'Password123!',
                firstName: 'Unfollow',
                lastName: 'Target'
            };

            const targetResponse = await request(app)
                .post('/api/auth/signup')
                .send(targetUserSignup);

            const targetUserId = targetResponse.body.user.id;

            await request(app)
                .post(`/api/users/follow/${targetUserId}`)
                .set('Authorization', `Bearer ${authToken}`);

            // Ensuite, ne plus suivre
            const response = await request(app)
                .delete(`/api/users/unfollow/${targetUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            assert.ok(response.body.success);
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .delete('/api/users/unfollow/some-user-id')
                .expect(401);
        });
    });
});
