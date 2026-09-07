/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests pour les routes d'utilisateurs
 * @created 2026-03-26
 * @updated 2026-09-07
 */

require('ts-node/register/transpile-only');

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { app } = require('../src/app.ts');
const { createTestUser, deleteTestUser, supabaseAdmin } = require('./helpers/testAuth');

test.describe('User Routes', () => {
    let user;

    test.before(async () => {
        user = await createTestUser({ emailPrefix: 'user' });
    });

    test.after(async () => {
        await deleteTestUser(user.userId);
    });

    test.describe('GET /api/users/me', () => {
        test('should return the authenticated user profile', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);

            assert.ok(response.body);
            assert.equal(response.body.email, user.email);
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
                city: 'Cotonou',
            };

            const response = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${user.token}`)
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
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);

            assert.ok(Array.isArray(response.body));
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .get('/api/users/followers')
                .expect(401);
        });
    });

    test.describe('GET /api/users/follows', () => {
        test('should return following list', async () => {
            const response = await request(app)
                .get('/api/users/follows')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);

            assert.ok(Array.isArray(response.body));
        });
    });

    test.describe('POST /api/users/follow/:id', () => {
        test('should follow another user', async () => {
            const target = await createTestUser({ emailPrefix: 'follow-target' });
            try {
                const response = await request(app)
                    .post(`/api/users/follow/${target.userId}`)
                    .set('Authorization', `Bearer ${user.token}`)
                    .expect(200);

                assert.equal(typeof response.body.followed, 'boolean');
            } finally {
                await deleteTestUser(target.userId);
            }
        });
    });

    test.describe('POST /api/users/pin/request-reset + POST /api/users/reset-pin', () => {
        test('should reject reset-pin with an invalid OTP', async () => {
            const response = await request(app)
                .post('/api/users/reset-pin')
                .set('Authorization', `Bearer ${user.token}`)
                .send({ otp: '000000', newPin: '123456' })
                .expect(400);

            assert.ok(response.body.error);
        });

        test('should reject reset-pin without authentication', async () => {
            await request(app)
                .post('/api/users/reset-pin')
                .send({ otp: '000000', newPin: '123456' })
                .expect(401);
        });

        test('should set a new PIN after requesting a real OTP', async () => {
            const requestResponse = await request(app)
                .post('/api/users/pin/request-reset')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);

            assert.equal(requestResponse.body.success, true);

            const { data: verification, error } = await supabaseAdmin
                .from('pin_reset_verifications')
                .select('otp_code')
                .eq('user_id', user.userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            assert.equal(error, null);
            assert.ok(verification?.otp_code);

            const resetResponse = await request(app)
                .post('/api/users/reset-pin')
                .set('Authorization', `Bearer ${user.token}`)
                .send({ otp: verification.otp_code, newPin: '654321' })
                .expect(200);

            assert.equal(resetResponse.body.success, true);
        });
    });
});
