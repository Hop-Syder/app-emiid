/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Script de test manuel pour les APIs de messagerie
 * @created 2026-03-18
*/

import fetch from 'node-fetch';
import 'dotenv/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Il nous faut un token JWT valide pour tester le fetchWithAuth
const TEST_TOKEN = process.env.TEST_AUTH_TOKEN;

async function testMessagingAPI() {
    console.log("🚀 Démarrage des tests unitaires manuels...");

    if (!TEST_TOKEN) {
        console.error("❌ Erreur: TEST_AUTH_TOKEN manquant dans l'environnement.");
        return;
    }

    const headers = {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        // 1. Test de récupération du support
        console.log("\n1️⃣ Test /api/messages/support...");
        const supportRes = await fetch(`${API_URL}/messages/support`, { headers });
        if (supportRes.ok) {
            const support = await supportRes.json();
            console.log("✅ Support trouvé:", support.id, support.name);
            
            // 2. Test d'envoi de message (simulé)
            console.log("\n2️⃣ Test /api/messages/send...");
            const sendRes = await fetch(`${API_URL}/messages/send`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    receiverId: support.id,
                    content: "Test automatique Nexus Support"
                })
            });
            
            if (sendRes.ok) {
                const msg = await sendRes.json();
                console.log("✅ Message envoyé avec succès. ID Conv:", msg.conversation_id);
                
                // 3. Test de récupération des conversations
                console.log("\n3️⃣ Test /api/messages/conversations...");
                const convsRes = await fetch(`${API_URL}/messages/conversations`, { headers });
                if (convsRes.ok) {
                    const convs = await convsRes.json();
                    const hasConv = convs.some((c: any) => c.id === msg.conversation_id);
                    console.log(hasConv ? "✅ Conversation listée correctement." : "❌ Conversation manquante dans la liste.");
                }
            } else {
                console.error("❌ Échec de l'envoi du message:", await sendRes.text());
            }

        } else {
            console.error("❌ Échec de récupération du support:", await supportRes.text());
        }

    } catch (err) {
        console.error("💥 Erreur critique lors des tests:", err);
    }
}

testMessagingAPI();
