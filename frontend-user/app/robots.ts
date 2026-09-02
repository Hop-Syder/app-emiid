import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // /api/og/ doit rester crawlable : ce sont les images Open Graph des
      // profils, utilisées par Googlebot-Image pour les visuels de partage.
      // En robots.txt, la règle la plus spécifique gagne : /api/og/ prime sur /api/.
      allow: ['/', '/api/og/'],
      // Pages privées / techniques exclues de l'exploration (crawl budget).
      // Deux niveaux de protection coexistent, volontairement :
      //  1. le middleware (proxy.ts) redirige toute session anonyme vers /login —
      //     c'est LUI le contrôle d'accès réel, robots.txt n'est qu'indicatif ;
      //  2. le disallow ci-dessous évite à Googlebot de dépenser des requêtes
      //     sur ces URL pour n'obtenir qu'une redirection.
      // NB : on ne bloque PAS /profil afin de garder /profil/[id] (profils
      // publics) crawlable ; /profil (sans id, page redirectrice) est déjà
      // protégée par le middleware.
      disallow: [
        '/api/',
        '/dashboard-user',
        '/messages',
        '/notifications',
        '/parametres',
        '/portefeuille',
        '/creer-profil',
        '/onboarding',
        '/recherche',
        '/paiement',
        '/suspendu',
        '/maintenance',
        '/auth/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
