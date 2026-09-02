import { NavigationShell } from "@/components/navigation/navigation-shell"
import { Metadata } from "next"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"
import { absoluteUrl, serializeJsonLd } from "@/lib/seo"

interface CityPageProps {
    params: Promise<{ category: string; city: string }>
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
    const { category, city } = await params
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ')
    
    return {
        title: `Annuaire des ${categoryName}s à ${cityName} | EmiID`,
        description: `Trouvez les meilleurs ${categoryName}s basés à ${cityName}. Parcourez les profils d'experts et artisans locaux sur EmiID.`,
        keywords: `${category} ${cityName}, annuaire ${category} ${cityName}, expert ${cityName}, freelance ${cityName}, artisan ${cityName}, EmiID`,
        alternates: {
            canonical: `/annuaire/${category}/${city}`,
        },
        openGraph: {
            title: `Annuaire des ${categoryName}s à ${cityName} | EmiID`,
            description: `Trouvez les professionnels certifiés (${categoryName}) basés à ${cityName} sur EmiID.`,
            url: `/annuaire/${category}/${city}`,
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
    const cityName = city.replace(/-/g, ' ')
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)

    // Fil d'Ariane structuré : Accueil → Annuaire → Catégorie → Ville.
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: absoluteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Annuaire', item: absoluteUrl('/annuaire') },
            { '@type': 'ListItem', position: 3, name: categoryName, item: absoluteUrl(`/annuaire/${category}`) },
            { '@type': 'ListItem', position: 4, name: cityName, item: absoluteUrl(`/annuaire/${category}/${city}`) },
        ],
    }

    return (
        <NavigationShell isPublic={true}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
            />
            <div className="flex-1 w-full min-h-screen flex flex-col">
                <AnnuairePublicContent initialCategory={category} initialCity={cityName} />
            </div>
        </NavigationShell>
    )
}
