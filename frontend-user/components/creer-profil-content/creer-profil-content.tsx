/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Wrapper principal pour le contenu de création de profil avec hydratation robuste
 * @created 2026-01-16
 * @updated 2026-04-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { CreerProfilForm } from "./creer-profil-form"
import { CreerProfilPreview } from "./creer-profil-preview"
import { fetchWithAuth } from "@/lib/apiClient"
import { getReferenceCountriesCached, type ReferenceCountry } from "@/lib/location-cache"
import { toast } from "sonner"

interface CreateProfileFormData {
    name: string
    role: string
    category: string
    card_variant: string
    country_id: string
    country_code: string
    country_name: string
    city: string
    specialty: string
    bio: string
    phone: string
    email: string
    website: string
    avatar: string
    tags: string[]
}

const buildProfilePayload = (formData: CreateProfileFormData, isPublished: boolean) => {
    const trimmedName = formData.name.trim()
    const nameParts = trimmedName.split(/\s+/).filter(Boolean)

    return {
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        role: formData.role.trim(),
        category: formData.category,
        specialty: formData.specialty.trim(),
        bio: formData.bio.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        avatar_url: formData.avatar || null,
        card_variant: formData.card_variant,
        country_id: formData.country_id || null,
        country_code: formData.country_code || null,
        country_name: formData.country_name || null,
        city: formData.city.trim(),
        tags: formData.tags,
        is_published: isPublished,
    }
}

const validateProfileForm = (formData: CreateProfileFormData, mode: "draft" | "publish") => {
    const errors: string[] = []
    const trimmedName = formData.name.trim()
    const trimmedRole = formData.role.trim()
    const trimmedSpecialty = formData.specialty.trim()
    const trimmedBio = formData.bio.trim()
    const trimmedWebsite = formData.website.trim()

    if (trimmedWebsite) {
        try {
            const parsedUrl = new URL(trimmedWebsite)
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                errors.push("Le site web doit commencer par http:// ou https://")
            }
        } catch {
            errors.push("Le site web saisi n’est pas valide")
        }
    }

    if (trimmedBio.length > 1200) {
        errors.push("La bio ne doit pas dépasser 1200 caractères")
    }

    if (formData.tags.length > 12) {
        errors.push("Vous pouvez ajouter au maximum 12 tags")
    }

    if (mode === "publish") {
        if (!trimmedName) {
            errors.push("Veuillez renseigner votre nom avant de publier")
        }

        if (trimmedName.split(/\s+/).filter(Boolean).length < 2) {
            errors.push("Veuillez renseigner au moins un prénom et un nom")
        }

        if (!formData.category) {
            errors.push("Veuillez choisir une catégorie de compte")
        }

        if (!formData.card_variant) {
            errors.push("Veuillez choisir un design de carte Nexus")
        }

        if (!trimmedRole) {
            errors.push("Veuillez renseigner votre rôle principal")
        }

        if (!trimmedSpecialty) {
            errors.push("Veuillez renseigner votre domaine d’expertise")
        }

        if (!formData.country_id && !formData.country_code) {
            errors.push("Veuillez sélectionner votre pays")
        }

        if (!formData.city.trim()) {
            errors.push("Veuillez renseigner votre ville")
        }
    }

    return errors
}

export function CreerProfilContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [isPublished, setIsPublished] = useState(false)
    const [countries, setCountries] = useState<ReferenceCountry[]>([])
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [formData, setFormData] = useState<CreateProfileFormData>({
        name: "",
        role: "",
        category: "",
        card_variant: "tech",
        country_id: "",
        country_code: "",
        country_name: "",
        city: "",
        specialty: "",
        bio: "",
        phone: "",
        email: "",
        website: "",
        avatar: "/profil/avatar.jpg",
        tags: [] as string[]
    })

    const loadInitialData = useCallback(async () => {
        setIsLoading(true)
        try {
            // Chargement parallèle des référentiels et du profil
            const [countriesList, profileRes] = await Promise.all([
                getReferenceCountriesCached(),
                fetchWithAuth("/api/users/me"),
            ])

            setCountries(countriesList)

            if (profileRes.ok) {
                const data = await profileRes.json()
                
                // Si l'objet data contient un ID (issu du profil ou de l'auth fallback)
                if (data && (data.id || data.user_id)) {
                    const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim()
                    
                    // Résolution précise de la localisation
                    let resolvedCountryCode = data.country_code || ""
                    let resolvedCountryName = data.country_name || ""
                    
                    if (data.countries) {
                        resolvedCountryCode = data.countries.iso_code || resolvedCountryCode
                        resolvedCountryName = data.countries.name || resolvedCountryName
                    } else if (data.country_id) {
                        const found = countriesList.find((c) => c.id === data.country_id)
                        if (found) {
                            resolvedCountryCode = found.iso_code
                            resolvedCountryName = found.name
                        }
                    }

                    // Hydratation complète avec valeurs par défaut de sauvegarde
                    setFormData(prev => ({
                        ...prev,
                        name: fullName || prev.name,
                        role: data.role || data.job_title || "",
                        category: data.category || "",
                        card_variant: data.card_variant || "tech",
                        specialty: data.specialty || "",
                        bio: data.bio || "",
                        phone: data.phone || "",
                        email: data.email || "",
                        website: data.website || "",
                        country_id: data.country_id || "",
                        country_code: resolvedCountryCode,
                        country_name: resolvedCountryName,
                        city: data.city || "",
                        avatar: data.avatar_url || prev.avatar,
                        tags: Array.isArray(data.tags) ? data.tags : [],
                    }))

                    if (typeof data.is_published === "boolean") {
                        setIsPublished(data.is_published)
                    }
                }
            }
        } catch (error) {
            console.error("Hydration error:", error)
            toast.error("Impossible de charger les données existantes")
        } finally {
            setIsLoading(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countries.length === 0]) // Dépendance sur countries seulement s'ils ne sont pas chargés

    useEffect(() => {
        loadInitialData()
    }, [loadInitialData])

    const handleInputChange = (field: string, value: any) => {
        if (validationErrors.length > 0) setValidationErrors([])
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        try {
            const errors = validateProfileForm(formData, "draft")
            if (errors.length > 0) {
                setValidationErrors(errors)
                toast.error(errors[0])
                return
            }

            const payload = buildProfilePayload(formData, isPublished)
            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.error || "Erreur lors de la sauvegarde")
            }

            toast.success("Votre profil a été mis à jour avec succès")
            setValidationErrors([])
        } catch (error: any) {
            toast.error(`Échec: ${error.message}`)
        }
    }

    const handlePublish = async () => {
        const errors = validateProfileForm(formData, "publish")
        if (errors.length > 0) {
            setValidationErrors(errors)
            toast.error(errors[0])
            return
        }

        try {
            const payload = buildProfilePayload(formData, true)
            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error("Échec de mise en ligne")

            setIsPublished(true)
            toast.success("Votre carte est maintenant visible dans l'annuaire !")
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleUnpublish = async () => {
        try {
            const payload = buildProfilePayload(formData, false)
            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error("Échec retrait")

            setIsPublished(false)
            toast.success("Profil masqué avec succès.")
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Initialisation de votre profil Nexus...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900">Configurez votre Identité</h1>
                        <p className="text-muted-foreground font-medium">Votre carte est votre premier contact avec le réseau.</p>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isPublished ? "pub" : "draft"}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Badge 
                                variant={isPublished ? "default" : "secondary"} 
                                className={`rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-lg ${
                                    isPublished ? "bg-gradient-to-r from-emerald-600 to-teal-500 border-none" : ""
                                }`}
                            >
                                {isPublished ? "Mode Public" : "Mode Brouillon"}
                            </Badge>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <CreerProfilForm
                        formData={formData}
                        setFormData={setFormData}
                        handleInputChange={handleInputChange}
                        handleSave={handleSave}
                        handlePublish={handlePublish}
                        handleUnpublish={handleUnpublish}
                        isPublished={isPublished}
                        countries={countries}
                        tags={formData.tags}
                        validationErrors={validationErrors}
                    />
                    <CreerProfilPreview formData={formData} />
                </div>
            </motion.div>
        </div>
    )
}
