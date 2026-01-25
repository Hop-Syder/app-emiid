/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Aperçu dynamique du profil en cours de création
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Shield, MapPin } from "lucide-react"

interface CreerProfilPreviewProps {
    formData: any
}

export function CreerProfilPreview({ formData }: CreerProfilPreviewProps) {
    return (
        <Card className="rounded-3xl h-fit sticky top-24">
            <CardHeader>
                <CardTitle>Aperçu</CardTitle>
                <CardDescription>Votre profil tel qu'il apparaîtra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name || "Preview"} />
                        <AvatarFallback>{formData.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className="rounded-full">
                        <Shield className="mr-1 h-3 w-3" />À vérifier
                    </Badge>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{formData.name || "Votre nom"}</h3>
                    <p className="text-sm text-muted-foreground">{formData.role || "Votre titre"}</p>
                </div>

                {(formData.city || formData.country_name) && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {formData.city}{formData.city && formData.country_name ? ", " : ""}{formData.country_name}
                    </div>
                )}

                {formData.specialty && <Badge className="rounded-xl">{formData.specialty}</Badge>}

                {formData.category && (
                    <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
                        {formData.category}
                    </Badge>
                )}

                {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {formData.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="rounded-full text-[10px] px-2 py-0">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {formData.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3 pt-2 border-t">{formData.bio}</p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span>0 abonnés</span>
                    <span>0 projets</span>
                </div>
            </CardContent>
        </Card>
    )
}
