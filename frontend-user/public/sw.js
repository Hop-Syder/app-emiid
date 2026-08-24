/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Service Worker EmiID — notifications push et socle PWA.
 * @created 2026-04-19
 * @updated 2026-08-28
 */

// ── Socle PWA ──────────────────────────────────────────────────────────────
// Chrome n'émet `beforeinstallprompt` que si un service worker gère l'événement
// `fetch` : sans le gestionnaire ci-dessous, l'application ne serait jamais
// proposée à l'installation, quel que soit le manifeste.

const CACHE = 'emiid-shell-v1';

self.addEventListener('install', (event) => {
  // Le nouveau worker prend la main sans attendre la fermeture des onglets.
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // On ne touche ni aux écritures, ni aux appels d'API : servir une réponse
  // périmée sur un profil ou un paiement ferait plus de mal que de bien.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Réseau d'abord : l'application reste à jour, et le cache ne sert que de
  // filet quand la connexion manque — cas fréquent sur mobile au Bénin.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ── Notifications push ─────────────────────────────────────────────────────

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/logo/icon-light-32x32.png',
      badge: '/logo/icon-light-32x32.png', // Icône miniature pour la barre d'état
      vibrate: [100, 50, 100],
      data: {
        url: data.data?.url || '/'
      },
      actions: [
        {
          action: 'open_url',
          title: 'Voir le message'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      const url = event.notification.data.url;
      
      // Si une fenêtre est déjà ouverte sur l'app, on la focalise
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Sinon on ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
