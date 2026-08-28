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
        description: `Découvrez les meilleurs ${categoryName}s d'Afrique. Parcourez les profils vérifiés sur EmiID.`,
        keywords: `${category}, annuaire ${category}, freelance afrique, artisan afrique, nexus connect`
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
