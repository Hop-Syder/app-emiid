/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Main shell for Settings, integrating modular sections
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useEffect } from "react"
import { Loader2, User, Shield, Bell, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"

// Modular Sections
import { ProfileSection } from "./profile-section"
import { SecuritySection } from "./security-section"
import { NotificationsSection } from "./notifications-section"
import { PreferencesSection } from "./preferences-section"

export function ParametresContent() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
        bio: "",
        avatar_url: "",
        category: "Artisan",
        role: "",
        specialty: "",
        activity_domain: "",
        country_id: "",
        country_code: "",
        country_name: "",
        city: "",
        pin_enabled: false,
        phone: ""
    })

    const [sectors, setSectors] = useState<any[]>([])
    const [professions, setProfessions] = useState<any[]>([])
    const [countries, setCountries] = useState<any[]>([])

    const loadUserProfile = async () => {
        try {
            setLoading(true)
            const response = await fetchWithAuth("/api/users/me")
            if (response.ok) {
                const data = await response.json()
                setProfile({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    email: data.email || "",
                    bio: data.bio || "",
                    avatar_url: data.avatar_url || "",
                    category: data.category || "Artisan",
                    role: data.role || "",
                    specialty: data.specialty || "",
                    activity_domain: data.activity_domain || "",
                    country_id: data.country_id || "",
                    country_code: data.country_code || "",
                    country_name: data.country_name || "",
                    city: data.city || "",
                    pin_enabled: data.pin_enabled || false,
                    phone: data.phone || ""
                })
            }
        } catch (error) {
            console.error("Erreur chargement profil:", error)
            toast.error("Impossible de charger votre profil")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const loadReferences = async () => {
            try {
                const [secRes, profRes, countryRes] = await Promise.all([
                    fetchWithAuth("/api/reference/sectors"),
                    fetchWithAuth("/api/reference/professions"),
                    fetchWithAuth("/api/reference/countries")
                ])
                if (secRes.ok) setSectors(await secRes.json())
                if (profRes.ok) setProfessions(await profRes.json())
                if (countryRes.ok) setCountries(await countryRes.json())
            } catch (error) {
                console.error("Erreur chargement références:", error)
            }
        }

        loadUserProfile()
        loadReferences()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(profile)
            })
            if (response.ok) {
                toast.success("Profil mis à jour avec succès !")
            } else {
                const errorData = await response.json().catch(() => null)
                toast.error(errorData?.error || "Erreur lors de la mise à jour")
            }
        } catch (error) {
            toast.error("Erreur réseau")
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        loadUserProfile()
        toast.info("Modifications annulées")
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 animate-in fade-in duration-500">
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <div className="space-y-1 text-center">
                    <p className="text-xl font-bold text-slate-900">Préparation de votre espace</p>
                    <p className="text-sm font-medium text-slate-500">Chargement de vos paramètres de compte...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header de la page */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white/60 backdrop-blur-xl p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white">
                <div className="space-y-1.5 md:space-y-2">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Paramètres du Compte</h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
                        Gérez vos informations personnelles, votre sécurité et vos préférences.
                    </p>
                </div>
                {/* On pourrait ajouter un petit widget résumé ici si besoin */}
            </div>

            <Tabs defaultValue="profil" className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:items-start" orientation="vertical">
                {/* Menu latéral (Desktop) ou horizontal scroll (Mobile) */}
                <div className="w-full lg:w-[280px] shrink-0 sticky top-24 z-10">
                    <div className="w-full overflow-x-auto pb-4 -mb-4 lg:overflow-visible lg:pb-0 lg:mb-0 scrollbar-hide">
                        <TabsList className="inline-flex lg:flex flex-row lg:flex-col h-auto justify-start items-stretch gap-2 bg-transparent p-0 w-max min-w-full lg:w-full px-1 lg:px-0">
                            <TabsTrigger 
                                value="profil" 
                                className="group justify-start w-full rounded-2xl h-12 md:h-14 px-5 text-sm md:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 bg-white border border-slate-100/50 text-slate-600 hover:bg-slate-50 transition-all duration-300"
                            >
                                <User className="mr-3 h-5 w-5 opacity-70 group-data-[state=active]:opacity-100" />
                                Informations Personnelles
                            </TabsTrigger>
                            <TabsTrigger 
                                value="securite" 
                                className="group justify-start w-full rounded-2xl h-12 md:h-14 px-5 text-sm md:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 bg-white border border-slate-100/50 text-slate-600 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Shield className="mr-3 h-5 w-5 opacity-70 group-data-[state=active]:opacity-100" />
                                Sécurité & Mot de passe
                            </TabsTrigger>
                            <TabsTrigger 
                                value="notifications" 
                                className="group justify-start w-full rounded-2xl h-12 md:h-14 px-5 text-sm md:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 bg-white border border-slate-100/50 text-slate-600 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Bell className="mr-3 h-5 w-5 opacity-70 group-data-[state=active]:opacity-100" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger 
                                value="preferences" 
                                className="group justify-start w-full rounded-2xl h-12 md:h-14 px-5 text-sm md:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 bg-white border border-slate-100/50 text-slate-600 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Settings className="mr-3 h-5 w-5 opacity-70 group-data-[state=active]:opacity-100" />
                                Préférences générales
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="flex-1 min-h-[500px] w-full">
                    <TabsContent value="profil" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-4 data-[state=active]:duration-500">
                        <ProfileSection
                            profile={profile}
                            setProfile={setProfile}
                            saving={saving}
                            handleSave={handleSave}
                            handleCancel={handleCancel}
                        />
                    </TabsContent>

                    <TabsContent value="securite" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-4 data-[state=active]:duration-500">
                        <SecuritySection
                            profile={profile}
                            setProfile={setProfile}
                        />
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-4 data-[state=active]:duration-500">
                        <NotificationsSection />
                    </TabsContent>

                    <TabsContent value="preferences" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-4 data-[state=active]:duration-500">
                        <PreferencesSection />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
