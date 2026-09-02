import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/seo'

// Régénérée toutes les heures : les nouveaux profils apparaissent sans
// re-déploiement, sans non plus marteler la base à chaque requête Googlebot.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Les routes principales (statiques, toutes indexables — canonicals
  //    auto-référentes posées sur chaque page respective).
  //    Pas de /login : page utilitaire sans contenu de lecture, sans valeur
  //    dans l'index (le sitemap ne doit lister que des URL à indexer).
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/annuaire`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // 2. Les routes dynamiques (Profils utilisateurs publiés).
  //    On lit la VUE public_profiles (lisible par anon, RLS) — la table
  //    user_profiles renverrait 0 ligne en anon et viderait le sitemap.
  //    Seules des URL 200/indexables entrent ici : une page de profil
  //    introuvable répond désormais 404 (notFound), jamais un soft-404.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const profileRoutes: MetadataRoute.Sitemap = []

    // Supabase plafonne toute requête à 1 000 lignes : sans pagination, le
    // sitemap s'arrêtait silencieusement aux 1 000 premiers profils. On page
    // via range() jusqu'à épuisement (garde-fou à 50 000 → au-delà, passer à
    // un index de sitemaps conformément aux limites Google).
    const PAGE_SIZE = 1000
    const MAX_PROFILES = 50000
    for (let from = 0; from < MAX_PROFILES; from += PAGE_SIZE) {
      const to = from + PAGE_SIZE - 1
      const { data: profiles, error } = await supabase
        .from('public_profiles')
        .select('id, slug, created_at, updated_at')
        .range(from, to)

      if (error || !profiles || profiles.length === 0) break

      for (const profile of profiles) {
        profileRoutes.push({
          // URL canonique : slug si disponible (SEO-friendly), sinon l'id.
          url: `${SITE_URL}/profil/${profile.slug || profile.id}`,
          // Fraîcheur réelle : updated_at (bio, rôle, avatar…) plutôt que la
          // seule date de création, pour que Google re-crawl ce qui change.
          lastModified: new Date(
            (profile as { updated_at?: string | null }).updated_at ||
              profile.created_at ||
              new Date().toISOString()
          ),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }

      // Dernière page partielle : on a tout récupéré.
      if (profiles.length < PAGE_SIZE) break
    }

    // 3. Pages SEO par catégorie (vitrines « Annuaire des X »). Liste tenue
    //    alignée avec les valeurs de `category` réellement utilisées en base —
    //    une URL de catégorie sans contenu serait du thin content.
    const categories = [
      'artisan',
      'freelance',
      'entreprise',
      'startup',
      'ong',
      'consultant',
      'commerce',
      'sante',
      'education',
      'restauration',
    ]

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${SITE_URL}/annuaire/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    }))

    return [...routes, ...categoryRoutes, ...profileRoutes]
  } catch (error) {
    console.error("Erreur lors de la génération du sitemap:", error)
    // En cas d'erreur de la BDD, on retourne au moins les pages de base pour ne pas bloquer Google
    return routes
  }
}
