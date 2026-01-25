/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Wrapper principal pour le contenu de création de profil
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { CreerProfilForm } from "./creer-profil-form"
import { CreerProfilPreview } from "./creer-profil-preview"
import { useEffect } from "react"
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
                const [countryRes, profileRes] = await Promise.all([
                    fetchWithAuth("/api/reference/countries"),
                    fetchWithAuth("/api/users/me"),
                ])

                if (countryRes.ok) {
                    setCountries(await countryRes.json())
                }

                if (profileRes.ok) {
                    const data = await profileRes.json()
                    const name = `${data.first_name || ""} ${data.last_name || ""}`.trim()
                    setFormData((prev) => ({
                        ...prev,
                        name: name || prev.name,
                        role: data.role || prev.role,
                        category: data.category || prev.category,
                        specialty: data.specialty || prev.specialty,
                        bio: data.bio || prev.bio,
                        phone: data.phone || prev.phone,
                        email: data.email || prev.email,
                        website: data.website || prev.website,
                        country_id: data.country_id || prev.country_id,
                        city: data.city || prev.city,
                        avatar: data.avatar_url || prev.avatar,
                    }))
                    if (typeof data.is_published === "boolean") {
                        setIsPublished(data.is_published)
                    }
                }
            } catch (error) {
                console.error("Erreur chargement données profil:", error)
            }
        }
        loadInitialData()
    }, [])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        const trimmedName = formData.name.trim()
        if (!trimmedName) {
            toast.error("Veuillez renseigner votre nom avant d'enregistrer votre profil")
            return
        }
        if (!formData.category) {
            toast.error("Veuillez sélectionner une catégorie (Artisan, Freelance, etc.)")
            return
        }
        if (!formData.specialty) {
            toast.error("Veuillez renseigner votre spécialité")
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("Vous devez être connecté pour enregistrer votre profil")
                return
            }

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
                is_published: isPublished,
            }

            console.log("Envoi au backend:", payload)

            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.error || "Erreur lors de la sauvegarde")
            }

            toast.success("Profil enregistré avec succès!")
        } catch (error: any) {
            console.error("Erreur sauvegarde complète:", error)
            toast.error(`Erreur: ${error.message || "Une erreur est survenue lors de la sauvegarde"}`)
        }
    }

    const handlePublish = async () => {
        if (isPublished) return

        const trimmedName = formData.name.trim()
        if (!trimmedName) {
            toast.error("Veuillez renseigner votre nom avant de publier votre profil")
            return
        }
        if (!formData.category || !formData.specialty) {
            toast.error("Veuillez renseigner au minimum la catégorie et la spécialité avant de publier")
            return
        }
        if (!formData.country_id && !formData.country_code) {
            toast.error("Veuillez sélectionner un pays avant de publier votre profil dans l'annuaire")
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const nameParts = trimmedName.split(" ")
            const firstName = nameParts[0] || ""
            const lastName = nameParts.slice(1).join(" ") || ""

            const payload = {
                p_user_id: user.id,
                p_first_name: firstName,
                p_last_name: lastName,
                p_role: formData.role,
                p_category: formData.category,
                p_specialty: formData.specialty,
                p_bio: formData.bio,
                p_phone: formData.phone,
                p_website: formData.website,
                p_country_id: formData.country_id || null,
                p_city: formData.city,
                p_is_published: true,
                p_tags: formData.tags
            }

            const { error } = await supabase.rpc("save_profile_card", payload)

            if (error) {
                console.error("Erreur RPC Publish:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })
                throw error
            }

            setIsPublished(true)
            toast.success("Profil publié dans l'annuaire!")
        } catch (error: any) {
            console.error("Erreur publication complète:", error)
            toast.error(`Erreur: ${error.message || "Erreur lors de la publication"}`)
        }
    }

    const handleUnpublish = async () => {
        if (!isPublished) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const nameParts = formData.name.trim().split(" ")
            const firstName = nameParts[0] || ""
            const lastName = nameParts.slice(1).join(" ") || ""

            const payload = {
                p_user_id: user.id,
                p_first_name: firstName,
                p_last_name: lastName,
                p_role: formData.role,
                p_category: formData.category,
                p_specialty: formData.specialty,
                p_bio: formData.bio,
                p_phone: formData.phone,
                p_website: formData.website,
                p_country_id: formData.country_id || null,
                p_city: formData.city,
                p_is_published: false,
                p_tags: formData.tags
            }

            const { error } = await supabase.rpc("save_profile_card", payload)

            if (error) {
                console.error("Erreur RPC Unpublish:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })
                throw error
            }

            setIsPublished(false)
            toast.success("Profil dépublié avec succès!")
        } catch (error: any) {
            console.error("Erreur dépublication complète:", error)
            toast.error(`Erreur: ${error.message || "Erreur lors de la dépublication"}`)
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
            </motion.div>
        </div>
    )
}
