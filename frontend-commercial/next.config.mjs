/**
 * @author @hopsyder — Nexus Partners
 * @description Configuration du site officiel EmiID (emiid.com).
 *
 * Multi-zones : les pages de profil public sont RENDUES par l'application
 * (app.emiid.com) mais SERVIES sous le domaine officiel emiid.com, pour
 * consolider le SEO sur le domaine de marque.
 *
 *   emiid.com/profil/:slug   →  (rewrite / reverse-proxy)  →  app.emiid.com/profil/:slug
 *
 * Prérequis côté application (frontend-user), à définir dans ses variables Vercel :
 *   • ASSET_PREFIX=https://app.emiid.com   → les assets /_next/static de l'app
 *     sont chargés en absolu depuis le domaine app (évite la collision avec les
 *     assets /_next du site officiel).
 *   • NEXT_PUBLIC_PUBLIC_URL=https://www.emiid.com → canonical / OG / JSON-LD /
 *     lien de partage pointent sur le domaine officiel.
 *
 * L'endpoint d'image (/_next/image) reste servi par ce site : les avatars
 * Supabase des profils proxifiés sont donc listés dans images.remotePatterns.
 */

const APP_ORIGIN = process.env.APP_ORIGIN || 'https://app.emiid.com'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Page profil public (SSR par l'app, servie sous emiid.com)
      { source: '/profil/:path*', destination: `${APP_ORIGIN}/profil/:path*` },
      // Image OpenGraph dynamique de la carte profil
      { source: '/api/og/:path*', destination: `${APP_ORIGIN}/api/og/:path*` },
      // Proxy applicatif : requêtes client des pages profil proxifiées
      // (sonde de santé, données publiques, follow, partage…). Sans cela, la
      // bannière « backend inaccessible » s'affiche à tort sous emiid.com.
      { source: '/api/proxy/:path*', destination: `${APP_ORIGIN}/api/proxy/:path*` },
    ]
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
