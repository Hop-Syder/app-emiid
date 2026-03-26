/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests pour les routes de messagerie
 * @created 2026-03-26
 */

require('ts-node/register/transpile-only');

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { app } = require('../src/app.ts');

let authToken;
let testUserId;
let recipientUserId;

// Helper pour créer un utilisateur
async function createTestUser(emailSuffix = Date.now()) {
    const signupData = {
        email: `message_test_${emailSuffix}@example.com`,
        password: 'Password123!',
        firstName: 'Message',
        lastName: 'Test'
    };

    const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

    return {
        token: response.body.token,
        userId: response.body.user.id
    };
}

test.describe('Message Routes', () => {
    test.beforeEach(async () => {
        // Créer deux utilisateurs pour les tests
        const user1 = await createTestUser();
        authToken = user1.token;
        testUserId = user1.userId;

        const user2 = await createTestUser(user1.userId + 1);
        recipientUserId = user2.userId;
    });

    test.describe('GET /api/messages/conversations', () => {
        test('should return conversations list', async () => {
            const response = await request(app)
                .get('/api/messages/conversations')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            assert.ok(Array.isArray(response.body.conversations));
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .get('/api/messages/conversations')
                .expect(401);
        });
    });

    test.describe('GET /api/messages/:conversationId', () => {
        test('should return messages for a conversation', async () => {
            // Note: Ce test suppose qu'il y a déjà des conversations
            // Dans un environnement de test idéal, on créerait d'abord une conversation
            const response = await request(app)
                .get(`/api/messages/${recipientUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            assert.ok(Array.isArray(response.body.messages));
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .get(`/api/messages/${recipientUserId}`)
                .expect(401);
        });
    });

    test.describe('POST /api/messages/send', () => {
        test('should send a message successfully', async () => {
            const messageData = {
                recipient_id: recipientUserId,
                content: 'Test message content'
            };

            const response = await request(app)
                .post('/api/messages/send')
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)
                .expect(201);

            assert.ok(response.body.message);
            assert.equal(response.body.message.content, messageData.content);
        });

        test('should reject empty message content', async () => {
            const messageData = {
                recipient_id: recipientUserId,
                content: ''
            };

            await request(app)
                .post('/api/messages/send')
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)
                .expect(400);
        });

        test('should reject missing recipient', async () => {
            const messageData = {
                content: 'Test message without recipient'
            };

            await request(app)
                .post('/api/messages/send')
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)
                .expect(400);
        });

        test('should reject self-message', async () => {
            const messageData = {
                recipient_id: testUserId,
                content: 'Message to self'
            };

            const response = await request(app)
                .post('/api/messages/send')
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData)
                .expect(400);

            assert.ok(response.body.error);
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .post('/api/messages/send')
                .send({
                    recipient_id: recipientUserId,
                    content: 'Test'
                })
                .expect(401);
        });
    });

    test.describe('PUT /api/messages/mark-read/:conversationId', () => {
        test('should mark messages as read', async () => {
            const response = await request(app)
                .put(`/api/messages/mark-read/${recipientUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            assert.ok(response.body.success);
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .put(`/api/messages/mark-read/${recipientUserId}`)
                .expect(401);
        });
    });

    test.describe('DELETE /api/messages/:messageId', () => {
        test('should delete a message', async () => {
            // D'abord, envoyer un message
            const sendResponse = await request(app)
                .post('/api/messages/send')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    recipient_id: recipientUserId,
                    content: 'Message to delete'
                });

            const messageId = sendResponse.body.message.id;

            // Ensuite, le supprimer
            const response = await request(app)
                .delete(`/api/messages/${messageId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            assert.ok(response.body.success);
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .delete('/api/messages/some-message-id')
                .expect(401);
        });

        test('should prevent deleting others messages', async () => {
            // Créer un autre utilisateur
            const otherUser = await createTestUser(999999);

            // L'autre utilisateur envoie un message
            const sendResponse = await request(app)
                .post('/api/messages/send')
                .set('Authorization', `Bearer ${otherUser.token}`)
                .send({
                    recipient_id: testUserId,
                    content: 'You cannot delete this'
                });

            const messageId = sendResponse.body.message.id;

            // Tenter de supprimer le message de l'autre utilisateur
            const response = await request(app)
                .delete(`/api/messages/${messageId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(403);

            assert.ok(response.body.error);
        });
    });
});
