/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Wrapper principal pour le contenu de création de profil
 * @created 2026-01-16
 * @updated 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
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

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Chargement des référentiels
                const [countriesList, profileRes] = await Promise.all([
                    getReferenceCountriesCached(),
                    fetchWithAuth("/api/users/me"),
                ])

                setCountries(countriesList)

                // Initialisation : Hydratation du formulaire
                if (profileRes.ok) {
                    const data = await profileRes.json()
                    // PGRST116: Si pas de profil, l'API peut renvoyer une erreur standard ou un objet partiel
                    if (data && !data.error && !data.message) {
                        const name = `${data.first_name || ""} ${data.last_name || ""}`.trim()

                        // Résolution du code pays pour le sélecteur
                        let resolvedCountryCode = ""
                        let resolvedCountryName = ""
                        if (data.countries && data.countries.iso_code) {
                            resolvedCountryCode = data.countries.iso_code
                            resolvedCountryName = data.countries.name
                        } else if (data.country_id) {
                            const found = countriesList.find((country) => country.id === data.country_id)
                            if (found) {
                                resolvedCountryCode = found.iso_code
                                resolvedCountryName = found.name
                            }
                        }

                        setFormData((prev) => ({
                            ...prev,
                            name: name || prev.name,
                            role: data.role || data.job_title || prev.role,
                            category: data.category || prev.category,
                            card_variant: data.card_variant || prev.card_variant,
                            specialty: data.specialty || prev.specialty,
                            bio: data.bio || prev.bio,
                            phone: data.phone || prev.phone,
                            email: data.email || prev.email,
                            website: data.website || prev.website,
                            country_id: data.country_id || prev.country_id,
                            country_code: resolvedCountryCode || prev.country_code,
                            country_name: resolvedCountryName || prev.country_name,
                            city: data.city || prev.city,
                            avatar: data.avatar_url || prev.avatar,
                            tags: data.tags || prev.tags,
                        }))
                        if (typeof data.is_published === "boolean") {
                            setIsPublished(data.is_published)
                        }
                    }
                }
            } catch (error) {
                console.error("Erreur chargement données:", error)
            }
        }
        loadInitialData()
    }, [])

    const handleInputChange = (field: string, value: any) => {
        if (validationErrors.length > 0) {
            setValidationErrors([])
        }

        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // 2. Mutation & Persistance (Draft)
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

            toast.success("Brouillon sauvegardé avec succès")
            setValidationErrors([])
        } catch (error: unknown) {
            console.error("Erreur save:", error)
            toast.error(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
        }
    }

    // 3. Publication (Visibility ON)
    const handlePublish = async () => {
        if (isPublished) {
            toast.info("Votre profil est déjà publié. Cliquez sur Enregistrer pour mettre à jour.")
            return
        }

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

            if (!response.ok) throw new Error("Erreur lors de la publication")

            setIsPublished(true)
            setValidationErrors([])
            toast.success("Félicitations ! Votre profil est maintenant EN LIGNE.")
        } catch (error: unknown) {
            toast.error(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
        }
    }

    // 4. Dépublication (Visibility OFF)
    const handleUnpublish = async () => {
        if (!isPublished) return

        try {
            const payload = buildProfilePayload(formData, false)

            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error("Erreur dépublication")

            setIsPublished(false)
            setValidationErrors([])
            toast.success("Votre profil est masqué (mode Brouillon).")
        } catch (error: unknown) {
            toast.error(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
        }
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Publier une Carte de Profil</h1>
                        <p className="text-muted-foreground">Remplissez ce formulaire pour créer et publier votre carte dans l'annuaire</p>
                    </div>
                    <Badge variant={isPublished ? "default" : "secondary"} className="rounded-xl">
                        {isPublished ? "Publié" : "Brouillon"}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
