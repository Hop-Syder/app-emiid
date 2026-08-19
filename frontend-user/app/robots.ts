import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://app.emiid.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Pages privées / techniques exclues de l'indexation.
      // NB : on ne bloque PAS /profil afin de garder /profil/[id] (profils publics) crawlable.
      disallow: [
        '/api/',
        '/dashboard-user',
        '/messages',
        '/notifications',
        '/parametres',
        '/portefeuille',
        '/creer-profil',
        '/onboarding',
        '/auth/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
