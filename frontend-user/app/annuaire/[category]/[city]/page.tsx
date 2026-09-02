/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page SEO « catégorie × ville » (/annuaire/[category]/[city]).
 *              Deux gardes : la catégorie doit exister dans PROFILE_CATEGORIES,
 *              et la ville doit compter au moins un profil publié. Sinon 404 —
 *              une page « Annuaire des Artisans à Nulle-Part » sans le moindre
 *              profil est du contenu vide, que Google pénalise.
 * @created 2026-08-30
 * @updated 2026-09-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NavigationShell } from "@/components/navigation/navigation-shell"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"
import { absoluteUrl, serializeJsonLd } from "@/lib/seo"
import { resolveProfileCategory, categoryLabel } from "@/lib/profile-options"
import { createClient } from "@/lib/supabase/server"

// Régénérée toutes les heures : une ville qui vient d'accueillir son premier
// profil devient consultable sans redéploiement.
export const revalidate = 3600

interface CityPageProps {
    params: Promise<{ category: string; city: string }>
}

/** « porto-novo » → « Porto Novo » (libellé lisible pour titres et fil d'Ariane). */
function cityLabel(city: string): string {
    return decodeURIComponent(city || "")
        .replace(/-/g, " ")
        .trim()
        .replace(/\b\p{L}/gu, (c) => c.toUpperCase())
}

/**
 * Vrai s'il existe au moins un profil publié de cette catégorie dans cette ville.
 *
 * En cas d'erreur de lecture, on renvoie `true` : une base momentanément
 * injoignable ne doit pas transformer une page légitime en 404 — Google
 * désindexerait des URL valides sur un simple incident.
 */
async function hasProfiles(category: string, city: string): Promise<boolean> {
    try {
        const supabase = await createClient()
        const { count, error } = await supabase
            .from("public_profiles")
            .select("id", { count: "exact", head: true })
            .ilike("category", category)
            .ilike("city", `%${city}%`)

        if (error) {
            console.warn("[annuaire/city] vérification impossible :", error.message)
            return true
        }
        return (count ?? 0) > 0
    } catch (err) {
        console.warn("[annuaire/city] vérification impossible :", (err as Error)?.message)
        return true
    }
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
    const { category, city } = await params
    const option = resolveProfileCategory(category)

    // Segment inconnu : la page répondra 404. Métadonnées neutres en noindex
    // plutôt qu'un titre fabriqué à partir de l'URL.
    if (!option) {
        return {
            title: "Page introuvable | EmiID",
            robots: { index: false, follow: false },
        }
    }

    const categoryName = categoryLabel(option)
    const cityName = cityLabel(city)

    return {
        title: `Annuaire des ${categoryName}s à ${cityName} | EmiID`,
        description: `Trouvez les meilleurs ${categoryName}s basés à ${cityName}. Parcourez les profils d'experts et artisans locaux sur EmiID.`,
        keywords: `${categoryName} ${cityName}, annuaire ${categoryName} ${cityName}, expert ${cityName}, freelance ${cityName}, artisan ${cityName}, EmiID`,
        alternates: {
            canonical: `/annuaire/${option.value}/${city}`,
        },
        openGraph: {
            title: `Annuaire des ${categoryName}s à ${cityName} | EmiID`,
            description: `Trouvez les professionnels certifiés (${categoryName}) basés à ${cityName} sur EmiID.`,
            url: `/annuaire/${option.value}/${city}`,
            siteName: "EmiID",
            locale: "fr_FR",
            type: "website",
            images: [
                {
                    url: "/logo-emiid-bleu-blanc.png",
                    width: 500,
                    height: 500,
                    type: "image/png",
                    alt: `Annuaire des ${categoryName}s à ${cityName} | EmiID`,
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: `Annuaire des ${categoryName}s à ${cityName} | EmiID`,
            description: `Découvrez les profils de ${categoryName}s à ${cityName} sur EmiID.`,
            creator: "@hopsyder",
            images: ["/logo-emiid-bleu-blanc.png"]
        }
    }
}

export default async function CityPage({ params }: CityPageProps) {
    const { category, city } = await params

    const option = resolveProfileCategory(category)
    if (!option) notFound()

    const cityName = cityLabel(city)
    const categoryName = categoryLabel(option)

    // Une combinaison catégorie × ville sans aucun profil n'a pas de page :
    // le nombre de villes est illimité, autant d'URL vides sinon indexables.
    if (!(await hasProfiles(option.value, cityName))) notFound()

    // Fil d'Ariane structuré : Accueil → Annuaire → Catégorie → Ville.
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: absoluteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Annuaire', item: absoluteUrl('/annuaire') },
            { '@type': 'ListItem', position: 3, name: categoryName, item: absoluteUrl(`/annuaire/${option.value}`) },
            { '@type': 'ListItem', position: 4, name: cityName, item: absoluteUrl(`/annuaire/${option.value}/${city}`) },
        ],
    }

    return (
        <NavigationShell isPublic={true}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
            />
            <div className="flex-1 w-full min-h-screen flex flex-col">
                <AnnuairePublicContent initialCategory={option.value} initialCity={cityName} />
            </div>
        </NavigationShell>
    )
}
