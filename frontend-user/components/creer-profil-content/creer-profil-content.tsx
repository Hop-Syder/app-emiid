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
import { ProjectGallery } from "./project-gallery"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export function CreerProfilContent() {
    const [isPublished, setIsPublished] = useState(false)
    const [countries, setCountries] = useState<any[]>([])
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        category: "",
        country_id: "",
        country_code: "",
        country_name: "",
        city: "",
        specialty: "",
        bio: "",
        phone: "",
        email: "",
        website: "",
        avatar: "/african-user.jpg",
        tags: [] as string[]
    })

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Chargement des référentiels
                const [countryRes, profileRes] = await Promise.all([
                    fetchWithAuth("/api/reference/countries"),
                    fetchWithAuth("/api/users/me"),
                ])

                let countriesList: any[] = []
                if (countryRes.ok) {
                    countriesList = await countryRes.json()
                    setCountries(countriesList)
                }

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
                            const found = countriesList.find((c: any) => c.id === data.country_id)
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

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // 2. Mutation & Persistance (Draft)
    const handleSave = async () => {
        try {
            const trimmedName = formData.name.trim()
            const nameParts = trimmedName.split(" ")
            const firstName = nameParts[0] || ""
            const lastName = nameParts.slice(1).join(" ") || ""

            const payload = {
                first_name: firstName,
                last_name: lastName,
                role: formData.role,
                category: formData.category,
                specialty: formData.specialty,
                bio: formData.bio,
                phone: formData.phone,
                website: formData.website,
                country_id: formData.country_id || null,
                city: formData.city,
                tags: formData.tags,
                is_published: isPublished,
            }

            console.log("Saving Draft:", payload)

            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.error || "Erreur lors de la sauvegarde")
            }

            toast.success("Brouillon sauvegardé avec succès")
        } catch (error: any) {
            console.error("Erreur save:", error)
            toast.error(`Erreur: ${error.message}`)
        }
    }

    // 3. Publication (Visibility ON)
    const handlePublish = async () => {
        if (isPublished) {
            toast.info("Votre profil est déjà publié. Cliquez sur Enregistrer pour mettre à jour.")
            return
        }

        const trimmedName = formData.name.trim()
        if (!trimmedName) {
            toast.error("Veuillez renseigner votre nom avant de publier")
            return
        }
        if (!formData.specialty || !formData.category) {
            toast.error("Veuillez remplir votre Spécialité et Catégorie pour publier")
            return
        }

        try {
            const nameParts = trimmedName.split(" ")
            const payload = {
                first_name: nameParts[0] || "",
                last_name: nameParts.slice(1).join(" ") || "",
                role: formData.role,
                category: formData.category,
                specialty: formData.specialty,
                bio: formData.bio,
                phone: formData.phone,
                website: formData.website,
                country_id: formData.country_id || null,
                city: formData.city,
                tags: formData.tags,
                is_published: true, // FORCE ON
            }

            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error("Erreur lors de la publication")

            setIsPublished(true)
            toast.success("Félicitations ! Votre profil est maintenant EN LIGNE.")
        } catch (error: any) {
            toast.error(`Erreur: ${error.message}`)
        }
    }

    // 4. Dépublication (Visibility OFF)
    const handleUnpublish = async () => {
        if (!isPublished) return

        try {
            const trimmedName = formData.name.trim()
            const nameParts = trimmedName.split(" ")

            const payload = {
                first_name: nameParts[0] || "",
                last_name: nameParts.slice(1).join(" ") || "",
                role: formData.role,
                category: formData.category,
                specialty: formData.specialty,
                bio: formData.bio,
                phone: formData.phone,
                website: formData.website,
                country_id: formData.country_id || null,
                city: formData.city,
                is_published: false, // FORCE OFF
            }

            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error("Erreur dépublication")

            setIsPublished(false)
            toast.success("Votre profil est masqué (mode Brouillon).")
        } catch (error: any) {
            toast.error(`Erreur: ${error.message}`)
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
                    />
                    <CreerProfilPreview formData={formData} />
                </div>

                {/* Galerie de Projets */}
                <ProjectGallery />
            </motion.div>
        </div>
    )
}
