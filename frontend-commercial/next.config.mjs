/**
 * @author @hopsyder — Nexus Partners
 * @description Configuration du site officiel EmiID (emiid.com).
 *
 * Décision (Option A) : les profils publics sont servis par l'APPLICATION
 * (app.emiid.com) — le SEO d'un sous-domaine est parfaitement indexé et cela
 * évite la fragilité d'un proxy cross-domaine (assets /_next, images locales,
 * /api/proxy, etc.).
 *
 * emiid.com ne rend donc PAS les profils ; il se contente de REDIRIGER les
 * anciens liens déjà partagés vers l'application :
 *
 *   emiid.com/profil/:slug   → (308) →   app.emiid.com/profil/:slug
 */

const APP_ORIGIN = process.env.APP_ORIGIN || 'https://app.emiid.com'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/profil/:path*',
        destination: `${APP_ORIGIN}/profil/:path*`,
        permanent: true, // 308 : consolide le SEO sur app.emiid.com
      },
    ]
  },
}

export default nextConfig
