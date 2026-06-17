/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Service Worker pour EmiID - Gestion des notifications push
 * @created 2026-04-19
 */

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
