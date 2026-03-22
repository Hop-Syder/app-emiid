"use client"

import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { ProfileStats } from "./profile-stats"
import { ProfileCard } from "./profile-card"
import { Loader2, Search, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function FollowedProfilesContent() {
    const [followedProfiles, setFollowedProfiles] = useState<any[]>([])
    const [followers, setFollowers] = useState<any[]>([])
    const [filteredProfiles, setFilteredProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<"name" | "recent" | "followers">("recent")
    const [activeTab, setActiveTab] = useState("following")
    const router = useRouter()
    const supabase = createClient()

    const loadFollows = async () => {
        try {
            const [followingRes, followersRes] = await Promise.all([
                fetchWithAuth("/api/users/follows"),
                fetchWithAuth("/api/users/followers")
            ])

            if (followingRes.ok) {
                const data = await followingRes.json()
                setFollowedProfiles(data)
            }

            if (followersRes.ok) {
                const data = await followersRes.json()
                setFollowers(data)
            }
        } catch (error) {
            console.error("Load follows error:", error)
            toast.error("Erreur lors du chargement de votre portefeuille")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFollows()

        // Realtime subscription to follow changes
        const channel = supabase
            .channel('portfolio-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'user_follows' },
                () => loadFollows()
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'project_gallery' },
                () => {
                    toast.info("Un entrepreneur que vous suivez a publié une mise à jour !")
                    loadFollows()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Filtering and Sorting
    useEffect(() => {
        let source = activeTab === "following" ? followedProfiles : followers
        let result = [...source]

        if (searchQuery) {
            result = result.filter(p =>
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        result.sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name)
            if (sortBy === "followers") return (b.followers_count || 0) - (a.followers_count || 0)
            return new Date(b.created_at || Date.now()).getTime() - new Date(a.created_at || Date.now()).getTime()
        })

        setFilteredProfiles(result)
    }, [searchQuery, followedProfiles, followers, sortBy, activeTab])

    const handleUnfollow = async (profileId: string) => {
        try {
            const res = await fetchWithAuth(`/api/users/follow/${profileId}`, {
                method: "POST"
            })
            if (res.ok) {
                setFollowedProfiles(prev => prev.filter(p => (p.id !== profileId && p.user_id !== profileId)))
                toast.success("Vous ne suivez plus ce profil")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        }
    }

    const handleSaveNote = async (profileId: string, note: string) => {
        try {
            const res = await fetchWithAuth(`/api/users/follow/${profileId}/note`, {
                method: "PUT",
                body: JSON.stringify({ note })
            })
            if (res.ok) {
                setFollowedProfiles(prev => prev.map(p =>
                    (p.id === profileId || p.user_id === profileId) ? { ...p, notes: note } : p
                ))
                toast.success("Note enregistrée avec succès")
            } else {
                toast.error("Erreur lors de l'enregistrement de la note")
            }
        } catch (error) {
            toast.error("Erreur de connexion")
        }
    }

    const handleViewProfile = (profileId: string) => {
        router.push(`/profil/${profileId}`)
    }

    const handleMessage = (profileId: string) => {
        router.push(`/messages?user=${profileId}`)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium text-lg">Chargement de votre portefeuille...</p>
            </div>
        )
    }

    const totalUpdates = followedProfiles.reduce((acc, p) => acc + (p.new_updates || 0), 0)
    const activeToday = followedProfiles.filter(p => p.is_active_today).length

    return (
        <div className="space-y-6">
            <ProfileStats
                total={followedProfiles.length}
                updates={totalUpdates}
                activeToday={activeToday}
            />

            <Tabs defaultValue="following" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-muted/20 border border-muted/10 h-12">
                    <TabsTrigger value="following" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Favoris ({followedProfiles.length})
                    </TabsTrigger>
                    <TabsTrigger value="followers" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Abonnés ({followers.length})
                    </TabsTrigger>
                </TabsList>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm mt-6">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={activeTab === "following" ? "Rechercher dans vos favoris..." : "Rechercher un abonné..."}
                            className="pl-10 rounded-xl bg-white/80 border-none shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-xl gap-2 bg-white/80">
                                <SlidersHorizontal className="h-4 w-4" />
                                Trier par: {sortBy === "name" ? "Nom" : sortBy === "followers" ? "Abonnés" : "Récents"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuLabel>Options de tri</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSortBy("recent")}>Récents</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("name")}>Nom</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("followers")}>Nombre d'abonnés</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <TabsContent value="following" className="mt-6 space-y-4">
                    {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((profile) => (
                            <ProfileCard
                                key={profile.user_id || profile.id}
                                profile={{
                                    id: profile.user_id || profile.id,
                                    name: profile.name,
                                    role: profile.role || "Membre",
                                    location: profile.location,
                                    avatar: profile.avatar_url || "/african-user.jpg",
                                    lastActive: profile.is_active_today ? "Actif aujourd'hui" : "Actif récemment",
                                    newUpdates: profile.new_updates || 0,
                                    lastUpdate: profile.last_update_title || profile.specialty || "Aucune mise à jour récente",
                                    followers: profile.followers || profile.followers_count || 0,
                                    premium: profile.category?.toLowerCase() === 'entreprise',
                                    verified: true,
                                    notes: profile.notes
                                }}
                                onUnfollow={handleUnfollow}
                                onViewProfile={handleViewProfile}
                                onSaveNote={handleSaveNote}
                                onMessage={handleMessage}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                            {searchQuery ? (
                                <p className="text-muted-foreground text-lg">Aucun résultat pour "{searchQuery}"</p>
                            ) : (
                                <>
                                    <p className="text-muted-foreground text-lg">Votre portefeuille est vide.</p>
                                    <p className="text-sm text-muted-foreground mt-2">Suivez des entrepreneurs pour les retrouver ici.</p>
                                </>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="followers" className="mt-6 space-y-4">
                    {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((profile) => (
                            <ProfileCard
                                key={profile.user_id || profile.id || `follower-${profile.name}`}
                                profile={{
                                    id: profile.user_id || profile.id,
                                    name: profile.name,
                                    role: profile.role || "Abonné",
                                    location: profile.location || "N/A",
                                    avatar: profile.avatar_url || "/african-user.jpg",
                                    lastActive: profile.is_active_today ? "Actif aujourd'hui" : "Actif récemment",
                                    newUpdates: 0,
                                    lastUpdate: "S'est abonné à votre profil",
                                    followers: profile.followers || profile.followers_count || 0,
                                    premium: profile.category?.toLowerCase() === 'entreprise',
                                    verified: true
                                }}
                                onViewProfile={handleViewProfile}
                                onMessage={handleMessage}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                            <p className="text-muted-foreground text-lg">Vous n'avez pas encore d'abonnés.</p>
                            <p className="text-sm text-muted-foreground mt-2">Partagez votre profil pour attirer de nouveaux membres.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
