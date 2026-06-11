/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Service frontend pour la gestion des abonnements Push
 * @created 2026-04-19
 */

import { createClient } from './supabase/client';

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Convertit une clé VAPID base64 en Uint8Array pour le navigateur
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Enregistre le service worker et demande l'autorisation pour les notifications
 */
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Les notifications push ne sont pas supportées par ce navigateur');
    return null;
  }

  if (!PUBLIC_VAPID_KEY) {
    console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY manquant : push désactivé');
    return null;
  }

  try {
    // 1. Enregistrement du Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');

    // 2. Demande de permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission de notification refusée');
    }

    // 3. Souscription au Push Manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });

    // 4. Envoi de la souscription à Supabase
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Utilisateur non connecté');

    const subJson = subscription.toJSON();
    
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subJson.endpoint || "",
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
      }, { onConflict: 'endpoint' });

    if (error) throw error;

    return subscription;
  } catch (error) {
    console.error("Erreur lors de l'inscription aux notifications push", error);
    return null;
  }
}
