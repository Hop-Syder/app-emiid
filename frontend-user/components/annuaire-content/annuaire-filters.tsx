/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Filtres de l'annuaire des profils
 * @created 2025-12-24
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/
"use client"

import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AnnuaireFilters() {
    return (
        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Filtres</CardTitle>
                <CardDescription>Affinez votre recherche</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="annuaire-search-input"
                            name="annuaire_search"
                            autoComplete="off"
                            placeholder="Rechercher un profil..."
                            className="pl-9 rounded-xl"
                        />
                    </div>
                    <Select>
                        <SelectTrigger className="w-full md:w-[200px] rounded-xl">
                            <SelectValue placeholder="Localisation" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les pays</SelectItem>
                            <SelectItem value="senegal">Sénégal</SelectItem>
                            <SelectItem value="ghana">Ghana</SelectItem>
                            <SelectItem value="mali">Mali</SelectItem>
                            <SelectItem value="cote-ivoire">Côte d&apos;Ivoire</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="w-full md:w-[200px] rounded-xl">
                            <SelectValue placeholder="Vérification" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="verified">Vérifiés uniquement</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}
