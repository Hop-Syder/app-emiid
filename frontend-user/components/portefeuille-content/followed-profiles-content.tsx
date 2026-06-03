/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contenu du portefeuille de profils suivis avec design Grid Premium
 * @created 2026-04-19
 * @updated 2026-05-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { ProfileStats } from "./profile-stats"
import { ProfileCardMini } from "./profile-card-mini"
import { Search, SlidersHorizontal, UserPlus, Loader2 } from "lucide-react"
import { Preloader } from "@/components/Preloader"
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
import { motion, AnimatePresence } from "framer-motion"

interface PortfolioProfile {
    id?: string
    user_id?: string
    slug?: string
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
const getPortfolioProfileSlug = (profile: PortfolioProfile) => profile.slug || getPortfolioProfileId(profile)

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

    const handleViewProfile = (profileIdentifier: string) => {
        router.push(`/profil/${profileIdentifier}`)
    }

    const handleMessage = (profileId: string) => {
        router.push(`/messages?contact=${profileId}`)
    }

    if (loading) {
        return <Preloader text="Chargement de votre portefeuille" minHeight="min-h-[400px]" />
    }

    const totalUpdates = 0
    const activeTodayCount = followedProfiles.filter(isActiveToday).length

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10 pb-20 pt-8">
            <ProfileStats
                total={followedProfiles.length}
                updates={totalUpdates}
                activeToday={activeTodayCount}
            />

            <Tabs defaultValue="following" onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <TabsList className="h-14 p-1.5 bg-slate-100/40 dark:bg-zinc-900/55 backdrop-blur-md rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 w-full md:w-auto min-w-[320px]">
                            <TabsTrigger 
                                value="following" 
                                className="flex-1 rounded-xl font-bold text-[10px] uppercase tracking-widest text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-850 data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all duration-300"
                            >
                                Favoris ({followedProfiles.length})
                            </TabsTrigger>
                            <TabsTrigger 
                                value="followers" 
                                className="flex-1 rounded-xl font-bold text-[10px] uppercase tracking-widest text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-850 data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all duration-300"
                            >
                                Abonnés ({followers.length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                <Input
                                    placeholder={activeTab === "following" ? "Rechercher un profil..." : "Rechercher un abonné..."}
                                    className="h-14 pl-12 rounded-2xl bg-card/65 border-border shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 text-sm font-medium transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-14 px-6 rounded-2xl gap-3 border border-border bg-card/65 shadow-sm hover:bg-muted transition-all">
                                        <SlidersHorizontal className="h-4 w-4 text-primary dark:text-secondary" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
                                            {sortBy === "name" ? "Nom" : sortBy === "followers" ? "Abonnés" : "Récents"}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[200px] border border-border bg-card shadow-xl">
                                    <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 px-3 py-2">Trier par</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="rounded-xl font-bold text-sm py-3 px-4 focus:bg-muted focus:text-primary transition-colors cursor-pointer" onClick={() => setSortBy("recent")}>Plus récents</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold text-sm py-3 px-4 focus:bg-muted focus:text-primary transition-colors cursor-pointer" onClick={() => setSortBy("name")}>Nom alphabétique</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold text-sm py-3 px-4 focus:bg-muted focus:text-primary transition-colors cursor-pointer" onClick={() => setSortBy("followers")}>Nombre d&apos;abonnés</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <TabsContent value="following" className="m-0 outline-none">
                        <AnimatePresence mode="popLayout">
                            {filteredProfiles.length > 0 ? (
                                <motion.div 
                                    className="space-y-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {filteredProfiles.map((profile) => (
                                        <ProfileCardMini
                                            key={getPortfolioProfileId(profile)}
                                            profile={{
                                                id: getPortfolioProfileId(profile),
                                                slug: getPortfolioProfileSlug(profile),
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
                                                notes: profile.notes || undefined,
                                                isActiveToday: isActiveToday(profile)
                                            }}
                                            onUnfollow={handleUnfollow}
                                            onViewProfile={handleViewProfile}
                                            onSaveNote={handleSaveNote}
                                            onMessage={handleMessage}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-32 bg-card/45 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-border"
                                >
                                    <div className="p-6 rounded-full bg-muted mb-6">
                                        <UserPlus className="h-12 w-12 text-muted-foreground/60" />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
                                        {searchQuery ? "Aucun résultat trouvé" : "Votre portefeuille est vide"}
                                    </h3>
                                    <p className="text-muted-foreground font-medium text-center max-w-sm text-sm">
                                        {searchQuery 
                                            ? `Nous n'avons trouvé aucun profil correspondant à "${searchQuery}" dans vos favoris.` 
                                            : "Commencez à suivre des membres inspirants pour les retrouver rapidement ici et gérer vos notes."}
                                    </p>
                                    {!searchQuery && (
                                        <Button 
                                            onClick={() => router.push('/annuaire')}
                                            className="mt-8 h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                        >
                                            Explorer la communauté
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </TabsContent>

                    <TabsContent value="followers" className="m-0 outline-none">
                        <AnimatePresence mode="popLayout">
                            {filteredProfiles.length > 0 ? (
                                <motion.div 
                                    className="space-y-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {filteredProfiles.map((profile) => (
                                        <ProfileCardMini
                                            key={`follower-${getPortfolioProfileId(profile)}`}
                                            profile={{
                                                id: getPortfolioProfileId(profile),
                                                slug: getPortfolioProfileSlug(profile),
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
                                                verified: !!profile.is_verified,
                                                isActiveToday: isActiveToday(profile)
                                            }}
                                            onViewProfile={handleViewProfile}
                                            onMessage={handleMessage}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-32 bg-card/45 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-border"
                                >
                                    <div className="p-6 rounded-full bg-muted mb-6">
                                        <Loader2 className="h-12 w-12 text-muted-foreground/60" />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Vous n&apos;avez pas encore d&apos;abonnés</h3>
                                    <p className="text-muted-foreground font-medium text-center max-w-sm text-sm">
                                        Partagez votre profil EmiID pour attirer de nouveaux membres et développer votre réseau.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
