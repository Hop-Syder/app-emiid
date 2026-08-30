/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Étapes individuelles du formulaire de création de profil EmiID avec typage strict.
 * @created 2026-01-16
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

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
import { PROFILE_CATEGORIES, ACTIVITY_DOMAINS } from "@/lib/profile-options"
import type { CreateProfileFormData } from "@/hooks/use-creer-profil"

// ── Étape 0 : Identité Visuelle ──────────────────────────────────────────────

interface StepIdentiteProps {
    formData: CreateProfileFormData
    handleInputChange: (field: keyof CreateProfileFormData, value: string) => void
    handleAvatarUploadComplete: (url: string) => void
    inputClasses: string
}

export function StepIdentite({ formData, handleInputChange, handleAvatarUploadComplete, inputClasses }: StepIdentiteProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Label className="text-sm font-bold text-foreground">Photo de profil</Label>
                    <div className="rounded-3xl border-2 border-dashed border-border bg-muted/50 hover:bg-muted hover:border-primary/30 transition-all p-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div className="space-y-3">
                    <Label htmlFor="name" className="text-xs font-bold text-foreground uppercase tracking-wider">Nom Complet *</Label>
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
                    <Label htmlFor="role" className="text-xs font-bold text-foreground uppercase tracking-wider">Poste / Titre *</Label>
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
    formData: CreateProfileFormData
    handleInputChange: (field: keyof CreateProfileFormData, value: string) => void
    inputClasses: string
}

export function StepExpertise({ formData, handleInputChange, inputClasses }: StepExpertiseProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label htmlFor="category" className="text-xs font-bold text-foreground uppercase tracking-wider">Type de Profil *</Label>
                    <Select value={formData.category || ""} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger id="category" className={inputClasses}>
                            <SelectValue placeholder="Catégorie..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border shadow-2xl p-1 max-h-[300px]">
                            {PROFILE_CATEGORIES.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="rounded-xl py-3 cursor-pointer">{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-3">
                    <Label htmlFor="activity_domain" className="text-xs font-bold text-foreground uppercase tracking-wider">Secteur d&apos;activité *</Label>
                    <Select value={formData.activity_domain || ""} onValueChange={(value) => handleInputChange("activity_domain", value)}>
                        <SelectTrigger id="activity_domain" className={inputClasses}>
                            <SelectValue placeholder="Secteur..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border shadow-2xl p-1 max-h-[300px]">
                            {ACTIVITY_DOMAINS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="rounded-xl py-3 cursor-pointer">{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="specialty" className="text-xs font-bold text-foreground uppercase tracking-wider">Expertise spécifique *</Label>
                <Input
                    id="specialty"
                    name="specialty"
                    autoComplete="off"
                    placeholder="Ex: Développeur Fullstack React ou Peintre en bâtiment"
                    className={inputClasses}
                    value={formData.specialty || ""}
                    onChange={(e) => handleInputChange("specialty", e.target.value)}
                />
                <p className="text-xs text-muted-foreground pl-1">Soyez précis pour mieux apparaître dans les recherches.</p>
            </div>
        </div>
    )
}

// ── Étape 2 : Histoire & Lien ─────────────────────────────────────────────────

interface StepHistoireProps {
    formData: CreateProfileFormData
    handleInputChange: (field: keyof CreateProfileFormData, value: string) => void
    inputClasses: string
}

export function StepHistoire({ formData, handleInputChange, inputClasses }: StepHistoireProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label htmlFor="slug" className="text-xs font-bold text-foreground uppercase tracking-wider">Lien personnalisé EmiID *</Label>
                <div className="flex flex-col sm:flex-row sm:items-center rounded-2xl bg-muted/80 border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card transition-all shadow-sm">
                    <div className="bg-muted/80 px-3 py-3 sm:px-4 sm:py-4 text-muted-foreground font-semibold text-xs sm:text-sm border-b sm:border-b-0 sm:border-r border-border flex items-center">
                        app.emiid.com/profil/
                    </div>
                    <Input
                        id="slug"
                        name="slug"
                        autoComplete="off"
                        placeholder="mon-prenom"
                        className="h-12 sm:h-14 border-none bg-transparent shadow-none focus-visible:ring-0 px-4 font-bold text-foreground w-full"
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
                <p className="text-xs text-muted-foreground pl-1">C&apos;est le lien que vous partagerez à vos contacts.</p>
            </div>

            <div className="space-y-3">
                <Label htmlFor="bio" className="text-xs font-bold text-foreground uppercase tracking-wider">Votre Histoire (Bio)</Label>
                <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Racontez votre parcours, ce qui vous passionne et ce que vous apportez à vos clients..."
                    className={cn(inputClasses, "min-h-[160px] py-4 resize-none")}
                    value={formData.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Soyez authentique.</span>
                    <span>{formData.bio?.length || 0} / 1200</span>
                </div>
            </div>
        </div>
    )
}

// ── Étape 3 : Contact & Localisation ─────────────────────────────────────────

interface StepContactProps {
    formData: CreateProfileFormData
    handleInputChange: (field: keyof CreateProfileFormData, value: string) => void
    handleLocationSelect: (countryInfo: { name: string; isoCode: string }, cityName: string) => void
    inputClasses: string
}

export function StepContact({ formData, handleInputChange, handleLocationSelect, inputClasses }: StepContactProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label className="text-xs font-bold text-foreground uppercase tracking-wider">Localisation *</Label>
                <div className="p-1">
                    <LocationSelector
                        defaultCountryCode={formData.country_code}
                        defaultCity={formData.city}
                        onLocationSelect={handleLocationSelect}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-3">
                    <Label htmlFor="phone" className="text-xs font-bold text-foreground uppercase tracking-wider">Téléphone</Label>
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
                    <Label htmlFor="email" className="text-xs font-bold text-foreground uppercase tracking-wider">Email Pro</Label>
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
                    <Label htmlFor="website" className="text-xs font-bold text-foreground uppercase tracking-wider">Site Web / Portfolio</Label>
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
    activityDomain?: string
}

// Suggestions génériques
const DEFAULT_TAGS = ["Vente & Commerce", "Gestion administrative", "Service client", "Communication", "Formation", "Livraison", "Conseil", "Organisation d'événements"]

// Suggestions contextuelles par secteur
const SUGGESTED_TAGS_BY_DOMAIN: Record<string, string[]> = {
    tech:         ["Créer un site web", "Créer une application mobile", "Logiciel de comptabilité", "Réparer un ordinateur / Maintenance", "Infographie & Création de logo", "Publicité Facebook & Instagram", "Création de visuels / Canva", "Montage vidéo pour réseaux sociaux"],
    droit:        ["Rédiger un contrat de travail", "Conseil pour création d'entreprise", "Règlement de litiges", "Audit de conformité", "Défense au tribunal", "Démarches d'enregistrement foncier", "Conseil fiscal"],
    finance:      ["Tenue de comptabilité", "Déclaration d'impôts", "Conseil en gestion d'argent", "Montage de dossier de crédit", "Assurance auto & habitation", "Transfert d'argent / Mobile Money", "Gestion de budget d'entreprise", "Établir un bilan comptable"],
    sante:        ["Consultation médicale", "Soins infirmiers à domicile", "Massage & Kiné", "Conseil en nutrition", "Suivi de grossesse", "Vente de médicaments / Pharmacie", "Soutien psychologique", "Coach remise en forme"],
    creatif:      ["Photographie d'événements (mariage, baptême)", "Montage vidéo & Clip", "Création de logo & Flyers", "Décoration & Peinture artistique", "Animation musicale (DJ)", "Sérigraphie & Impression T-shirt", "Illustration & Dessin", "Gestion de réseaux sociaux"],
    mode:         ["Coudre un Bomba / Tenue traditionnelle", "Coudre un Corset", "Coudre une chemise / Pantalon", "Coudre une robe de mariée", "Coiffure homme / Barbe", "Tresses & Coiffure femme", "Manucure & Onglerie", "Maquillage professionnel / Make-up", "Stylisme et création de modèles"],
    restauration: ["Traiteur pour événements (Mariage, Baptême)", "Cuisine de plats locaux (Jollof, Garba, Yassa)", "Pâtisserie & Gâteaux d'anniversaire", "Conception de menus de restaurant", "Gestion de cuisine & Service en salle", "Fabrication de jus locaux et cocktails"],
    btp:          ["Poser du carrelage / Pavés", "Faire du staff / Plâtre décoratif", "Peindre des bâtiments", "Installation électrique de maison", "Plomberie & Réparation de fuites", "Soudure & Fabrication de portails", "Maçonnerie & Gros œuvre", "Plans de maison & Plan d'architecte"],
    conseil:      ["Recrutement de personnel", "Coaching et développement d'affaires", "Formation en informatique", "Aide aux devoirs / Cours à domicile", "Soutien et conseil en ressources humaines", "Gestion administrative"],
    immobilier:   ["Vente de terrain & Maison", "Location d'appartements", "Gestion locative (loyers)", "Estimation de bien", "Recherche de logement", "Gestion d'immeuble / Syndic", "Courtage immobilier", "Démarches foncières"],
    media:        ["Rédaction d'articles", "Reportage & Journalisme", "Gestion de page Facebook / Instagram", "Relations presse & Communiqué", "Publicité & Affichage", "Animation radio / TV", "Rédaction web (référencement)", "Couverture photo/vidéo d'événement"],
    industrie:    ["Réparation de moteur / Mécanique auto", "Soudure & Métallerie", "Maintenance de machines", "Fabrication métallique", "Électricité industrielle", "Froid & Climatisation", "Réparation d'engins", "Tôlerie & Peinture auto"],
    securite:     ["Gardiennage de nuit", "Agent de sécurité événementiel", "Installation de caméras de surveillance", "Télésurveillance", "Secourisme & Premiers soins", "Protection rapprochée", "Rondes & Patrouilles", "Sécurité incendie"],
    services:     ["Nettoyage de bureaux & Résidences", "Lavage et entretien de voiture", "Jardinage & Aménagement de cour", "Sécurité et gardiennage de nuit", "Installation d'antennes TV / Canal+", "Dépannage d'appareils électroménagers"],
    sport:        ["Coach sportif personnel", "Cours de fitness / Musculation", "Cours de football", "Préparation physique", "Cours de danse", "Yoga & Relaxation", "Arbitrage sportif", "Organisation de tournois"],
    agro:         ["Production maraîchère (légumes)", "Élevage (poulets, porcs)", "Transformation de produits (jus, farine)", "Vente de produits agricoles", "Conseil en agriculture", "Pisciculture / Élevage de poissons", "Production d'œufs / Aviculture", "Conditionnement & Emballage"],
    education:    ["Cours à domicile / Répétiteur", "Aide aux devoirs", "Cours de langues (Anglais, Français)", "Formation en informatique", "Préparation aux examens (BAC, BEPC)", "Cours de musique", "Encadrement scolaire", "Formation professionnelle"],
    commerce:     ["Vente en gros et détail", "Import-Export de marchandises", "Vente en ligne (WhatsApp / Facebook)", "Approvisionnement & Achats", "Distribution de produits", "Boutique & Magasin", "Vente de vêtements / Friperie", "Livraison de commandes"],
    transport:    ["Transport de personnes (Taxi, VTC)", "Livraison de colis", "Déménagement", "Transport de marchandises", "Location de véhicules", "Coursier moto", "Logistique & Stockage", "Dédouanement"],
    tourisme:     ["Guide touristique", "Réservation d'hôtel", "Organisation de voyages", "Location de vacances", "Accueil & Réception", "Restauration & Bar", "Animation touristique", "Transport de touristes"],
    energie:      ["Installation de panneaux solaires", "Installation électrique", "Groupe électrogène (vente / entretien)", "Plomberie & Forage", "Gestion des déchets / Recyclage", "Maintenance énergétique", "Climatisation & Froid", "Éclairage solaire"],
    b2b:          ["Fourniture aux entreprises", "Prestation de services aux sociétés", "Sous-traitance", "Consulting d'entreprise", "Approvisionnement en matériel", "Maintenance informatique entreprise", "Gestion de projet", "Prospection commerciale"],
    evenementiel: ["Organisation de mariage", "Décoration de salle", "Sonorisation & Lumière (DJ)", "Traiteur événementiel", "Location de chaises / bâches", "Animation & Maître de cérémonie", "Location de matériel de fête", "Photographe / Vidéaste d'événement"],
}

export function StepCompetences({ tags, tagInput, setTagInput, addTag, addSuggestedTag, removeTag, inputClasses, activityDomain }: StepCompetencesProps) {
    const SUGGESTED_TAGS = activityDomain ? (SUGGESTED_TAGS_BY_DOMAIN[activityDomain] || DEFAULT_TAGS) : DEFAULT_TAGS
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label className="text-xs font-bold text-foreground uppercase tracking-wider">Ajouter des Compétences</Label>
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
                                            ? "bg-muted text-slate-300 border-border cursor-not-allowed"
                                             : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:bg-primary/5 active:scale-95"
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
                            <button type="button" onClick={() => removeTag(tag)} className="p-1 hover:bg-card/20 rounded-lg transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </motion.div>
                    )) : (
                        <div className="w-full text-center p-8 border-2 border-dashed border-border rounded-2xl">
                            <p className="text-sm text-slate-400">Aucune compétence ajoutée pour l&apos;instant.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
