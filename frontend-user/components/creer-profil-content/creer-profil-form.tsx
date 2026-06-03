/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Formulaire de création de profil - Onboarding interactif premium (Typeform-like / 21st.dev)
 * @created 2026-01-16
 * @updated 2026-06-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { 
  Save, Eye, EyeOff, X, Loader2, Camera, User, 
  Briefcase, MapPin, Tags, Sparkles, ArrowRight, 
  ArrowLeft, CheckCircle2, ChevronRight, HelpCircle 
} from "lucide-react"
import { LocationSelector } from "@/components/LocationSelector"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

// Composant pour animer le contenu de chaque étape
const StepWrapper = ({ children, isActive, direction }: { children: React.ReactNode, isActive: boolean, direction: number }) => {
    if (!isActive) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: direction > 0 ? 30 : -30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: direction > 0 ? -30 : 30, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="w-full space-y-8"
        >
            {children}
        </motion.div>
    )
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
    validationErrors,
    saving,
    publishing,
    unpublishing,
}: CreerProfilFormProps) {
    const [tagInput, setTagInput] = useState("")
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(1) // 1 pour avancer, -1 pour reculer

    const steps = [
        { id: 0, title: "Votre Identité", subtitle: "Présentez-vous brièvement au réseau EmiID." },
        { id: 1, title: "Votre Catégorie", subtitle: "Quel type de profil représente le mieux votre activité ?" },
        { id: 2, title: "Votre Secteur", subtitle: "Dans quel domaine professionnel évoluez-vous ?" },
        { id: 3, title: "Votre Expertise", subtitle: "Décrivez votre spécialité et vos compétences." },
        { id: 4, title: "Votre Histoire & Lien", subtitle: "Rédigez votre biographie et configurez votre URL unique." },
        { id: 5, title: "Votre Localisation", subtitle: "Où êtes-vous basé géographiquement ?" },
        { id: 6, title: "Vos Contacts", subtitle: "Comment vos futurs partenaires peuvent-ils vous joindre ?" },
        { id: 7, title: "Vos Compétences", subtitle: "Ajoutez des mots-clés pour être facilement trouvé." }
    ]

    const totalSteps = steps.length

    // Navigation clavier : Touche Entrée pour avancer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault()
                nextStep()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentStep])

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setDirection(1)
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setDirection(-1)
            setCurrentStep(currentStep - 1)
        }
    }

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

    // Classes pour des entrées ultra-propres et spacieuses
    const bigInputClasses = "h-16 text-lg rounded-2xl bg-slate-50/60 border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 shadow-sm font-medium px-6"
    const bigTextareaClasses = "min-h-[160px] text-base rounded-2xl bg-slate-50/60 border-slate-200/80 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 shadow-sm font-medium p-6 resize-none"

    return (
        <div className="lg:col-span-2 flex flex-col min-h-[620px] pb-32">
            
            {/* PROGRESS BAR & STEP INDICATOR */}
            <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/40 rounded-[2rem] p-5 md:p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 bg-slate-900 text-white rounded-xl">
                            Question {currentStep + 1} de {totalSteps}
                        </span>
                        <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                            {steps[currentStep].title}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-primary">{progress}%</span>
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider ml-1.5">rempli</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100/80">
                    <motion.div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep + 1) / totalSteps * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* MESSAGES D'ERREUR */}
            <AnimatePresence>
                {validationErrors.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                        animate={{ opacity: 1, height: "auto", marginBottom: 24 }} 
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 backdrop-blur-md px-6 py-5 shadow-lg shadow-rose-100/50">
                            <p className="text-sm font-bold text-rose-900 flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                </span>
                                Recommandations de saisie :
                            </p>
                            <ul className="mt-2.5 space-y-1 text-xs text-rose-800 font-bold">
                                {validationErrors.map((error) => (
                                    <li key={error} className="flex gap-2">
                                        <span className="text-rose-500">•</span> {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT CARD (Typeform Container) */}
            <div className="flex-1 relative bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/40 rounded-[2.5rem] p-6 md:p-10 overflow-hidden flex flex-col justify-center">
                
                {/* Stepper info */}
                <div className="mb-8">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        {steps[currentStep].title}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
                        {steps[currentStep].subtitle}
                    </h2>
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                    
                    {/* ÉTAPE 0 : Identité Visuelle */}
                    {currentStep === 0 && (
                        <StepWrapper key="step0" isActive={currentStep === 0} direction={direction}>
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="shrink-0">
                                    <AvatarUpload
                                        currentAvatarUrl={formData.avatar || null}
                                        onUploadComplete={(newUrl: string) => handleInputChange("avatar", newUrl)}
                                    />
                                </div>
                                <div className="flex-1 w-full space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400">Nom Complet *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            autoComplete="name"
                                            placeholder="Ex: Christian Daouda"
                                            className={bigInputClasses}
                                            value={formData.name || ""}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="text-xs font-black uppercase tracking-widest text-slate-400">Poste / Rôle Principal *</Label>
                                        <Input
                                            id="role"
                                            name="organization-title"
                                            autoComplete="organization-title"
                                            placeholder="Ex: Directeur Artistique ou Plombier Pro"
                                            className={bigInputClasses}
                                            value={formData.role || ""}
                                            onChange={(e) => handleInputChange("role", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </StepWrapper>
                    )}

                    {/* ÉTAPE 1 : Catégorie (Sélection Interactive sans Dropdown) */}
                    {currentStep === 1 && (
                        <StepWrapper key="step1" isActive={currentStep === 1} direction={direction}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                {[
                                    { value: "artisan", label: "Artisan", icon: "🎨" },
                                    { value: "commerçante", label: "Commerçant(e)", icon: "🛒" },
                                    { value: "freelance", label: "Freelance", icon: "💻" },
                                    { value: "entreprise", label: "Entreprise", icon: "🏢" },
                                    { value: "agence", label: "Agence", icon: "📣" },
                                    { value: "startup", label: "Startup", icon: "🚀" },
                                    { value: "ong", label: "ONG / Asso", icon: "🌍" },
                                    { value: "investisseur", label: "Investisseur", icon: "📈" },
                                    { value: "etudiant", label: "Étudiant / Junior", icon: "🎓" }
                                ].map((cat) => {
                                    const isSelected = formData.category === cat.value
                                    return (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => {
                                                handleInputChange("category", cat.value)
                                                setTimeout(nextStep, 250) // Transition automatique fluide
                                            }}
                                            className={cn(
                                                "p-5 rounded-3xl border-2 text-center transition-all duration-300 flex flex-col items-center justify-center gap-3",
                                                isSelected 
                                                    ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10 scale-105" 
                                                    : "bg-slate-50/50 border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                            )}
                                        >
                                            <span className="text-2xl">{cat.icon}</span>
                                            <span className="font-bold text-xs uppercase tracking-wider">{cat.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </StepWrapper>
                    )}

                    {/* ÉTAPE 2 : Secteur d'activité */}
                    {currentStep === 2 && (
                        <StepWrapper key="step2" isActive={currentStep === 2} direction={direction}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                                {[
                                    { value: "tech", label: "Tech & Digital", icon: "💻" },
                                    { value: "agro", label: "Agroalimentaire", icon: "🌾" },
                                    { value: "btp", label: "BTP & Construction", icon: "🏗️" },
                                    { value: "finance", label: "Finance & Assurances", icon: "💰" },
                                    { value: "sante", label: "Santé & Bien-être", icon: "🏥" },
                                    { value: "education", label: "Éducation & Formation", icon: "📚" },
                                    { value: "creatif", label: "Arts & Créativité", icon: "🎨" },
                                    { value: "commerce", label: "Commerce & Vente", icon: "🛍️" },
                                    { value: "transport", label: "Transport & Logistique", icon: "🚚" },
                                    { value: "tourisme", label: "Tourisme & Loisirs", icon: "✈️" },
                                    { value: "energie", label: "Énergie & Climat", icon: "⚡" },
                                    { value: "b2b", label: "Services Pro & B2B", icon: "🤝" }
                                ].map((sec) => {
                                    const isSelected = formData.activity_domain === sec.value
                                    return (
                                        <button
                                            key={sec.value}
                                            type="button"
                                            onClick={() => {
                                                handleInputChange("activity_domain", sec.value)
                                                setTimeout(nextStep, 250) // Transition auto
                                            }}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 text-center transition-all duration-300 flex flex-col items-center justify-center gap-2",
                                                isSelected 
                                                    ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                                                    : "bg-slate-50/50 border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                            )}
                                        >
                                            <span className="text-xl">{sec.icon}</span>
                                            <span className="font-bold text-[10px] uppercase tracking-wider">{sec.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </StepWrapper>
                    )}

                    {/* ÉTAPE 3 : Expertise spécifique */}
                    {currentStep === 3 && (
                        <StepWrapper key="step3" isActive={currentStep === 3} direction={direction}>
                            <div className="space-y-4">
                                <Label htmlFor="specialty" className="text-xs font-black uppercase tracking-widest text-slate-400">Quelle est votre expertise clé ? *</Label>
                                <Input
                                    id="specialty"
                                    name="specialty"
                                    autoComplete="off"
                                    placeholder="Ex: Architecture logicielle Cloud, Plomberie sanitaire, Portrait studio..."
                                    className={cn(bigInputClasses, "w-full")}
                                    value={formData.specialty || ""}
                                    onChange={(e) => handleInputChange("specialty", e.target.value)}
                                />
                                <div className="flex gap-2.5 p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl text-blue-900">
                                    <Sparkles className="w-5 h-5 shrink-0 text-blue-600" />
                                    <p className="text-xs font-medium leading-relaxed">
                                        Soyez précis(e) dans votre formulation : elle servira de mot-clé principal de recherche dans l&apos;annuaire public.
                                    </p>
                                </div>
                            </div>
                        </StepWrapper>
                    )}

                    {/* ÉTAPE 4 : Histoire & Lien */}
                    {currentStep === 4 && (
                        <StepWrapper key="step4" isActive={currentStep === 4} direction={direction}>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-xs font-black uppercase tracking-widest text-slate-400">Lien personnalisé EmiID *</Label>
                                    <div className="flex items-center rounded-2xl bg-slate-50/60 border border-slate-200/80 overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 focus-within:bg-white focus-within:border-primary transition-all shadow-sm">
                                        <span className="bg-slate-100/80 px-4 py-4 text-slate-400 font-bold text-xs border-r border-slate-200/80 select-none shrink-0">
                                            app.emiid.com/profil/
                                        </span>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            autoComplete="off"
                                            placeholder="votre-pseudo"
                                            className="h-14 border-none bg-transparent shadow-none focus-visible:ring-0 px-4 font-bold text-slate-800 text-sm w-full lowercase"
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

                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-slate-400">Présentation & Parcours (Bio)</Label>
                                        <span className="text-[10px] font-bold text-slate-400">{formData.bio?.length || 0} / 1200</span>
                                    </div>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        placeholder="Présentez vos forces, vos passions et vos accomplissements notables..."
                                        className={bigTextareaClasses}
                                        value={formData.bio || ""}
                                        onChange={(e) => handleInputChange("bio", e.target.value)}
                                    />
                                </div>
                            </div>
                        </StepWrapper>
                    )}

                    {/* ÉTAPE 5 : Localisation */}
                    {currentStep === 5 && (
                        <StepWrapper key="step5" isActive={currentStep === 5} direction={direction}>
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Où exercez-vous votre activité ? *</Label>
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
                        </StepWrapper>
                    )}

                    {/* ÉTAPE 6 : Coordonnées */}
                    {currentStep === 6 && (
                        <StepWrapper key="step6" isActive={currentStep === 6} direction={direction}>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-400">Téléphone (Direct)</Label>
                                        <Input
                                            id="phone"
                                            name="tel"
                                            autoComplete="tel"
                                            placeholder="+229 XX XX XX XX"
                                            className={bigInputClasses}
                                            value={formData.phone || ""}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">Adresse E-mail Pro</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            placeholder="contact@exemple.com"
                                            className={bigInputClasses}
                                            value={formData.email || ""}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website" className="text-xs font-black uppercase tracking-widest text-slate-400">Site Web / Portfolio</Label>
                                    <Input
                                        id="website"
                                        name="url"
                                        autoComplete="url"
                                        placeholder="ex: monsite.com"
                                        className={bigInputClasses}
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
                        </StepWrapper>
                    )}

                    {/* ÉTAPE 7 : Compétences et fin */}
                    {currentStep === 7 && (
                        <StepWrapper key="step7" isActive={currentStep === 7} direction={direction}>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Ajoutez vos compétences</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="tags-input"
                                            autoComplete="off"
                                            placeholder="Ex: Photoshop, React, Menuiserie..."
                                            className={cn(bigInputClasses, "flex-1")}
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                        />
                                        <Button type="button" onClick={addTag} variant="secondary" className="h-16 rounded-2xl px-6 font-bold shadow-sm">
                                            Ajouter
                                        </Button>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Suggestions rapides :</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {["React", "UI/UX", "Marketing", "Photo", "BTP", "Vente", "Gestion"].map((suggestedTag) => {
                                                const isAlreadyAdded = tags.includes(suggestedTag.toLowerCase())
                                                return (
                                                    <button
                                                        key={suggestedTag}
                                                        type="button"
                                                        disabled={isAlreadyAdded}
                                                        onClick={() => addSuggestedTag(suggestedTag)}
                                                        className={cn(
                                                            "text-xs px-3.5 py-1.5 rounded-xl transition-all border font-bold",
                                                            isAlreadyAdded
                                                                ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                                                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                                                        )}
                                                    >
                                                        + {suggestedTag}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    
                                    {/* Liste des tags actuels */}
                                    <div className="flex flex-wrap gap-2 min-h-[44px] pt-4">
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
                                            <div className="w-full text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                                                <p className="text-xs text-slate-400 font-bold">Aucune compétence ajoutée pour l&apos;instant.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/20 border border-emerald-100/50 rounded-3xl flex items-start gap-4 animate-in zoom-in-95 duration-300">
                                    <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-emerald-900 text-sm">Félicitations, profil complété !</h4>
                                        <p className="text-xs text-emerald-800/80 font-semibold mt-0.5 leading-relaxed">
                                            Votre empreinte numérique est prête. Vous pouvez sauvegarder vos modifications ou publier votre carte professionnelle dans l&apos;annuaire EmiID.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </StepWrapper>
                    )}

                </AnimatePresence>
            </div>

            {/* ACTION DOCK & FLOATING CONTROLS */}
            <div className="fixed bottom-[96px] md:bottom-6 left-0 right-0 z-50 px-3 md:px-4 pointer-events-none flex flex-col items-center gap-3">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", damping: 20 }}
                    className="pointer-events-auto flex items-center justify-between p-2 md:p-3 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[2.5rem] w-full max-w-xl mx-auto"
                >
                    {currentStep > 0 ? (
                        <Button
                            onClick={prevStep}
                            variant="ghost"
                            className="rounded-full h-12 md:h-14 text-slate-500 hover:text-slate-900 font-bold px-4 md:px-6 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline">Précédent</span>
                        </Button>
                    ) : (
                        <div className="w-20"></div> // Spacer
                    )}

                    {/* Raccourci clavier discret */}
                    <div className="hidden md:flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/40 select-none">
                        <span>Ctrl + Entrée</span>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        <span>Continuer</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentStep < totalSteps - 1 ? (
                            <Button
                                onClick={nextStep}
                                className="rounded-full h-12 md:h-14 bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-bold shadow-xl shadow-slate-900/10 px-6 md:px-8"
                            >
                                Continuer
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSave}
                                    variant="outline"
                                    disabled={saving || publishing || unpublishing}
                                    className="rounded-full h-12 md:h-14 border-slate-200 text-slate-700 font-black hover:bg-slate-100 transition-all"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 md:mr-2" />}
                                    <span className="hidden md:inline">Sauvegarder</span>
                                </Button>
                                
                                {!isPublished ? (
                                    <Button
                                        onClick={handlePublish}
                                        disabled={saving || publishing || unpublishing}
                                        className="rounded-full h-12 md:h-14 bg-emerald-600 text-white hover:bg-emerald-700 font-black shadow-lg shadow-emerald-600/10 px-6 transition-all"
                                    >
                                        {publishing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
                                        Publier
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleUnpublish}
                                        variant="destructive"
                                        disabled={saving || publishing || unpublishing}
                                        className="rounded-full h-12 md:h-14 font-black shadow-lg shadow-rose-500/10 px-6 transition-all"
                                    >
                                        {unpublishing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <EyeOff className="h-5 w-5 mr-2" />}
                                        Retirer
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
