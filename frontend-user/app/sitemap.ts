import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://app.emiid.com'
  
  // 1. Les routes principales (Statiques)
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/annuaire`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    }
  ]

  // 2. Les routes dynamiques (Profils utilisateurs publiés)
  // Nous utilisons le client JS standard car c'est une exécution serveur isolée
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // IMPORTANT : on lit la VUE public_profiles (lisible par anon). La table
    // user_profiles est protégée par la RLS → en anon elle renvoie 0 ligne,
    // ce qui vidait le sitemap de tous les profils.
    const { data: profiles } = await supabase
      .from('public_profiles')
      .select('id, slug, created_at')

    const profileRoutes = (profiles || []).map((profile) => ({
      // URL canonique : slug si disponible (SEO-friendly), sinon l'id.
      url: `${baseUrl}/profil/${profile.slug || profile.id}`,
      lastModified: profile.created_at ? new Date(profile.created_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // 3. (Optionnel pour le futur) On pourrait aussi ajouter ici les routes du SEO Local (Programmatic)
    // Ex: /annuaire/freelance/abidjan

    return [...routes, ...profileRoutes]
  } catch (error) {
    console.error("Erreur lors de la génération du sitemap:", error)
    // En cas d'erreur de la BDD, on retourne au moins les pages de base pour ne pas bloquer Google
    return routes
  }
}
