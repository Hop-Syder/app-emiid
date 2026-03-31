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
import { Loader2, User, Shield, Bell, Settings, Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { getReferenceCountriesCached } from "@/lib/location-cache"

const defaultNotificationSettings = {
    messages: true,
    network_activity: true,
    newsletter: false,
    push: true,
}

const defaultPreferences = {
    language: "fr",
    currency: "xof",
    timezone: "gmt",
    theme: "light",
    public_profile: false,
}

const defaultSecuritySettings = {
    two_factor_enabled: false,
}

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
        phone: "",
        is_published: false,
        is_verified: false,
        is_premium: false
    })
    const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings)
    const [preferences, setPreferences] = useState(defaultPreferences)
    const [securitySettings, setSecuritySettings] = useState(defaultSecuritySettings)

    const supabase = createClient()

    const loadUserProfile = async () => {
        try {
            setLoading(true)
            const [response, authUserResponse] = await Promise.all([
                fetchWithAuth("/api/users/me"),
                supabase.auth.getUser(),
            ])
            const authUser = authUserResponse.data.user

            if (response.ok) {
                const data = await response.json()
                const fallbackFirstName = authUser?.user_metadata?.first_name || authUser?.user_metadata?.given_name || ""
                const fallbackLastName = authUser?.user_metadata?.last_name || authUser?.user_metadata?.family_name || ""
                const fallbackPhone = authUser?.phone || ""
                const fallbackEmail = authUser?.email || ""
                const fallbackAvatar = authUser?.user_metadata?.avatar_url || ""

                setProfile({
                    first_name: data.first_name || fallbackFirstName,
                    last_name: data.last_name || fallbackLastName,
                    email: data.email || fallbackEmail,
                    bio: data.bio || "",
                    avatar_url: data.avatar_url || fallbackAvatar,
                    category: data.category || "Artisan",
                    role: data.role || "",
                    specialty: data.specialty || "",
                    activity_domain: data.activity_domain || "",
                    country_id: data.country_id || "",
                    country_code: data.country_code || "",
                    country_name: data.country_name || "",
                    city: data.city || "",
                    pin_enabled: data.pin_enabled || false,
                    phone: data.phone || fallbackPhone,
                    is_published: data.is_published || false,
                    is_verified: data.is_verified || false,
                    is_premium: data.is_premium || false
                })
                setNotificationSettings({
                    ...defaultNotificationSettings,
                    ...(data.notification_preferences || {}),
                })
                setPreferences({
                    ...defaultPreferences,
                    ...(data.app_preferences || {}),
                    public_profile: typeof data.app_preferences?.public_profile === "boolean"
                        ? data.app_preferences.public_profile
                        : !!data.is_published,
                })
                setSecuritySettings({
                    ...defaultSecuritySettings,
                    ...(data.security_preferences || {}),
                })
            } else if (authUser) {
                setProfile((prev) => ({
                    ...prev,
                    first_name: authUser.user_metadata?.first_name || authUser.user_metadata?.given_name || prev.first_name,
                    last_name: authUser.user_metadata?.last_name || authUser.user_metadata?.family_name || prev.last_name,
                    email: authUser.email || prev.email,
                    phone: authUser.phone || prev.phone,
                    avatar_url: authUser.user_metadata?.avatar_url || prev.avatar_url,
                }))
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
                await Promise.all([
                    fetchWithAuth("/api/reference/sectors"),
                    fetchWithAuth("/api/reference/professions"),
                    getReferenceCountriesCached(),
                ])
            } catch (error) {
                console.error("Erreur chargement références:", error)
            }
        }

        loadUserProfile()
        loadReferences()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } catch {
            toast.error("Erreur réseau")
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        loadUserProfile()
        toast.info("Modifications annulées")
    }

    const saveSettings = async (payload: {
        notification_preferences?: typeof defaultNotificationSettings
        app_preferences?: typeof defaultPreferences
        security_preferences?: typeof defaultSecuritySettings
    }, successMessage: string) => {
        setSaving(true)
        try {
            const response = await fetchWithAuth("/api/users/settings", {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                toast.error(errorData?.error || "Erreur lors de la sauvegarde")
                return false
            }

            const data = await response.json()
            if (data.notification_preferences) {
                setNotificationSettings({ ...defaultNotificationSettings, ...data.notification_preferences })
            }
            if (data.app_preferences) {
                setPreferences({ ...defaultPreferences, ...data.app_preferences })
                setProfile((prev) => ({ ...prev, is_published: !!data.app_preferences.public_profile }))
            }
            if (data.security_preferences) {
                setSecuritySettings({ ...defaultSecuritySettings, ...data.security_preferences })
            }

            toast.success(successMessage)
            return true
        } catch {
            toast.error("Erreur réseau")
            return false
        } finally {
            setSaving(false)
        }
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white/60 backdrop-blur-xl p-5 md:p-8 rounded-xl md:rounded-xl shadow-xl shadow-slate-200/40 border border-white">
                <div className="space-y-1.5 md:space-y-2">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        Paramètres du Compte
                        {profile.is_verified && <Shield className="h-6 w-6 text-primary" />}
                        {profile.is_premium && <Star className="h-6 w-6 text-amber-500 fill-amber-500" />}
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
                        Gérez vos informations personnelles, votre sécurité et vos préférences.
                    </p>
                </div>
                {profile.is_premium && (
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 flex items-center gap-3 px-4 py-2 rounded-xl border border-amber-200">
                        <div className="p-2 bg-amber-500 rounded-lg text-white shadow-lg shadow-amber-500/30">
                            <Star className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Statut</p>
                            <p className="text-sm font-black text-amber-950">Membre Premium</p>
                        </div>
                    </div>
                )}
            </div>

            <Tabs defaultValue="profil" className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:items-start" orientation="vertical">
                {/* Menu latéral (Desktop) ou horizontal scroll (Mobile) */}
                <div className="w-full lg:w-[280px] shrink-0 sticky top-24 z-10">
                    <div className="w-full overflow-x-auto pb-4 -mb-4 lg:overflow-visible lg:pb-0 lg:mb-0 scrollbar-hide">
                        <TabsList className="inline-flex lg:flex flex-row lg:flex-col h-auto justify-start items-stretch gap-2 bg-transparent p-0 w-max min-w-full lg:w-full px-1 lg:px-0">
                            <TabsTrigger
                                value="profil"
                                className="group justify-start w-full rounded-xl h-12 md:h-14 px-5 text-sm md:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 bg-white border border-slate-100/50 text-slate-600 hover:bg-slate-50 transition-all duration-300"
                            >
                                <User className="mr-3 h-5 w-5 opacity-70 group-data-[state=active]:opacity-100" />
                                Informations Personnelles
                            </TabsTrigger>
                            <TabsTrigger
                                value="securite"
                                className="group justify-start w-full rounded-xl h-12 md:h-14 px-5 text-sm md:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 bg-white border border-slate-100/50 text-slate-600 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Shield className="mr-3 h-5 w-5 opacity-70 group-data-[state=active]:opacity-100" />
                                Sécurité & Mot de passe
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                className="group justify-start w-full rounded-xl h-12 md:h-14 px-5 text-sm md:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 bg-white border border-slate-100/50 text-slate-600 hover:bg-slate-50 transition-all duration-300"
                            >
                                <Bell className="mr-3 h-5 w-5 opacity-70 group-data-[state=active]:opacity-100" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger
                                value="preferences"
                                className="group justify-start w-full rounded-xl h-12 md:h-14 px-5 text-sm md:text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 bg-white border border-slate-100/50 text-slate-600 hover:bg-slate-50 transition-all duration-300"
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
                            securitySettings={securitySettings}
                            setSecuritySettings={setSecuritySettings}
                            saveSettings={saveSettings}
                        />
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-4 data-[state=active]:duration-500">
                        <NotificationsSection
                            settings={notificationSettings}
                            setSettings={setNotificationSettings}
                            onSave={() => saveSettings({ notification_preferences: notificationSettings }, "Préférences de notifications mises à jour")}
                            saving={saving}
                        />
                    </TabsContent>

                    <TabsContent value="preferences" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-4 data-[state=active]:duration-500">
                        <PreferencesSection
                            settings={preferences}
                            setSettings={setPreferences}
                            onSave={() => saveSettings({ app_preferences: preferences }, "Préférences générales mises à jour")}
                            saving={saving}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
