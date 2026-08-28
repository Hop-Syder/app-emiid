/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Script pour générer les clés VAPID pour les notifications Push
 * @created 2026-04-23
 */

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('--- NOUVELLES CLÉS VAPID GÉNÉRÉES ---');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('-------------------------------------');
console.log('Copiez ces clés dans votre fichier .env du backend et du frontend.');
