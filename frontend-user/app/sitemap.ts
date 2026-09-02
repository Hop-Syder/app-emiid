import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/seo'
import { resolveProfileCategory } from '@/lib/profile-options'

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
    // Catégories effectivement portées par au moins un profil publié : ce sont
    // les seules dont la page vitrine a du contenu à montrer.
    const usedCategories = new Set<string>()

    // Supabase plafonne toute requête à 1 000 lignes : sans pagination, le
    // sitemap s'arrêtait silencieusement aux 1 000 premiers profils. On page
    // via range() jusqu'à épuisement (garde-fou à 50 000 → au-delà, passer à
    // un index de sitemaps conformément aux limites Google).
    const PAGE_SIZE = 1000
    const MAX_PROFILES = 50000

    // `updated_at` donne la fraîcheur réelle, mais la vue public_profiles ne
    // l'expose que depuis la migration 20260903. Demander une colonne absente
    // fait échouer toute la requête (42703) : sans ce repli, le sitemap perdait
    // TOUS les profils, en silence, sur une base pas encore migrée. On tente la
    // sélection riche, et on retombe une fois sur created_at si elle est refusée.
    let selectColumns = 'id, slug, created_at, category, updated_at'

    // Le `select()` est dynamique : supabase-js ne peut plus inférer la ligne,
    // on la décrit donc explicitement. `updated_at` est optionnel par nature.
    interface ProfileRow {
      id: string | null
      slug: string | null
      created_at: string | null
      category: string | null
      updated_at?: string | null
    }

    const fetchPage = async (from: number, to: number) => {
      const res = await supabase
        .from('public_profiles')
        .select(selectColumns)
        .range(from, to)
      return {
        rows: (res.data || []) as unknown as ProfileRow[],
        error: res.error,
      }
    }

    for (let from = 0; from < MAX_PROFILES; from += PAGE_SIZE) {
      const to = from + PAGE_SIZE - 1
      let { rows: profiles, error } = await fetchPage(from, to)

      // Repli ciblé : uniquement quand la colonne est refusée (42703), pas sur
      // une panne réseau — inutile de doubler la requête quand la base est
      // injoignable, l'erreur est alors journalisée telle quelle juste après.
      const columnMissing =
        !!error &&
        (error.code === '42703' || error.message?.includes('updated_at'))

      if (columnMissing && selectColumns.includes('updated_at')) {
        console.warn(
          `[sitemap] updated_at indisponible sur public_profiles (${error?.message}) — repli sur created_at. ` +
            'Jouer sql/migrations/20260903_add_updated_at_to_public_profiles.sql pour restaurer la fraîcheur réelle.'
        )
        selectColumns = 'id, slug, created_at, category'
        ;({ rows: profiles, error } = await fetchPage(from, to))
      }

      // Une erreur ici vide le sitemap de tous ses profils : elle ne doit jamais
      // passer inaperçue. C'est ce silence qui a rendu la panne invisible.
      if (error) {
        console.error('[sitemap] lecture des profils échouée :', error.message)
        break
      }
      if (profiles.length === 0) break

      for (const profile of profiles) {
        profileRoutes.push({
          // URL canonique : slug si disponible (SEO-friendly), sinon l'id.
          url: `${SITE_URL}/profil/${profile.slug || profile.id}`,
          // Fraîcheur réelle : updated_at (bio, rôle, avatar…) plutôt que la
          // seule date de création, pour que Google re-crawl ce qui change.
          lastModified: new Date(
            profile.updated_at || profile.created_at || new Date().toISOString()
          ),
          changeFrequency: 'weekly',
          priority: 0.8,
        })

        const option = profile.category ? resolveProfileCategory(profile.category) : null
        if (option) usedCategories.add(option.value)
      }

      // Dernière page partielle : on a tout récupéré.
      if (profiles.length < PAGE_SIZE) break
    }

    // 3. Pages SEO par catégorie (vitrines « Annuaire des X »).
    //    La liste est DÉDUITE des profils ci-dessus, plus jamais recopiée à la
    //    main : l'ancienne liste figée contenait « sante », « education »,
    //    « restauration » et « commerce », qui n'existent pas dans
    //    PROFILE_CATEGORIES — ces URL répondent 404 depuis la validation des
    //    routes, et un sitemap qui pointe vers des 404 ruine la confiance que
    //    Google lui accorde. On ne publie donc que des catégories connues ET
    //    effectivement peuplées.
    const categoryRoutes: MetadataRoute.Sitemap = [...usedCategories].sort().map((cat) => ({
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
