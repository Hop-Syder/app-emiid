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
import { Loader2 } from "lucide-react"
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
        pin_enabled: false
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
                    pin_enabled: data.pin_enabled || false
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
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement de votre profil...</p>
            </div>
        )
    }

    return (
        <Tabs defaultValue="profil" className="space-y-6">
            <TabsList className="grid w-full max-w-[600px] grid-cols-4 rounded-2xl p-1">
                <TabsTrigger value="profil" className="rounded-xl">
                    Profil
                </TabsTrigger>
                <TabsTrigger value="securite" className="rounded-xl">
                    Sécurité
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-xl">
                    Notifications
                </TabsTrigger>
                <TabsTrigger value="preferences" className="rounded-xl">
                    Préférences
                </TabsTrigger>
            </TabsList>

            <TabsContent value="profil" className="space-y-6">
                <ProfileSection
                    profile={profile}
                    setProfile={setProfile}
                    saving={saving}
                    handleSave={handleSave}
                    handleCancel={handleCancel}
                    countries={countries}
                />
            </TabsContent>

            <TabsContent value="securite" className="space-y-6">
                <SecuritySection
                    profile={profile}
                    setProfile={setProfile}
                />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
                <NotificationsSection />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
                <PreferencesSection />
            </TabsContent>
        </Tabs>
    )
}
