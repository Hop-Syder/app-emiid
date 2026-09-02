/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page SEO d'une catégorie de l'annuaire (/annuaire/[category]).
 *              Le segment est validé contre PROFILE_CATEGORIES : toute autre
 *              valeur répond 404, jamais une page vide en 200.
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

interface CategoryPageProps {
    params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { category } = await params
    const option = resolveProfileCategory(category)

    // Segment inconnu : la page répondra 404 (cf. composant). On renvoie des
    // métadonnées neutres en noindex plutôt qu'un titre inventé à partir de
    // l'URL, qui donnerait prise à l'indexation d'une page inexistante.
    if (!option) {
        return {
            title: "Catégorie introuvable | EmiID",
            robots: { index: false, follow: false },
        }
    }

    const categoryName = categoryLabel(option)

    return {
        title: `Annuaire des ${categoryName}s en Afrique | EmiID`,
        description: `Découvrez les meilleurs ${categoryName}s d'Afrique. Parcourez les profils vérifiés, compétences et réalisations sur EmiID.`,
        keywords: `${categoryName}, annuaire ${categoryName}, freelance afrique, artisan afrique, talents afrique, EmiID`,
        alternates: {
            canonical: `/annuaire/${option.value}`,
        },
        openGraph: {
            title: `Annuaire des ${categoryName}s en Afrique | EmiID`,
            description: `Trouvez et contactez les meilleurs ${categoryName}s d'Afrique certifiés sur EmiID.`,
            url: `/annuaire/${option.value}`,
            siteName: "EmiID",
            locale: "fr_FR",
            type: "website",
            images: [
                {
                    url: "/logo-emiid-bleu-blanc.png",
                    width: 500,
                    height: 500,
                    type: "image/png",
                    alt: `Annuaire des ${categoryName}s | EmiID`,
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: `Annuaire des ${categoryName}s en Afrique | EmiID`,
            description: `Découvrez les profils vérifiés de ${categoryName}s en Afrique sur EmiID.`,
            creator: "@hopsyder",
            images: ["/logo-emiid-bleu-blanc.png"]
        }
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = await params

    // Sans cette garde, /annuaire/nimportequoi répondait 200 avec un titre
    // fabriqué et un fil d'Ariane structuré : un soft-404 indexable, sur un
    // nombre illimité d'URL. Même traitement que /profil/[id].
    const option = resolveProfileCategory(category)
    if (!option) notFound()

    const categoryName = categoryLabel(option)

    // Fil d'Ariane structuré : Accueil → Annuaire → Catégorie.
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: absoluteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Annuaire', item: absoluteUrl('/annuaire') },
            { '@type': 'ListItem', position: 3, name: categoryName, item: absoluteUrl(`/annuaire/${option.value}`) },
        ],
    }

    return (
        <NavigationShell isPublic={true}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
            />
            <div className="flex-1 w-full min-h-screen flex flex-col">
                <AnnuairePublicContent initialCategory={option.value} />
            </div>
        </NavigationShell>
    )
}
