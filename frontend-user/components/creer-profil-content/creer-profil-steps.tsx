"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Sparkles } from "lucide-react"
import { LocationSelector } from "@/components/LocationSelector"
import { motion } from "framer-motion"
import { AvatarUpload } from "@/components/AvatarUpload"
import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormData = Record<string, any>

// ── Étape 0 : Identité Visuelle ──────────────────────────────────────────────

interface StepIdentiteProps {
    formData: FormData
    handleInputChange: (field: string, value: unknown) => void
    handleAvatarUploadComplete: (url: string) => void
    inputClasses: string
}

export function StepIdentite({ formData, handleInputChange, handleAvatarUploadComplete, inputClasses }: StepIdentiteProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Label className="text-sm font-bold text-slate-700">Photo de profil</Label>
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/30 transition-all p-4">
                        <AvatarUpload
                            currentAvatarUrl={formData.avatar || null}
                            onUploadComplete={handleAvatarUploadComplete}
                        />
                    </div>
                </div>
                <div className="hidden md:flex flex-col justify-center items-start space-y-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-3xl border border-blue-100/50">
                    <div className="p-2.5 bg-blue-100/80 rounded-xl text-blue-600">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">Le secret d&apos;un bon profil</h4>
                        <p className="text-sm text-blue-800/80 leading-relaxed font-medium">
                            Une photo claire et professionnelle augmente vos chances d&apos;être contacté de <strong className="text-blue-900">70%</strong>.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
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
                    <Label htmlFor="role" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Poste / Titre *</Label>
                    <Input
                        id="role"
                        name="organization-title"
                        autoComplete="organization-title"
                        placeholder="Ex: Designer UI/UX"
                        className={inputClasses}
                        value={formData.role || ""}
                        onChange={(e) => handleInputChange("role", e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}

// ── Étape 1 : Informations Pro ────────────────────────────────────────────────

interface StepExpertiseProps {
    formData: FormData
    handleInputChange: (field: string, value: unknown) => void
    inputClasses: string
}

export function StepExpertise({ formData, handleInputChange, inputClasses }: StepExpertiseProps) {
    return (
        <div className="space-y-6">
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
                    <Label htmlFor="activity_domain" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Secteur d&apos;activité *</Label>
                    <Select value={formData.activity_domain || ""} onValueChange={(value) => handleInputChange("activity_domain", value)}>
                        <SelectTrigger id="activity_domain" className={inputClasses}>
                            <SelectValue placeholder="Secteur..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1 max-h-[300px]">
                            <SelectItem value="tech" className="rounded-xl py-3 cursor-pointer">💻 Tech &amp; Digital</SelectItem>
                            <SelectItem value="agro" className="rounded-xl py-3 cursor-pointer">🌾 Agroalimentaire</SelectItem>
                            <SelectItem value="btp" className="rounded-xl py-3 cursor-pointer">🏗️ BTP &amp; Construction</SelectItem>
                            <SelectItem value="finance" className="rounded-xl py-3 cursor-pointer">💰 Finance &amp; Assurance</SelectItem>
                            <SelectItem value="sante" className="rounded-xl py-3 cursor-pointer">🏥 Santé &amp; Bien-être</SelectItem>
                            <SelectItem value="education" className="rounded-xl py-3 cursor-pointer">📚 Éducation &amp; Formation</SelectItem>
                            <SelectItem value="creatif" className="rounded-xl py-3 cursor-pointer">🎨 Arts &amp; Créativité</SelectItem>
                            <SelectItem value="commerce" className="rounded-xl py-3 cursor-pointer">🛍️ Commerce &amp; Distribution</SelectItem>
                            <SelectItem value="transport" className="rounded-xl py-3 cursor-pointer">🚚 Transport &amp; Logistique</SelectItem>
                            <SelectItem value="tourisme" className="rounded-xl py-3 cursor-pointer">✈️ Tourisme &amp; Hôtellerie</SelectItem>
                            <SelectItem value="energie" className="rounded-xl py-3 cursor-pointer">⚡ Énergie &amp; Environnement</SelectItem>
                            <SelectItem value="b2b" className="rounded-xl py-3 cursor-pointer">🤝 Services B2B</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
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
                <p className="text-xs text-slate-500 pl-1">Soyez précis pour mieux apparaître dans les recherches.</p>
            </div>
        </div>
    )
}

// ── Étape 2 : Histoire & Lien ─────────────────────────────────────────────────

interface StepHistoireProps {
    formData: FormData
    handleInputChange: (field: string, value: unknown) => void
    inputClasses: string
}

export function StepHistoire({ formData, handleInputChange, inputClasses }: StepHistoireProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label htmlFor="slug" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lien personnalisé EmiID *</Label>
                <div className="flex flex-col sm:flex-row sm:items-center rounded-2xl bg-slate-50/80 border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all shadow-sm">
                    <div className="bg-slate-100/80 px-3 py-3 sm:px-4 sm:py-4 text-slate-500 font-semibold text-xs sm:text-sm border-b sm:border-b-0 sm:border-r border-slate-200 flex items-center">
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
                                .normalize("NFD").replace(/[̀-ͯ]/g, "")
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, "")
                                .replace(/-+/g, "-")
                            handleInputChange("slug", val)
                        }}
                    />
                </div>
                <p className="text-xs text-slate-500 pl-1">C&apos;est le lien que vous partagerez à vos contacts.</p>
            </div>

            <div className="space-y-3">
                <Label htmlFor="bio" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Votre Histoire (Bio)</Label>
                <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Racontez votre parcours, ce qui vous passionne et ce que vous apportez à vos clients..."
                    className={cn(inputClasses, "min-h-[160px] py-4 resize-none")}
                    value={formData.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                />
                <div className="flex justify-between text-xs text-slate-500 px-1">
                    <span>Soyez authentique.</span>
                    <span>{formData.bio?.length || 0} / 1200</span>
                </div>
            </div>
        </div>
    )
}

// ── Étape 3 : Contact & Localisation ─────────────────────────────────────────

interface StepContactProps {
    formData: FormData
    handleInputChange: (field: string, value: unknown) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleLocationSelect: (countryInfo: { name: string; isoCode: string }, cityName: string) => void
    inputClasses: string
}

export function StepContact({ formData, handleInputChange, handleLocationSelect, inputClasses }: StepContactProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Localisation *</Label>
                <div className="p-1">
                    <LocationSelector
                        defaultCountryCode={formData.country_code}
                        defaultCity={formData.city}
                        onLocationSelect={handleLocationSelect}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
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
                            } catch { /* invalid URL, ignore */ }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

// ── Étape 4 : Compétences & Publication ──────────────────────────────────────

interface StepCompetencesProps {
    tags: string[]
    tagInput: string
    setTagInput: (v: string) => void
    addTag: () => void
    addSuggestedTag: (tag: string) => void
    removeTag: (tag: string) => void
    inputClasses: string
}

const SUGGESTED_TAGS = ["React", "TypeScript", "UI/UX", "Marketing", "Photographie", "BTP", "Vente", "Gestion de Projet"]

export function StepCompetences({ tags, tagInput, setTagInput, addTag, addSuggestedTag, removeTag, inputClasses }: StepCompetencesProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ajouter des Compétences</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        id="tags-input"
                        autoComplete="off"
                        placeholder="Entrez un mot-clé (ex: Marketing) et appuyez sur Ajouter"
                        className={inputClasses}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="secondary" className="h-14 rounded-2xl px-6 font-bold shadow-sm w-full sm:w-auto">Ajouter</Button>
                </div>

                <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Suggestions :</span>
                    <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_TAGS.map((suggestedTag) => {
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

                <div className="flex flex-wrap gap-2 min-h-[40px] pt-4">
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
                        <div className="w-full text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl">
                            <p className="text-sm text-slate-400">Aucune compétence ajoutée pour l&apos;instant.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
