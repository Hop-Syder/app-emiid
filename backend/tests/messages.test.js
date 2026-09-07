/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tests pour les routes de messagerie
 * @created 2026-03-26
 * @updated 2026-09-07
 */

require('ts-node/register/transpile-only');

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { app } = require('../src/app.ts');
const { createTestUser, deleteTestUser, supabaseAdmin } = require('./helpers/testAuth');

// Aucun endpoint ne crée de conversation 1-à-1 (le backend ne gère que les
// groupes via POST /api/messages/groups) — une vraie conversation DM est créée
// directement en base, comme le fait le frontend, avec ses 2 participants.
async function createDmConversation(userIdA, userIdB) {
    const { data: conversation, error } = await supabaseAdmin
        .from('conversations')
        .insert({ participant1_id: userIdA, participant2_id: userIdB, is_group: false })
        .select('id')
        .single();
    if (error) throw error;

    const { error: participantsError } = await supabaseAdmin
        .from('conversation_participants')
        .insert([
            { conversation_id: conversation.id, user_id: userIdA },
            { conversation_id: conversation.id, user_id: userIdB },
        ]);
    if (participantsError) throw participantsError;

    return conversation.id;
}

async function deleteConversation(conversationId) {
    if (!conversationId) return;
    await supabaseAdmin.from('conversations').delete().eq('id', conversationId);
}

test.describe('Message Routes', () => {
    let userA;
    let userB;
    let conversationId;

    test.before(async () => {
        userA = await createTestUser({ emailPrefix: 'msg-a' });
        userB = await createTestUser({ emailPrefix: 'msg-b' });
        conversationId = await createDmConversation(userA.userId, userB.userId);
    });

    test.after(async () => {
        await deleteConversation(conversationId);
        await deleteTestUser(userA.userId);
        await deleteTestUser(userB.userId);
    });

    test.describe('GET /api/messages/conversations', () => {
        test('should return the conversations list', async () => {
            const response = await request(app)
                .get('/api/messages/conversations')
                .set('Authorization', `Bearer ${userA.token}`)
                .expect(200);

            assert.ok(Array.isArray(response.body));
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .get('/api/messages/conversations')
                .expect(401);
        });
    });

    test.describe('POST /api/messages/send', () => {
        test('should send a message successfully', async () => {
            const response = await request(app)
                .post('/api/messages/send')
                .set('Authorization', `Bearer ${userA.token}`)
                .send({ conversation_id: conversationId, content: 'Test message content', message_type: 'text' })
                .expect(201);

            assert.equal(response.body.content, 'Test message content');
            assert.equal(response.body.conversation_id, conversationId);
        });

        test('should reject an empty message content', async () => {
            await request(app)
                .post('/api/messages/send')
                .set('Authorization', `Bearer ${userA.token}`)
                .send({ conversation_id: conversationId, content: '' })
                .expect(500);
        });

        test('should reject a missing conversation_id', async () => {
            await request(app)
                .post('/api/messages/send')
                .set('Authorization', `Bearer ${userA.token}`)
                .send({ content: 'Message without conversation' })
                .expect(500);
        });

        test('should reject a non-member of the conversation', async () => {
            const outsider = await createTestUser({ emailPrefix: 'msg-outsider' });
            try {
                const response = await request(app)
                    .post('/api/messages/send')
                    .set('Authorization', `Bearer ${outsider.token}`)
                    .send({ conversation_id: conversationId, content: 'Should be rejected' })
                    .expect(403);

                assert.ok(response.body.error);
            } finally {
                await deleteTestUser(outsider.userId);
            }
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .post('/api/messages/send')
                .send({ conversation_id: conversationId, content: 'Test' })
                .expect(401);
        });
    });

    test.describe('GET /api/messages/conversation/:id', () => {
        test('should return messages for a member', async () => {
            const response = await request(app)
                .get(`/api/messages/conversation/${conversationId}`)
                .set('Authorization', `Bearer ${userA.token}`)
                .expect(200);

            assert.ok(Array.isArray(response.body));
        });

        test('should reject a non-member (403)', async () => {
            const outsider = await createTestUser({ emailPrefix: 'msg-outsider2' });
            try {
                await request(app)
                    .get(`/api/messages/conversation/${conversationId}`)
                    .set('Authorization', `Bearer ${outsider.token}`)
                    .expect(403);
            } finally {
                await deleteTestUser(outsider.userId);
            }
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .get(`/api/messages/conversation/${conversationId}`)
                .expect(401);
        });
    });

    test.describe('DELETE /api/messages/conversation/:id', () => {
        test('should let a member delete the conversation', async () => {
            // Une paire (userA, userB) a déjà une conversation créée dans before() —
            // le UNIQUE symétrique interdit d'en créer une seconde pour la même paire.
            const thirdUser = await createTestUser({ emailPrefix: 'msg-c' });
            const tempConversationId = await createDmConversation(userA.userId, thirdUser.userId);
            try {
                const response = await request(app)
                    .delete(`/api/messages/conversation/${tempConversationId}`)
                    .set('Authorization', `Bearer ${userA.token}`)
                    .expect(200);

                assert.ok(response.body.success);
            } finally {
                await deleteConversation(tempConversationId);
                await deleteTestUser(thirdUser.userId);
            }
        });

        test('should return 401 without authentication', async () => {
            await request(app)
                .delete(`/api/messages/conversation/${conversationId}`)
                .expect(401);
        });
    });
});
