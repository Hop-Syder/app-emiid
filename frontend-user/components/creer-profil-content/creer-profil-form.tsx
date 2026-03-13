/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Formulaire de création de profil
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Save, Eye, EyeOff, X } from "lucide-react"
import { LocationSelector } from "@/components/LocationSelector"
import { useState } from "react"

interface CreerProfilFormProps {
    formData: any
    setFormData: any
    handleInputChange: (field: string, value: string) => void
    handleSave: () => void
    handlePublish: () => void
    handleUnpublish: () => void
    isPublished: boolean
    countries: any[]
    tags: string[]
}

export function CreerProfilForm({
    formData,
    setFormData,
    handleInputChange,
    handleSave,
    handlePublish,
    handleUnpublish,
    isPublished,
    countries,
    tags
}: CreerProfilFormProps) {
    const [tagInput, setTagInput] = useState("")

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
            handleInputChange("tags", [...tags, tagInput.trim().toLowerCase()] as any)
            setTagInput("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        handleInputChange("tags", tags.filter(t => t !== tagToRemove) as any)
    }
    return (
        <Card className="rounded-3xl lg:col-span-2">
            <CardHeader>
                <CardTitle>Informations du Profil</CardTitle>
                <CardDescription>Complétez vos informations professionnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger id="category" className="rounded-2xl">
                            <SelectValue placeholder="Choisissez votre catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="artisan">Artisan</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                            <SelectItem value="entreprise">Entreprise</SelectItem>
                            <SelectItem value="ong">ONG</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Awa Diallo"
                            className="rounded-2xl"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Titre professionnel *</Label>
                        <Input
                            id="role"
                            placeholder="Ex: Artisan Textile"
                            className="rounded-2xl"
                            value={formData.role}
                            onChange={(e) => handleInputChange("role", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                        <LocationSelector
                            defaultCountryCode={formData.country_code}
                            defaultCity={formData.city}
                            onLocationSelect={(countryInfo, cityName) => {
                                const localCountry = countries.find(c => c.iso_code === countryInfo.isoCode);
                                setFormData((prev: any) => ({
                                    ...prev,
                                    country_id: localCountry?.id || "",
                                    country_code: countryInfo.isoCode,
                                    country_name: countryInfo.name,
                                    city: cityName
                                }));
                            }}
                        />
                        {(formData.country_name || formData.city) && (
                            <div className="flex items-center gap-2 mt-2 px-1 text-sm text-muted-foreground">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                <span>Sélection actuelle :</span>
                                <span className="font-semibold text-foreground">
                                    {formData.country_name} {formData.country_name && formData.city ? "-" : ""} {formData.city}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="specialty">Spécialité *</Label>
                        <Input
                            id="specialty"
                            placeholder="Ex: Tissage traditionnel"
                            className="rounded-2xl"
                            value={formData.specialty}
                            onChange={(e) => handleInputChange("specialty", e.target.value)}
                        />
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea
                        id="bio"
                        placeholder="Parlez de votre parcours et de vos compétences..."
                        className="rounded-2xl min-h-[120px]"
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                    />
                    {formData.bio && (
                        <div className="flex items-start gap-2 mt-2 px-1 text-sm text-muted-foreground bg-muted/20 p-2 rounded-xl border border-muted/50">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                            <div>
                                <span className="block text-xs uppercase opacity-70 mb-1">Texte enregistré :</span>
                                <span className="font-medium text-foreground italic">
                                    "{formData.bio.length > 200 ? formData.bio.substring(0, 200) + '...' : formData.bio}"
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                            id="phone"
                            placeholder="+221 77 123 45 67"
                            className="rounded-2xl"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="exemple@email.com"
                            className="rounded-2xl"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                        id="website"
                        placeholder="https://monsite.com"
                        className="rounded-2xl"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                    />
                </div>

                {/* Tags Section */}
                <div className="space-y-3">
                    <Label>Mots-clés professionnels (Tags)</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ex: React, Design, Textile..."
                            className="rounded-2xl"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} variant="secondary" className="rounded-2xl">Ajouter</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <div key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                <span>{tag}</span>
                                <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {tags.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 px-1.5 py-2 text-sm text-muted-foreground bg-muted/20 rounded-xl border border-muted/50">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                            <span className="text-xs uppercase opacity-70 shrink-0">Tags actuels :</span>
                            <span className="font-medium text-foreground truncate">
                                {tags.length > 8 ? tags.slice(0, 8).join(" • ") + "..." : tags.join(" • ")}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-4 border-t border-muted/20">
                    <Button
                        onClick={handleSave}
                        variant="outline"
                        className="rounded-2xl flex-1 h-12 border-muted-foreground/20 hover:bg-secondary/50 hover:text-primary transition-all duration-300"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer le Brouillon
                    </Button>

                    {!isPublished ? (
                        <Button
                            onClick={handlePublish}
                            className="rounded-2xl flex-[2] h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 transform"
                        >
                            <Eye className="mr-2 h-5 w-5" />
                            <span className="font-semibold text-lg">Publier le Profil</span>
                        </Button>
                    ) : (
                        <Button
                            onClick={handleUnpublish}
                            variant="destructive"
                            className="rounded-2xl flex-1 h-12 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm"
                        >
                            <EyeOff className="mr-2 h-4 w-4" />
                            Dépublier (Passer hors ligne)
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
