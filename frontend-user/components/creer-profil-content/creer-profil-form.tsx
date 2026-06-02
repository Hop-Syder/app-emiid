/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Formulaire de création de profil - Redesign "Beauty First"
 * @created 2026-01-16
 * @updated 2026-06-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Save, Eye, EyeOff, X, Loader2, Camera, User, Briefcase, MapPin, Link as LinkIcon, MessageSquare, Tags, Palette, Sparkles } from "lucide-react"
import { LocationSelector } from "@/components/LocationSelector"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { AvatarUpload } from "@/components/AvatarUpload"
import { cn } from "@/lib/utils"

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
    saving: boolean
    publishing: boolean
    unpublishing: boolean
}

const FormSection = ({ title, icon: Icon, children, delay = 0, className }: { title: string, icon: any, children: React.ReactNode, delay?: number, className?: string }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={cn("bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-5 md:p-6 lg:p-8 relative overflow-hidden", className)}
    >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/10">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
        {children}
    </motion.section>
)

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
    validationErrors,
    saving,
    publishing,
    unpublishing,
}: CreerProfilFormProps) {
    const [tagInput, setTagInput] = useState("")

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
            handleInputChange("tags", [...tags, tagInput.trim().toLowerCase()] as any)
            setTagInput("")
        }
    }

    const addSuggestedTag = (tag: string) => {
        const normalized = tag.trim().toLowerCase()
        if (!tags.includes(normalized)) {
            handleInputChange("tags", [...tags, normalized] as any)
        }
    }

    const removeTag = (tagToRemove: string) => {
        handleInputChange("tags", tags.filter(t => t !== tagToRemove) as any)
    }

    const calculateProgress = () => {
        let score = 0;
        const total = 9;
        
        if (formData.name?.trim()) score++;
        if (formData.role?.trim()) score++;
        if (formData.category) score++;
        if (formData.specialty?.trim()) score++;
        if (formData.bio?.trim()) score++;
        if (formData.city?.trim()) score++;
        if (formData.slug?.trim()) score++;
        if (formData.avatar && !formData.avatar.includes("avatar.jpg")) score++;
        if (tags && tags.length > 0) score++;
        
        return Math.round((score / total) * 100);
    }
    const progress = calculateProgress();

    const inputClasses = "h-14 rounded-2xl bg-white/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm"

    return (
        <div className="lg:col-span-2 space-y-6 pb-32">
            
            {/* JAUGE DE PROGRESSION */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-3xl p-5 md:p-6"
            >
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <h3 className="font-bold text-slate-800">Complétion du profil</h3>
                        <p className="text-xs text-slate-500 font-medium">Un profil complet inspire plus de confiance.</p>
                    </div>
                    <span className="text-2xl font-black text-primary">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/50">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }} 
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                            "h-full rounded-full transition-all",
                            progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-primary/60 to-primary"
                        )}
                    />
                </div>
            </motion.div>

            {validationErrors.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-rose-200 bg-rose-50/80 backdrop-blur-md px-6 py-5 shadow-lg shadow-rose-100/50">
                    <p className="text-sm font-bold text-rose-900 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                        Le profil doit être corrigé avant la publication
                    </p>
                    <ul className="mt-3 space-y-1.5 text-sm text-rose-800 font-medium">
                        {validationErrors.map((error, i) => (
                            <motion.li key={error} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                                • {error}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* SECTION 1: Identité Visuelle */}
            <FormSection title="Identité Visuelle" icon={Camera} delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-slate-700">Photo de profil</Label>
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/30 transition-all p-4">
                            <AvatarUpload
                                currentAvatarUrl={formData.avatar || null}
                                onUploadComplete={(newUrl: string) => handleInputChange("avatar", newUrl)}
                            />
                        </div>
                    </div>
                    
                    <div className="hidden md:flex flex-col justify-center items-start space-y-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-3xl border border-blue-100/50">
                        <div className="p-2.5 bg-blue-100/80 rounded-xl text-blue-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 mb-1">Le secret d'un bon profil</h4>
                            <p className="text-sm text-blue-800/80 leading-relaxed font-medium">
                                Une photo claire, professionnelle et souriante augmente vos chances d'être contacté de <strong className="text-blue-900">70%</strong>. C'est la première impression que vous donnez !
                            </p>
                        </div>
                    </div>
                </div>
            </FormSection>

            {/* SECTION 2: Informations Pro */}
            <FormSection title="Informations Professionnelles" icon={Briefcase} delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                        <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nom Complet *</Label>
                        <Input
                            id="name"
                            name="name"
                            autoComplete="name"
                            placeholder="Prénom et Nom"
                            className={inputClasses}
                            value={formData.name || ""}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="role" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Poste / Entreprise *</Label>
                        <Input
                            id="role"
                            name="organization-title"
                            autoComplete="organization-title"
                            placeholder="Ex: Designer ou Nom de l'agence"
                            className={inputClasses}
                            value={formData.role || ""}
                            onChange={(e) => handleInputChange("role", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="category" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type de Profil *</Label>
                        <Select value={formData.category || ""} onValueChange={(value) => handleInputChange("category", value)}>
                            <SelectTrigger id="category" className={inputClasses}>
                                <SelectValue placeholder="Catégorie..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1 max-h-[300px]">
                                <SelectItem value="artisan" className="rounded-xl py-3 cursor-pointer">🎨 Artisan</SelectItem>
                                <SelectItem value="commerçante" className="rounded-xl py-3 cursor-pointer">🛒 Commerçant(e)</SelectItem>
                                <SelectItem value="freelance" className="rounded-xl py-3 cursor-pointer">💻 Freelance</SelectItem>
                                <SelectItem value="entreprise" className="rounded-xl py-3 cursor-pointer">🏢 Entreprise</SelectItem>
                                <SelectItem value="agence" className="rounded-xl py-3 cursor-pointer">📣 Agence</SelectItem>
                                <SelectItem value="startup" className="rounded-xl py-3 cursor-pointer">🚀 Startup</SelectItem>
                                <SelectItem value="ong" className="rounded-xl py-3 cursor-pointer">🌍 ONG / Association</SelectItem>
                                <SelectItem value="investisseur" className="rounded-xl py-3 cursor-pointer">📈 Investisseur</SelectItem>
                                <SelectItem value="institution" className="rounded-xl py-3 cursor-pointer">🏛️ Institution Publique</SelectItem>
                                <SelectItem value="etudiant" className="rounded-xl py-3 cursor-pointer">🎓 Étudiant / Junior</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="activity_domain" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Secteur d'activité *</Label>
                        <Select value={formData.activity_domain || ""} onValueChange={(value) => handleInputChange("activity_domain", value)}>
                            <SelectTrigger id="activity_domain" className={inputClasses}>
                                <SelectValue placeholder="Secteur..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1 max-h-[300px]">
                                <SelectItem value="tech" className="rounded-xl py-3 cursor-pointer">💻 Tech & Digital</SelectItem>
                                <SelectItem value="agro" className="rounded-xl py-3 cursor-pointer">🌾 Agroalimentaire</SelectItem>
                                <SelectItem value="btp" className="rounded-xl py-3 cursor-pointer">🏗️ BTP & Construction</SelectItem>
                                <SelectItem value="finance" className="rounded-xl py-3 cursor-pointer">💰 Finance & Assurance</SelectItem>
                                <SelectItem value="sante" className="rounded-xl py-3 cursor-pointer">🏥 Santé & Bien-être</SelectItem>
                                <SelectItem value="education" className="rounded-xl py-3 cursor-pointer">📚 Éducation & Formation</SelectItem>
                                <SelectItem value="creatif" className="rounded-xl py-3 cursor-pointer">🎨 Arts & Créativité</SelectItem>
                                <SelectItem value="commerce" className="rounded-xl py-3 cursor-pointer">🛍️ Commerce & Distribution</SelectItem>
                                <SelectItem value="transport" className="rounded-xl py-3 cursor-pointer">🚚 Transport & Logistique</SelectItem>
                                <SelectItem value="tourisme" className="rounded-xl py-3 cursor-pointer">✈️ Tourisme & Hôtellerie</SelectItem>
                                <SelectItem value="energie" className="rounded-xl py-3 cursor-pointer">⚡ Énergie & Environnement</SelectItem>
                                <SelectItem value="b2b" className="rounded-xl py-3 cursor-pointer">🤝 Services B2B</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3 mt-6">
                    <Label htmlFor="specialty" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Expertise spécifique *</Label>
                    <Input
                        id="specialty"
                        name="specialty"
                        autoComplete="off"
                        placeholder="Ex: Développeur Fullstack React ou Peintre en bâtiment"
                        className={inputClasses}
                        value={formData.specialty || ""}
                        onChange={(e) => handleInputChange("specialty", e.target.value)}
                    />
                </div>
            </FormSection>

            {/* SECTION 3: Histoire & Lien */}
            <FormSection title="Présentation & Lien" icon={User} delay={0.3}>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="slug" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lien personnalisé EmiID *</Label>
                        <div className="flex flex-col sm:flex-row sm:items-center rounded-2xl bg-white/50 border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all shadow-sm">
                            <div className="bg-slate-100/50 px-3 py-3 sm:px-4 sm:py-4 text-slate-500 font-semibold text-xs sm:text-sm border-b sm:border-b-0 sm:border-r border-slate-200 flex items-center">
                                app.emiid.com/profil/
                            </div>
                            <Input
                                id="slug"
                                name="slug"
                                autoComplete="off"
                                placeholder="mon-prenom"
                                className="h-12 sm:h-14 border-none bg-transparent shadow-none focus-visible:ring-0 px-4 font-bold text-slate-800 w-full"
                                value={formData.slug || ""}
                                onChange={(e) => {
                                    const val = e.target.value
                                        .toLowerCase()
                                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
                                        .replace(/\s+/g, "-") 
                                        .replace(/[^a-z0-9-]/g, "") 
                                        .replace(/-+/g, "-")
                                    handleInputChange("slug", val)
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="bio" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Votre Histoire (Bio)</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            placeholder="Racontez votre parcours, ce qui vous passionne et ce que vous apportez à vos clients..."
                            className={cn(inputClasses, "min-h-[140px] py-4 resize-none")}
                            value={formData.bio || ""}
                            onChange={(e) => handleInputChange("bio", e.target.value)}
                        />
                    </div>
                </div>
            </FormSection>

            {/* SECTION 4: Contact & Localisation */}
            <FormSection title="Contact & Localisation" icon={MapPin} delay={0.4}>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Localisation *</Label>
                        <div className="p-1">
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Téléphone</Label>
                            <Input
                                id="phone"
                                name="tel"
                                autoComplete="tel"
                                placeholder="Numéro direct"
                                className={inputClasses}
                                value={formData.phone || ""}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Pro</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="contact@email.com"
                                className={inputClasses}
                                value={formData.email || ""}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <Label htmlFor="website" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Site Web / Portfolio</Label>
                            <Input
                                id="website"
                                name="url"
                                autoComplete="url"
                                placeholder="ex: monsite.com"
                                className={inputClasses}
                                value={formData.website || ""}
                                onChange={(e) => handleInputChange("website", e.target.value)}
                                onBlur={(e) => {
                                    const value = (e.target.value || "").trim()
                                    if (!value) return
                                    const noSpaces = value.replace(/\s+/g, "")
                                    const withProtocol = /^https?:\/\//i.test(noSpaces) ? noSpaces : `https://${noSpaces}`
                                    try {
                                        const url = new URL(withProtocol)
                                        if (["http:", "https:"].includes(url.protocol) && url.hostname.includes(".")) {
                                            handleInputChange("website", url.toString())
                                        }
                                    } catch {}
                                }}
                            />
                        </div>
                    </div>
                </div>
            </FormSection>

            {/* SECTION 5: Mots-clés */}
            <FormSection title="Compétences (Tags)" icon={Tags} delay={0.5}>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            id="tags-input"
                            autoComplete="off"
                            placeholder="Entrez un mot-clé puis Ajouter (ex: Marketing)"
                            className={inputClasses}
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} variant="secondary" className="h-14 rounded-2xl px-6 font-bold shadow-sm w-full sm:w-auto">Ajouter</Button>
                    </div>

                    {/* Exemples de compétences */}
                    <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Suggestions :</span>
                        <div className="flex flex-wrap gap-1.5">
                            {["React", "TypeScript", "UI/UX", "Marketing", "Photographie", "BTP", "Comptabilité", "Couture", "Vente", "Gestion de Projet"].map((suggestedTag) => {
                                const isAlreadyAdded = tags.includes(suggestedTag.toLowerCase())
                                return (
                                    <button
                                        key={suggestedTag}
                                        type="button"
                                        disabled={isAlreadyAdded}
                                        onClick={() => addSuggestedTag(suggestedTag)}
                                        className={cn(
                                            "text-xs px-3 py-1.5 rounded-xl transition-all border font-semibold",
                                            isAlreadyAdded
                                                ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-primary/30 hover:bg-primary/5 active:scale-95"
                                        )}
                                    >
                                        + {suggestedTag}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px] pt-2">
                        {tags && tags.length > 0 ? tags.map((tag) => (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={tag} 
                                className="flex items-center gap-2 bg-slate-900 text-white pl-4 pr-2 py-2 rounded-xl text-xs font-bold shadow-md"
                            >
                                <span>{tag}</span>
                                <button onClick={() => removeTag(tag)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </motion.div>
                        )) : (
                            <p className="text-sm text-slate-400 italic">Aucun tag ajouté.</p>
                        )}
                    </div>
                </div>
            </FormSection>

            {/* ACTION DOCK (Floating) */}
            <div className="fixed bottom-4 md:bottom-6 left-0 right-0 z-50 px-3 md:px-4 pointer-events-none flex justify-center">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring", damping: 20 }}
                    className="pointer-events-auto flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[2rem] w-full max-w-xl mx-auto"
                >
                    <Button
                        onClick={handleSave}
                        variant="outline"
                        disabled={saving || publishing || unpublishing}
                        className="rounded-full flex-1 h-12 md:h-14 border-slate-200 text-slate-700 font-bold hover:bg-slate-100 hover:text-slate-900 group transition-all text-xs md:text-sm px-2 md:px-4"
                    >
                        {saving ? <Loader2 className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" /> : <Save className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />}
                        Sauvegarder
                    </Button>

                    {!isPublished ? (
                        <Button
                            onClick={handlePublish}
                            disabled={saving || publishing || unpublishing}
                            className="rounded-full flex-[1.2] h-12 md:h-14 bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] transition-all duration-300 font-bold shadow-xl shadow-slate-900/20 text-xs md:text-sm px-2 md:px-4"
                        >
                            {publishing ? <Loader2 className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" /> : <Eye className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />}
                            Mettre en ligne
                        </Button>
                    ) : (
                        <Button
                            onClick={handleUnpublish}
                            variant="destructive"
                            disabled={saving || publishing || unpublishing}
                            className="rounded-full flex-1 h-12 md:h-14 font-bold shadow-lg shadow-rose-500/20 text-xs md:text-sm px-2 md:px-4"
                        >
                            {unpublishing ? <Loader2 className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" /> : <EyeOff className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />}
                            Retirer
                        </Button>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
