"use client"

import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { ProfileStats } from "./profile-stats"
import { ProfileCard } from "./profile-card"
import { Loader2 } from "lucide-react"

export function FollowedProfilesContent() {
    const [followedProfiles, setFollowedProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadFollows = async () => {
            try {
                const res = await fetchWithAuth("/api/users/follows")
                if (res.ok) {
                    const data = await res.json()
                    setFollowedProfiles(data)
                }
            } catch (error) {
                console.error("Load follows error:", error)
            } finally {
                setLoading(false)
            }
        }
        loadFollows()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium text-lg">Chargement de votre portefeuille...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ProfileStats
                total={followedProfiles.length}
                updates={0}
                activeToday={0}
            />

            <div className="space-y-4">
                {followedProfiles.length > 0 ? (
                    followedProfiles.map((profile) => (
                        <ProfileCard key={profile.user_id || profile.id} profile={{
                            name: profile.name,
                            role: profile.role || "Membre",
                            location: profile.location,
                            avatar: profile.avatar_url || "/african-user.jpg",
                            lastActive: "Actif récemment",
                            newUpdates: 0,
                            lastUpdate: profile.specialty || "Aucune mise à jour récente",
                            followers: 0,
                            premium: profile.category?.toLowerCase() === 'entreprise',
                            verified: true
                        }} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                        <p className="text-muted-foreground text-lg">Votre portefeuille est vide.</p>
                        <p className="text-sm text-muted-foreground mt-2">Suivez des entrepreneurs pour les retrouver ici.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
