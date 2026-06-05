/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Wrapper principal pour le contenu de création de profil avec hydratation robuste et support des tags et secteurs
 * @created 2026-01-16
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Preloader } from "@/components/Preloader"
import { CreerProfilForm } from "./creer-profil-form"
import { CreerProfilPreview } from "./creer-profil-preview"
import { fetchWithAuth } from "@/lib/apiClient"
import { getReferenceCountriesCached, type ReferenceCountry } from "@/lib/location-cache"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Eye, X } from "lucide-react"

interface CreateProfileFormData {
    name: string
    role: string
    category: string
    activity_domain: string
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
    slug: string
}

const normalizeWebsite = (input: string) => {
    const value = input.trim()
    if (!value) return ""

    const noSpaces = value.replace(/\s+/g, "")
    const withProtocol = /^https?:\/\//i.test(noSpaces) ? noSpaces : `https://${noSpaces}`

    try {
        const url = new URL(withProtocol)
        if (!["http:", "https:"].includes(url.protocol)) return null
        if (!url.hostname || !url.hostname.includes(".")) return null
        return url.toString()
    } catch {
        return null
    }
}

const buildProfilePayload = (formData: CreateProfileFormData, isPublished: boolean) => {
    const trimmedName = formData.name.trim()
    const nameParts = trimmedName.split(/\s+/).filter(Boolean)

    const normalizedWebsite = normalizeWebsite(formData.website)

    return {
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        role: formData.role.trim(),
        category: formData.category,
        activity_domain: formData.activity_domain,
        specialty: formData.specialty.trim(),
        bio: formData.bio.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        website: normalizedWebsite || formData.website.trim(),
        avatar_url: formData.avatar || null,
        card_variant: formData.card_variant,
        country_id: formData.country_id || null,
        country_code: formData.country_code || null,
        country_name: formData.country_name || null,
        city: formData.city.trim(),
        tags: formData.tags,
        slug: formData.slug || null,
        is_published: isPublished,
    }
}

const validateProfileForm = (formData: CreateProfileFormData, mode: "draft" | "publish") => {
    const errors: string[] = []
    const trimmedName = formData.name.trim()
    const trimmedRole = formData.role.trim()
    const trimmedSpecialty = formData.specialty.trim()
    const trimmedBio = formData.bio.trim()
    const normalizedWebsite = normalizeWebsite(formData.website)
    if (formData.website.trim() && !normalizedWebsite) {
        errors.push("Le site web saisi n’est pas valide")
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
            errors.push("Veuillez choisir un design de carte EmiID")
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

        if (!formData.slug || !formData.slug.trim()) {
            errors.push("Veuillez renseigner votre lien personnalisé (pseudo)")
        } else if (formData.slug.trim().length < 3) {
            errors.push("Le pseudo de votre lien personnalisé doit contenir au moins 3 caractères")
        }
    }

    return errors
}

export function CreerProfilContent() {
    const [loadingStatus, setLoadingStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [isPublished, setIsPublished] = useState(false)
    const [countries, setCountries] = useState<ReferenceCountry[]>([])
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [unpublishing, setUnpublishing] = useState(false)
    const [formData, setFormData] = useState<CreateProfileFormData>({
        name: "",
        role: "",
        category: "",
        activity_domain: "",
        card_variant: "glass-blue",
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
        tags: [] as string[],
        slug: "",
    })

    const loadInitialData = useCallback(async () => {
        setLoadingStatus('loading')
        let isNewProfile = false
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
                    // Détecter si c'est un nouveau profil à configurer
                    if (data.message === "Profil à compléter" || !data.role) {
                        isNewProfile = true
                    }

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

                    // Hydratation complète avec valeurs de la base de données
                    setFormData({
                        name: fullName || "",
                        role: data.role || data.job_title || "",
                        category: data.category || "",
                        activity_domain: data.activity_domain || "",
                        card_variant: data.card_variant || "glass-blue",
                        specialty: data.specialty || "",
                        bio: data.bio || "",
                        phone: data.phone || "",
                        email: data.email || "",
                        website: data.website || "",
                        country_id: data.country_id || "",
                        country_code: resolvedCountryCode,
                        country_name: resolvedCountryName,
                        city: data.city || "",
                        avatar: data.avatar_url || "/profil/avatar.jpg",
                        tags: Array.isArray(data.tags) ? data.tags : [],
                        slug: data.slug || "",
                    })

                    if (typeof data.is_published === "boolean") {
                        setIsPublished(data.is_published)
                    }

                    if (isNewProfile) {
                        toast.info("Remplissez le formulaire pour créer votre carte EmiID")
                    }
                }
                setLoadingStatus('success')
            } else {
                // Si la réponse n'est pas ok (par exemple 404 car profil non créé)
                if (profileRes.status === 400) {
                    const errData = await profileRes.json().catch(() => null);
                    const errMsg = errData?.error || "Erreur de base de données";
                    toast.error(`Erreur de chargement du profil : ${errMsg}`);
                    console.error("Détails de l'erreur 400 :", errData);
                    setLoadingStatus('error')
                } else if (profileRes.status === 404) {
                    toast.info("Remplissez le formulaire pour créer votre carte EmiID");
                    setLoadingStatus('success')
                } else {
                    toast.error("Impossible de charger les données existantes");
                    setLoadingStatus('error')
                }
            }
        } catch (error) {
            console.error("Hydration error:", error)
            toast.error("Erreur de connexion au serveur")
            setLoadingStatus('error')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Dependency array empty ensures it runs once on mount properly

    useEffect(() => {
        loadInitialData()
    }, [loadInitialData])

    const handleInputChange = useCallback((field: string, value: any) => {
        if (validationErrors.length > 0) setValidationErrors([])
        setFormData((prev) => {
            const updates: any = { [field]: value }
            
            // Auto-génération du slug si vide quand on tape le nom
            if (field === "name" && !prev.slug) {
                // Remplace les caractères spéciaux, espaces, accents par des tirets
                updates.slug = value
                    .toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/^-|-$/g, "")
            }
            
            return { ...prev, ...updates }
        })
    }, [validationErrors])

    const handleSave = useCallback(async () => {
        if (saving) return
        try {
            setSaving(true)
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
            if (payload.website && payload.website !== formData.website.trim()) {
                setFormData((prev) => ({ ...prev, website: payload.website as string }))
            }
        } catch (error: any) {
            toast.error(`Échec: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }, [formData, isPublished, saving])

    const handlePublish = useCallback(async () => {
        if (publishing) return
        const errors = validateProfileForm(formData, "publish")
        if (errors.length > 0) {
            setValidationErrors(errors)
            toast.error(errors[0])
            return
        }

        try {
            setPublishing(true)
            const payload = buildProfilePayload(formData, true)
            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error("Échec de mise en ligne")

            setIsPublished(true)
            toast.success("Votre carte est maintenant visible dans l'annuaire !")
            if (payload.website && payload.website !== formData.website.trim()) {
                setFormData((prev) => ({ ...prev, website: payload.website as string }))
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setPublishing(false)
        }
    }, [formData, publishing])

    const handleUnpublish = useCallback(async () => {
        if (unpublishing) return
        try {
            setUnpublishing(true)
            const payload = buildProfilePayload(formData, false)
            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error("Échec retrait")

            setIsPublished(false)
            toast.success("Profil masqué avec succès.")
            if (payload.website && payload.website !== formData.website.trim()) {
                setFormData((prev) => ({ ...prev, website: payload.website as string }))
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setUnpublishing(false)
        }
    }, [formData, unpublishing])

    if (loadingStatus === 'loading') {
        return <Preloader text="Initialisation du profil" />
    }

    if (loadingStatus === 'error') {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
                <div className="bg-white/60 backdrop-blur-xl border border-red-100 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
                    <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                        <X className="h-8 w-8 text-rose-600 stroke-[2.5]" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Impossible de charger le profil</h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                        Une erreur est survenue lors de la récupération de vos données de profil. Veuillez vérifier votre connexion ou réessayer ultérieurement.
                    </p>
                    <button
                        onClick={loadInitialData}
                        className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg active:scale-95 duration-200"
                    >
                        Réessayer le chargement
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2 md:px-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-primary to-slate-800">Configurez votre Identité</h1>
                        <p className="text-sm md:text-base text-muted-foreground font-medium">Votre carte est votre premier contact avec le réseau.</p>
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

                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
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
                        saving={saving}
                        publishing={publishing}
                        unpublishing={unpublishing}
                    />
                    
                    {/* Desktop Preview */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-24 pt-4">
                            <CreerProfilPreview formData={formData} />
                        </div>
                    </div>
                </div>

                {/* Mobile Floating Action Button for Preview */}
                <div className="lg:hidden fixed bottom-[160px] right-4 z-[60]">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="bg-primary text-primary-foreground p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform" aria-label="Voir l'aperçu">
                                <Eye className="w-6 h-6" />
                            </button>
                        </DialogTrigger>
                        <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-sm mx-auto h-[80vh] flex flex-col justify-center">
                            <DialogTitle className="sr-only">Aperçu de la carte</DialogTitle>
                            <DialogDescription className="sr-only">Aperçu en direct de votre carte EmiID.</DialogDescription>
                            <div className="relative overflow-y-auto w-full no-scrollbar rounded-3xl">
                                <CreerProfilPreview formData={formData} />
                                <DialogClose className="absolute top-4 right-4 z-[70] bg-white text-rose-600 hover:text-rose-700 hover:scale-105 active:scale-95 transition-all p-2.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center justify-center focus:outline-none">
                                    <X className="w-5 h-5 stroke-[3]" />
                                    <span className="sr-only">Fermer l'aperçu</span>
                                </DialogClose>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>
        </div>
    )
}
