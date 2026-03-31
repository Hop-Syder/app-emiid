"use client"

import { useState, useEffect, useMemo } from "react"
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

interface PortfolioProfile {
    id?: string
    user_id?: string
    name: string
    role?: string
    location?: string
    avatar_url?: string
    specialty?: string
    followers?: number
    followers_count?: number
    is_premium?: boolean
    is_verified?: boolean
    card_variant?: string
    notes?: string | null
    followed_at?: string | null
    last_active_at?: string | null
    last_active_label?: string | null
}

const getPortfolioProfileId = (profile: PortfolioProfile) => profile.user_id || profile.id || ""

const getProfileLastActive = (profile: PortfolioProfile) => profile.last_active_label || "Activité récente"

const isActiveToday = (profile: PortfolioProfile) => {
    if (!profile.last_active_at) {
        return false
    }

    const lastActive = new Date(profile.last_active_at)
    return Date.now() - lastActive.getTime() < 24 * 60 * 60 * 1000
}

const getProfileLastUpdate = (profile: PortfolioProfile, mode: "following" | "followers") => {
    if (mode === "followers") {
        return profile.followed_at
            ? `Abonné depuis le ${new Date(profile.followed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`
            : "S'est abonné à votre profil"
    }

    if (profile.specialty) {
        return profile.specialty
    }

    if (profile.last_active_at) {
        return `Dernière activité le ${new Date(profile.last_active_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`
    }

    return "Profil synchronisé"
}

export function FollowedProfilesContent() {
    const [followedProfiles, setFollowedProfiles] = useState<PortfolioProfile[]>([])
    const [followers, setFollowers] = useState<PortfolioProfile[]>([])
    const [filteredProfiles, setFilteredProfiles] = useState<PortfolioProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<"name" | "recent" | "followers">("recent")
    const [activeTab, setActiveTab] = useState("following")
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])

    const loadFollows = async () => {
        try {
            const [followingRes, followersRes] = await Promise.all([
                fetchWithAuth("/api/users/follows"),
                fetchWithAuth("/api/users/followers")
            ])

            if (followingRes.ok) {
                const data = await followingRes.json() as PortfolioProfile[]
                setFollowedProfiles(data)
            }

            if (followersRes.ok) {
                const data = await followersRes.json() as PortfolioProfile[]
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
        void supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUserId(user?.id || null)
        })

        void loadFollows()

        if (!currentUserId) {
            return
        }

        const followingChannel = supabase
            .channel(`portfolio-following-${currentUserId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'user_follows', filter: `follower_id=eq.${currentUserId}` },
                () => { void loadFollows() }
            )
            .subscribe()

        const followersChannel = supabase
            .channel(`portfolio-followers-${currentUserId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'user_follows', filter: `following_id=eq.${currentUserId}` },
                () => { void loadFollows() }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(followingChannel)
            supabase.removeChannel(followersChannel)
        }
    }, [currentUserId, supabase])

    // Filtering and Sorting
    useEffect(() => {
        const source = activeTab === "following" ? followedProfiles : followers
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
            return new Date(b.last_active_at || b.followed_at || Date.now()).getTime() - new Date(a.last_active_at || a.followed_at || Date.now()).getTime()
        })

        setFilteredProfiles(result)
    }, [searchQuery, followedProfiles, followers, sortBy, activeTab])

    const handleUnfollow = async (profileId: string) => {
        try {
            const res = await fetchWithAuth(`/api/users/follow/${profileId}`, {
                method: "POST"
            })
            if (res.ok) {
                setFollowedProfiles(prev => prev.filter(p => getPortfolioProfileId(p) !== profileId))
                toast.success("Vous ne suivez plus ce profil")
            }
        } catch {
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
                    getPortfolioProfileId(p) === profileId ? { ...p, notes: note } : p
                ))
                toast.success("Note enregistrée avec succès")
            } else {
                toast.error("Erreur lors de l'enregistrement de la note")
            }
        } catch {
            toast.error("Erreur de connexion")
        }
    }

    const handleViewProfile = (profileId: string) => {
        router.push(`/profil/${profileId}`)
    }

    const handleMessage = (profileId: string) => {
        router.push(`/messages?contact=${profileId}`)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium text-lg">Chargement de votre portefeuille...</p>
            </div>
        )
    }

    const totalUpdates = 0
    const activeToday = followedProfiles.filter(isActiveToday).length

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
                            <DropdownMenuItem onClick={() => setSortBy("followers")}>Nombre d&apos;abonnés</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <TabsContent value="following" className="mt-6 space-y-4">
                    {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((profile) => (
                            <ProfileCard
                                key={profile.user_id || profile.id}
                                profile={{
                                    id: getPortfolioProfileId(profile),
                                    name: profile.name,
                                    role: profile.role || "Membre",
                                    location: profile.location || "Non renseigné",
                                    avatar: profile.avatar_url || "/profil/avatar.jpg",
                                    lastActive: getProfileLastActive(profile),
                                    newUpdates: 0,
                                    lastUpdate: getProfileLastUpdate(profile, "following"),
                                    followers: profile.followers || profile.followers_count || 0,
                                    premium: !!profile.is_premium,
                                    card_variant: profile.card_variant,
                                    verified: !!profile.is_verified,
                                    notes: profile.notes || undefined
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
                                <p className="text-muted-foreground text-lg">Aucun résultat pour &quot;{searchQuery}&quot;</p>
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
                                    id: getPortfolioProfileId(profile),
                                    name: profile.name,
                                    role: profile.role || "Abonné",
                                    location: profile.location || "N/A",
                                    avatar: profile.avatar_url || "/profil/avatar.jpg",
                                    lastActive: getProfileLastActive(profile),
                                    newUpdates: 0,
                                    lastUpdate: getProfileLastUpdate(profile, "followers"),
                                    followers: profile.followers || profile.followers_count || 0,
                                    premium: !!profile.is_premium,
                                    card_variant: profile.card_variant,
                                    verified: !!profile.is_verified
                                }}
                                onViewProfile={handleViewProfile}
                                onMessage={handleMessage}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                            <p className="text-muted-foreground text-lg">Vous n&apos;avez pas encore d&apos;abonnés.</p>
                            <p className="text-sm text-muted-foreground mt-2">Partagez votre profil pour attirer de nouveaux membres.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
