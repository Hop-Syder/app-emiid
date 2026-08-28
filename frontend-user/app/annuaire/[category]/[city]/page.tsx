import { NavigationShell } from "@/components/navigation/navigation-shell"
import { Metadata } from "next"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"

interface CityPageProps {
    params: Promise<{ category: string; city: string }>
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
    const { category, city } = await params
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ')
    
    return {
        title: `Annuaire des ${categoryName}s à ${cityName} | EmiID`,
        description: `Trouvez les meilleurs ${categoryName}s basés à ${cityName}. Parcourez les profils d'experts locaux sur EmiID.`,
        keywords: `${category} ${cityName}, annuaire ${category} ${cityName}, expert ${cityName}, freelance ${cityName}, artisan ${cityName}, nexus connect`
    }
}

export default async function CityPage({ params }: CityPageProps) {
    const { category, city } = await params
    const cityName = city.replace(/-/g, ' ')
    
    return (
        <NavigationShell isPublic={true}>
            <div className="flex-1 w-full min-h-screen flex flex-col">
                <AnnuairePublicContent initialCategory={category} initialCity={cityName} />
            </div>
        </NavigationShell>
    )
}
