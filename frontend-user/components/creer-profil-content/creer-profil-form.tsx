/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import { Save, Eye, EyeOff, Loader2, Camera, User, Briefcase, MapPin, Tags, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { StepIdentite, StepExpertise, StepHistoire, StepContact, StepCompetences } from "./creer-profil-steps"

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

const StepWrapper = ({ children, isActive, direction }: { children: React.ReactNode; isActive: boolean; direction: number }) => {
    if (!isActive) return null
    return (
        <motion.div
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full space-y-6"
        >
            {children}
        </motion.div>
    )
}

export const CreerProfilForm = React.memo(function CreerProfilForm({
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
    const [direction, setDirection] = useState(1)

    const inputClasses = "h-14 rounded-2xl bg-slate-50/80 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm"

    const steps = [
        { id: 0, title: "Identité", icon: Camera, subtitle: "Votre présentation de base" },
        { id: 1, title: "Expertise", icon: Briefcase, subtitle: "Ce que vous faites de mieux" },
        { id: 2, title: "Histoire", icon: User, subtitle: "Votre parcours et lien EmiID" },
        { id: 3, title: "Contact", icon: MapPin, subtitle: "Comment vous joindre" },
        { id: 4, title: "Compétences", icon: Tags, subtitle: "Mots-clés pour être trouvé" },
    ]
    const totalSteps = steps.length

    const validateStep = (step: number): string | null => {
        const name = (formData.name || "").trim()
        const role = (formData.role || "").trim()
        const specialty = (formData.specialty || "").trim()
        const slug = (formData.slug || "").trim()
        switch (step) {
            case 0:
                if (!name) return "Veuillez renseigner votre nom complet"
                if (name.split(/\s+/).filter(Boolean).length < 2) return "Indiquez au moins un prénom et un nom"
                if (!role) return "Veuillez renseigner votre poste / titre"
                return null
            case 1:
                if (!formData.category) return "Veuillez choisir un type de profil"
                if (!formData.activity_domain) return "Veuillez choisir un secteur d'activité"
                if (!specialty) return "Veuillez renseigner votre expertise spécifique"
                return null
            case 2:
                if (!slug) return "Veuillez renseigner votre lien personnalisé (pseudo)"
                if (slug.length < 3) return "Le pseudo doit contenir au moins 3 caractères"
                if ((formData.bio || "").trim().length > 1200) return "La bio ne doit pas dépasser 1200 caractères"
                return null
            case 3:
                if (!formData.country_id && !formData.country_code) return "Veuillez sélectionner votre pays"
                if (!(formData.city || "").trim()) return "Veuillez renseigner votre ville"
                return null
            default:
                return null
        }
    }

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            const error = validateStep(currentStep)
            if (error) { toast.error(error); return }
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
        handleInputChange("tags", tags.filter((t) => t !== tagToRemove) as any)
    }

    const handleAvatarUploadComplete = useCallback((newUrl: string) => {
        handleInputChange("avatar", newUrl)
    }, [handleInputChange])

    const handleLocationSelect = useCallback((countryInfo: { name: string; isoCode: string }, cityName: string) => {
        const localCountry = countries.find((c: any) => c.iso_code === countryInfo.isoCode)
        setFormData((prev: any) => ({
            ...prev,
            country_id: localCountry?.id || "",
            country_code: countryInfo.isoCode,
            country_name: countryInfo.name,
            city: cityName,
        }))
    }, [countries, setFormData])

    const calculateProgress = () => {
        let score = 0
        const total = 11
        if (formData.name?.trim()) score++
        if (formData.role?.trim()) score++
        if (formData.category) score++
        if (formData.specialty?.trim()) score++
        if (formData.bio?.trim()) score++
        if (formData.city?.trim()) score++
        if (formData.phone?.trim()) score++
        if (formData.website?.trim()) score++
        if (formData.slug?.trim()) score++
        if (formData.avatar && !formData.avatar.includes("avatar.jpg")) score++
        if (tags && tags.length > 0) score++
        return Math.round((score / total) * 100)
    }
    const progress = calculateProgress()

    return (
        <div className="lg:col-span-2 flex flex-col min-h-[600px] pb-32">

            {/* EN-TÊTE DU WIZARD */}
            <div className="bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-3xl p-5 md:p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            {steps[currentStep].title}
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">Étape {currentStep + 1} / {totalSteps}</span>
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">{steps[currentStep].subtitle}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-primary">{progress}%</span>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rempli</p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 mb-4">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100">
                            <motion.div
                                className={cn("h-full rounded-full", idx <= currentStep ? "bg-primary" : "bg-transparent")}
                                initial={{ width: 0 }}
                                animate={{ width: idx <= currentStep ? "100%" : "0%" }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>
                    ))}
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
                        <div className="rounded-3xl border border-rose-500/20 bg-slate-900/90 backdrop-blur-md px-6 py-5 shadow-lg shadow-rose-900/20">
                            <p className="text-sm font-bold text-rose-400 flex items-center gap-2">
                                <span className="relative flex h-3 w-3 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                </span>
                                Corrigez les éléments suivants avant de continuer :
                            </p>
                            <ul className="mt-3 space-y-1.5 text-sm text-rose-300 font-medium">
                                {validationErrors.map((error) => (
                                    <li key={error} className="flex gap-2">
                                        <span className="text-rose-500 shrink-0">•</span> {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ZONE DE CONTENU PRINCIPALE */}
            <div className="flex-1 relative bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>

                    {currentStep === 0 && (
                        <StepWrapper key="step0" isActive={currentStep === 0} direction={direction}>
                            <StepIdentite
                                formData={formData}
                                handleInputChange={handleInputChange}
                                handleAvatarUploadComplete={handleAvatarUploadComplete}
                                inputClasses={inputClasses}
                            />
                        </StepWrapper>
                    )}

                    {currentStep === 1 && (
                        <StepWrapper key="step1" isActive={currentStep === 1} direction={direction}>
                            <StepExpertise
                                formData={formData}
                                handleInputChange={handleInputChange}
                                inputClasses={inputClasses}
                            />
                        </StepWrapper>
                    )}

                    {currentStep === 2 && (
                        <StepWrapper key="step2" isActive={currentStep === 2} direction={direction}>
                            <StepHistoire
                                formData={formData}
                                handleInputChange={handleInputChange}
                                inputClasses={inputClasses}
                            />
                        </StepWrapper>
                    )}

                    {currentStep === 3 && (
                        <StepWrapper key="step3" isActive={currentStep === 3} direction={direction}>
                            <StepContact
                                formData={formData}
                                handleInputChange={handleInputChange}
                                handleLocationSelect={handleLocationSelect}
                                inputClasses={inputClasses}
                            />
                        </StepWrapper>
                    )}

                    {currentStep === 4 && (
                        <StepWrapper key="step4" isActive={currentStep === 4} direction={direction}>
                            <StepCompetences
                                tags={tags}
                                tagInput={tagInput}
                                setTagInput={setTagInput}
                                addTag={addTag}
                                addSuggestedTag={addSuggestedTag}
                                removeTag={removeTag}
                                inputClasses={inputClasses}
                            />
                            {/* Résumé fin */}
                            <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50/30 border border-emerald-100/50 rounded-3xl flex items-start gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shrink-0">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-emerald-900 mb-1">Prêt à finaliser !</h4>
                                    <p className="text-sm text-emerald-800/80 font-medium">
                                        Vérifiez l&apos;aperçu de votre carte EmiID à droite. Si tout est bon, vous pouvez sauvegarder votre profil ou le mettre en ligne dans l&apos;annuaire.
                                    </p>
                                </div>
                            </div>
                        </StepWrapper>
                    )}

                </AnimatePresence>
            </div>

            {/* NAVIGATION DOCK */}
            <div className="fixed bottom-[96px] md:bottom-6 left-0 right-0 z-50 px-3 md:px-4 pointer-events-none flex flex-col items-center gap-3">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 20 }}
                    className="pointer-events-auto flex items-center justify-between p-2 md:p-3 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[2rem] w-full max-w-xl mx-auto"
                >
                    {currentStep > 0 ? (
                        <Button
                            onClick={prevStep}
                            variant="ghost"
                            className="rounded-full h-12 md:h-14 text-slate-500 hover:text-slate-900 font-bold px-4 md:px-6 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline">Précédent</span>
                        </Button>
                    ) : (
                        <div className="w-24" />
                    )}

                    <div className="flex items-center gap-2">
                        {currentStep < totalSteps - 1 ? (
                            <Button
                                onClick={nextStep}
                                className="rounded-full h-12 md:h-14 bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] transition-all duration-300 font-bold shadow-xl shadow-slate-900/20 px-6 md:px-8"
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
                                    className="rounded-full h-12 md:h-14 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 md:mr-2" />}
                                    <span className="hidden md:inline">Sauver</span>
                                </Button>
                                {!isPublished ? (
                                    <Button
                                        onClick={handlePublish}
                                        disabled={saving || publishing || unpublishing}
                                        className="rounded-full h-12 md:h-14 bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-600/20 px-6"
                                    >
                                        {publishing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
                                        Publier
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleUnpublish}
                                        variant="destructive"
                                        disabled={saving || publishing || unpublishing}
                                        className="rounded-full h-12 md:h-14 font-bold shadow-lg shadow-rose-500/20 px-6"
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
})
