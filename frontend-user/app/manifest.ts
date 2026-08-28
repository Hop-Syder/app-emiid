/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Manifeste PWA — servi sur /manifest.webmanifest.
 *
 *              Écrit en TypeScript plutôt qu'en JSON statique : Next le type,
 *              le sert avec le bon Content-Type et le garde synchronisé avec le
 *              reste des métadonnées.
 *
 *              `icons` conditionne l'installabilité : Chrome n'émet
 *              `beforeinstallprompt` que si une 192×192 ET une 512×512 sont
 *              déclarées. Générer les fichiers via
 *              `node scripts/generate-pwa-icons.js`.
 * @created 2026-08-28
 */

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EmiID — Votre empreinte numérique professionnelle',
    short_name: 'EmiID',
    description:
      "Créez votre carte de visite numérique et rejoignez l'annuaire des professionnels et artisans du Bénin.",
    start_url: '/dashboard-user',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#013ff4',
    lang: 'fr',
    dir: 'ltr',
    categories: ['business', 'productivity', 'social'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Icône adaptative Android : le système la rogne en cercle, d'où une
      // déclaration séparée avec sa marge de sécurité.
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Rechercher un professionnel', short_name: 'Recherche', url: '/recherche' },
      { name: 'Annuaire', short_name: 'Annuaire', url: '/annuaire' },
      { name: 'Messages', short_name: 'Messages', url: '/messages' },
    ],
  }
}
