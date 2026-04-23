/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Formulaire de création de profil
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Badge } from "@/components/ui/badge"

import { AvatarUpload } from "@/components/AvatarUpload"

interface CreerProfilFormProps {
    formData: any
    setFormData: any
    handleInputChange: (field: string, value: any) => void
    handleSave: () => void
    handlePublish: () => void
    handleUnpublish: () => void
    isPublished: boolean
    countries: any[]
    tags: string[]
    validationErrors: string[]
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
    tags,
    validationErrors
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
        <Card className="rounded-xl lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Save className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Informations du Profil</CardTitle>
                        <CardDescription className="text-sm font-medium">Maximisez votre visibilité en complétant votre identité professionnelle</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 p-6 lg:p-8">
                <div className="space-y-3">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-primary text-primary">0</Badge>
                        Photo de profil
                    </Label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5">
                        <AvatarUpload
                            currentAvatarUrl={formData.avatar || null}
                            onUploadComplete={(newUrl: string) => handleInputChange("avatar", newUrl)}
                        />
                    </div>
                </div>

                {validationErrors.length > 0 && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-900">
                        <p className="text-sm font-bold">Le profil doit être corrigé avant la publication</p>
                        <ul className="mt-2 space-y-1 text-sm text-rose-800">
                            {validationErrors.map((error) => (
                                <li key={error}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Category Selection */}
                <div className="space-y-3">
                    <Label htmlFor="category" className="text-sm font-bold flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-primary text-primary">1</Badge>
                        Catégorie de compte *
                    </Label>
                    <Select value={formData.category || ""} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger id="category" className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all">
                            <SelectValue placeholder="Choisissez votre catégorie..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            <SelectItem value="artisan" className="rounded-xl py-3 cursor-pointer">🎨 Artisan</SelectItem>
                            <SelectItem value="commerçante" className="rounded-xl py-3 cursor-pointer">🛒 Commerçante</SelectItem>
                            <SelectItem value="freelance" className="rounded-xl py-3 cursor-pointer">💻 Freelance</SelectItem>
                            <SelectItem value="entreprise" className="rounded-xl py-3 cursor-pointer">🏢 Entreprise</SelectItem>
                            <SelectItem value="agence" className="rounded-xl py-3 cursor-pointer">📣 Agence</SelectItem>
                            <SelectItem value="startup" className="rounded-xl py-3 cursor-pointer">🚀 Startup</SelectItem>
                            <SelectItem value="ong" className="rounded-xl py-3 cursor-pointer">🌍 ONG</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Card Style Selection */}
                <div className="space-y-3">
                    <Label htmlFor="card_variant" className="text-sm font-bold flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-primary text-primary">✨</Badge>
                        Design de votre Carte EmiID *
                    </Label>
                    <Select value={formData.card_variant || "tech"} onValueChange={(value) => handleInputChange("card_variant", value)}>
                        <SelectTrigger id="card_variant" className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all">
                            <SelectValue placeholder="Choisissez le design de votre carte..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            <SelectItem value="tech" className="rounded-xl py-3 cursor-pointer">🟠 EmiID Tech (Minimalist & Orange)</SelectItem>
                            <SelectItem value="glass" className="rounded-xl py-3 cursor-pointer">🔵 EmiID Glass (Modern & Blue)</SelectItem>
                            <SelectItem value="elite" className="rounded-xl py-3 cursor-pointer">⭐ EmiID Elite (Premium & Gold)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground ml-1">Ce design sera visible dans l&apos;annuaire au survol de votre profil.</p>
                </div>

                {/* Personal Info */}
                <div className="space-y-6">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-primary text-primary">2</Badge>
                        Identité Professionnelle
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground ml-1">Nom Complet *</Label>
                            <Input
                                id="name"
                                placeholder="Prénom et Nom"
                                className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20"
                                value={formData.name || ""}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-xs font-semibold text-muted-foreground ml-1">Poste actuel ou Entreprise *</Label>
                            <Input
                                id="role"
                                placeholder="Ex: Directeur Créatif ou Nom de l'agence"
                                className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20"
                                value={formData.role || ""}
                                onChange={(e) => handleInputChange("role", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Lien Personnalisé (Slug) */}
                <div className="space-y-3 pt-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-primary text-primary">🔗</Badge>
                        Lien personnalisé (URL de votre profil)
                    </Label>
                    <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <div className="bg-slate-100 px-4 py-4 text-slate-500 font-medium text-sm border-r border-slate-200 flex items-center whitespace-nowrap">
                            emiid.app/profil/
                        </div>
                        <Input
                            id="slug"
                            placeholder="mon-prenom-nom"
                            className="h-14 border-none bg-transparent shadow-none focus-visible:ring-0 px-4 font-bold text-slate-800 lowercase w-full"
                            value={formData.slug || ""}
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                                handleInputChange("slug", val);
                            }}
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-1">Ce lien cachera votre identifiant interne. Utilisez un format simple comme &quot;daouda-abassi&quot;.</p>
                </div>

                {/* Localisation */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-primary text-primary">3</Badge>
                        Localisation & Spécialité
                    </Label>
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                            <LocationSelector
                                defaultCountryCode={formData.country_code}
                                defaultCity={formData.city}
                                onLocationSelect={(countryInfo, cityName) => {
                                    const localCountry = countries.find((c: any) => c.iso_code === countryInfo.isoCode);
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
                                <div className="flex items-center gap-3 py-2 px-4 bg-white/80 rounded-xl border border-slate-200/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 animate-pulse"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Zone active :</span>
                                    <span className="text-sm font-extrabold text-slate-900">
                                        {formData.country_name} {formData.country_name && formData.city ? "•" : ""} {formData.city}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="specialty" className="text-xs font-semibold text-muted-foreground ml-1">Domaine d&apos;expertise précis *</Label>
                            <Input
                                id="specialty"
                                placeholder="Ex: Développement Web Fullstack ou Menuiserie d'art"
                                className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20"
                                value={formData.specialty || ""}
                                onChange={(e) => handleInputChange("specialty", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Biographie */}
                <div className="space-y-3">
                    <Label htmlFor="bio" className="text-sm font-bold flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-primary text-primary">4</Badge>
                        Votre Histoire (Bio)
                    </Label>
                    <Textarea
                        id="bio"
                        placeholder="Racontez votre parcours, vos plus belles réalisations et ce qui vous passionne. C'est ici que vous convainquez vos futurs clients."
                        className="rounded-xl min-h-[160px] bg-slate-50 border-slate-200 focus:ring-primary/20 p-5 leading-relaxed text-slate-700"
                        value={formData.bio || ""}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                    />
                    {formData.bio && (
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 transition-all duration-300">
                           <div className="flex items-center gap-2 mb-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                               <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Aperçu du contenu enregistré</span>
                           </div>
                           <p className="text-sm text-slate-600 line-clamp-3 italic leading-relaxed">
                               &quot;{formData.bio}&quot;
                           </p>
                        </div>
                    )}
                </div>

                {/* Contact & Web */}
                <div className="space-y-4 pt-4">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-primary text-primary">5</Badge>
                        Canaux de Contact
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Input
                                id="phone"
                                placeholder="Téléphone mobile"
                                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                                value={formData.phone || ""}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Input
                                id="email"
                                type="email"
                                placeholder="Contact email professionnel"
                                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                                value={formData.email || ""}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        </div>
                    </div>
                    <Input
                        id="website"
                        placeholder="Portfolio ou Site Web (https://...)"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200"
                        value={formData.website || ""}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                    />
                </div>

                {/* Tags Section */}
                <div className="space-y-4 pt-4 pb-4">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] border-primary text-primary">6</Badge>
                        Compétences & Mots-clés (Tags)
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Appuyez sur Entrée pour ajouter (ex: Marketing, Python...)"
                            className="h-14 rounded-xl bg-slate-50 border-slate-200 shadow-sm"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} variant="secondary" className="h-14 rounded-xl px-6 font-bold">Ajouter</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {tags && tags.length > 0 ? tags.map((tag) => (
                            <div 
                                key={tag} 
                                className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white pl-4 pr-2 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/10"
                            >
                                <span>{tag}</span>
                                <button onClick={() => removeTag(tag)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )) : (
                            <p className="text-xs text-muted-foreground italic pl-1">Aucun tag ajouté pour le moment</p>
                        )}
                    </div>
                </div>

                {/* Major Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
                    <Button
                        onClick={handleSave}
                        variant="outline"
                        className="rounded-xl flex-1 h-14 border-slate-200 text-slate-600 font-bold hover:bg-green-500 hover:text-white hover:border-green-500 group transition-all"
                    >
                        <Save className="mr-2 h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                        Sauvegarder
                    </Button>

                    {!isPublished ? (
                        <Button
                            onClick={handlePublish}
                            className="rounded-xl flex-[1.5] h-14 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200 transition-all duration-300 font-extrabold text-lg shadow-xl shadow-blue-100"
                        >
                            <Eye className="mr-2 h-6 w-6" />
                            Mettre en ligne
                        </Button>
                    ) : (
                        <Button
                            onClick={handleUnpublish}
                            variant="destructive"
                            className="rounded-xl flex-1 h-14 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold shadow-sm"
                        >
                            <EyeOff className="mr-2 h-5 w-5" />
                            Retirer de l&apos;annuaire
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
