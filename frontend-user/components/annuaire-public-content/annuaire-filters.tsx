/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Filtres pour l'annuaire avec sélection de catégorie redirigeant vers les pages spécifiques
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { Search, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnnuaireFiltersProps {
    currentCategory?: string;
}

export function AnnuaireFilters({ currentCategory }: AnnuaireFiltersProps) {
    const router = useRouter()

    const handleCategoryChange = (value: string) => {
        if (value === "all") {
            router.push("/annuaire")
        } else {
            router.push(`/annuaire/${value}`);
        }
    }

    return (
        <Card className="rounded-3xl border-none shadow-sm mb-6">
            <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, métier ou spécialité..."
                            className="pl-12 h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Select onValueChange={handleCategoryChange} value={currentCategory || "all"}>
                            <SelectTrigger className="w-[180px] h-12 rounded-2xl bg-muted/50 border-none">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all">Secteur (Tous)</SelectItem>
                                <SelectItem value="artisans">Artisans</SelectItem>
                                <SelectItem value="freelances">Freelances</SelectItem>
                                <SelectItem value="entreprises">Entreprises</SelectItem>
                                <SelectItem value="ong">ONG</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px] h-12 rounded-2xl bg-muted/50 border-none">
                                <SelectValue placeholder="Localisation" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all">Afrique de l'Ouest</SelectItem>
                                <SelectItem value="benin">Bénin</SelectItem>
                                <SelectItem value="senegal">Sénégal</SelectItem>
                                <SelectItem value="cote-ivoire">Côte d'Ivoire</SelectItem>
                                <SelectItem value="mali">Mali</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select defaultValue="all">
                            <SelectTrigger className="w-[150px] h-12 rounded-2xl bg-muted/50 border-none">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="verified">Vérifiés</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
