import { NavigationShell } from "@/components/navigation/navigation-shell"
import { Metadata } from "next"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"

interface CategoryPageProps {
    params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { category } = await params
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
    
    return {
        title: `Annuaire des ${categoryName}s en Afrique | EmiID`,
        description: `Découvrez les meilleurs ${categoryName}s d'Afrique. Parcourez les profils vérifiés, compétences et réalisations sur EmiID.`,
        keywords: `${category}, annuaire ${category}, freelance afrique, artisan afrique, talents afrique, EmiID`,
        alternates: {
            canonical: `/annuaire/${category}`,
        },
        openGraph: {
            title: `Annuaire des ${categoryName}s en Afrique | EmiID`,
            description: `Trouvez et contactez les meilleurs ${categoryName}s d'Afrique certifiés sur EmiID.`,
            url: `https://app.emiid.com/annuaire/${category}`,
            siteName: "EmiID",
            locale: "fr_FR",
            type: "website",
            images: [
                {
                    url: "/logo-emiid-bleu-blanc.png",
                    width: 500,
                    height: 500,
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
    return (
        <NavigationShell isPublic={true}>
            <div className="flex-1 w-full min-h-screen flex flex-col">
                <AnnuairePublicContent initialCategory={category} />
            </div>
        </NavigationShell>
    )
}
