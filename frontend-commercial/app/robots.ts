import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Site vitrine : tout est public. (L'ancien disallow '/private/' visait
      // un chemin qui n'existe pas ; les pages privées vivent sur app.emiid.com,
      // protégées par le middleware de l'application utilisateur.)
    },
    sitemap: 'https://emiid.com/sitemap.xml',
  };
}
