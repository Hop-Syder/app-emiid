/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de détail de profil utilisateur EmiID (refonte UI pro + partage avancé).
 * @created 2026-05-24
 * @updated 2026-06-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Award,
    Calendar,
    Camera,
    Check,
    Copy,
    Download,
    ExternalLink,
    Globe,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    MoreHorizontal,
    Phone,
    Share,
    Share2,
    Shield,
    Star,
    Users,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

import { fetchWithAuth } from "@/lib/apiClient"
import { getOptimizedImageUrl } from "@/lib/image-optimization"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

import { ProfileHero } from "./profile-hero"
import { ProfileMainContent } from "./profile-main-content"
import { ProfileSidebar } from "./profile-sidebar"

// Modales chargées à la demande (code-splitting) pour alléger le bundle initial
const ShareModal = dynamic(() => import("./share-modal").then((m) => m.ShareModal), { ssr: false })
const ProfileModerationDialogs = dynamic(
    () => import("./profile-moderation-dialogs").then((m) => m.ProfileModerationDialogs),
    { ssr: false }
)

interface ProfileData {
    id: string
    name: string
    role: string
    bio: string
    location: string
    avatar: string
    coverImage?: string
    specialty: string
    category?: string
    slug?: string
    verified: boolean
    premium: boolean
    followers: number
    following: number
    isOnline: boolean
    isFollowed: boolean
    joinedDate: string
    email?: string
    phone?: string
    website?: string
    skills: string[]
    experiences: { title: string; company: string; period: string; current: boolean }[]
}

interface ProfileQueryResult {
    id: string
    user_id?: string | null
    first_name: string | null
    last_name: string | null
    bio: string | null
    city: string | null
    avatar_url: string | null
    cover_url?: string | null
    specialty: string | null
    category: string | null
    slug: string | null
    is_published: boolean | null
    is_verified: boolean | null
    is_premium: boolean | null
    followers_count: number | null
    created_at: string | null
    email: string | null
    phone: string | null
    website: string | null
    role: string | null
    countries: { name: string } | { name: string }[] | null
    profile_tags: Array<{
        tags: { name: string | null } | null
    }> | null
}

interface ProfileDetailContentProps {
    profileId: string
}

export function ProfileDetailContent({ profileId }: ProfileDetailContentProps) {
    const router = useRouter()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFollowed, setIsFollowed] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [joinedDate, setJoinedDate] = useState<string>("...")
    const [scrolled, setScrolled] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [gallery, setGallery] = useState<Array<{ id: string; title: string; description: string; imageUrl: string; status?: string }>>([])
    const [loadingGallery, setLoadingGallery] = useState(false)

    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [copiedLink, setCopiedLink] = useState<string | null>(null)

    // Identité de l'utilisateur courant (pour signalement / blocage)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    // Signalement
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [reportReason, setReportReason] = useState("")
    const [reportSubmitting, setReportSubmitting] = useState(false)

    // Blocage
    const [isBlockOpen, setIsBlockOpen] = useState(false)
    const [blocking, setBlocking] = useState(false)

    // Abonnement (anti-double-clic)
    const [followLoading, setFollowLoading] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            setIsLoggedIn(!!session)
        }
        checkAuth()
    }, [])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) return
            setLoading(true)
            try {
                const supabase = createClient()
                // Garantir l'initialisation et la synchronisation de la session Supabase avant le fetch pour injecter le token JWT
                await supabase.auth.getSession()
                
                const cleanProfileId = profileId.toLowerCase()
                const isUUID =
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanProfileId)

                let data: ProfileQueryResult | null = null
                let error: any = null

                // 1. Tenter de lire directement la table user_profiles (fonctionnera si c'est le profil de l'utilisateur connecté grâce aux RLS)
                let query = supabase
                    .from("user_profiles")
                    .select("id, user_id, first_name, last_name, bio, city, avatar_url, cover_url, specialty, category, slug, is_published, is_verified, is_premium, followers_count, created_at, email, phone, website, role, countries(name), profile_tags(tags(name))")

                 if (isUUID) {
                    query = query.or(`slug.eq.${cleanProfileId},user_id.eq.${cleanProfileId},id.eq.${cleanProfileId}`)
                } else {
                    query = query.eq("slug", cleanProfileId)
                }

                const res = await query.single()
                data = res.data as unknown as ProfileQueryResult
                error = res.error

                if (error) {
                    console.log("[ProfileDetailContent] Échec de lecture user_profiles, tentative public_profiles...", error.message);
                }

                // 2. Si non trouvé ou erreur (ex: RLS bloquant l'accès à user_profiles pour les tiers), tenter la vue public_profiles
                if (error || !data) {
                    let publicQuery = supabase
                        .from("public_profiles")
                        .select("id, user_id, first_name, last_name, bio, city, avatar_url, cover_url, specialty, category, slug, is_published, is_verified, is_premium, followers_count, created_at, email, phone, website, role, countries(name), profile_tags(tags(name))")

                    if (isUUID) {
                        publicQuery = publicQuery.or(`slug.eq.${cleanProfileId},user_id.eq.${cleanProfileId},id.eq.${cleanProfileId}`)
                    } else {
                        publicQuery = publicQuery.eq("slug", cleanProfileId)
                    }

                    const publicRes = await publicQuery.single()
                    if (publicRes.data && !publicRes.error) {
                        data = publicRes.data as unknown as ProfileQueryResult
                        error = null
                    } else {
                        console.error("[ProfileDetailContent] Échec final de chargement du profil:", publicRes.error);
                        // Conserver la dernière erreur si les deux échouent
                        error = publicRes.error || error
                    }
                }

                if (data && !error) {
                    const countriesData = data.countries
                    const countryName = countriesData
                        ? (Array.isArray(countriesData)
                            ? countriesData[0]?.name
                            : countriesData.name)
                        : ""

                    const resolvedUserId = data.user_id || data.id;

                    // Parallélisation des appels de follows et de galerie pour de meilleures performances
                    setLoadingGallery(true)
                    const [followsRes, galleryRes, isFollowedRes] = await Promise.all([
                        // A. Nombre de personnes suivies
                        supabase
                            .from("user_follows")
                            .select("*", { count: "exact", head: true })
                            .eq("follower_id", resolvedUserId),
                        
                        // B. Galerie de projets
                        supabase
                            .from("project_gallery")
                            .select("id, title, description, image_url")
                            .eq("profile_id", data.id)
                            .order("order_index", { ascending: true }),

                        // C. Statut d'abonnement
                        fetchWithAuth("/api/users/follows")
                            .then(async (res) => {
                                if (res.ok) {
                                    const follows = await res.json()
                                    return follows.some((f: { user_id: string }) => f.user_id === resolvedUserId)
                                }
                                return false
                            })
                            .catch(() => false)
                    ])

                    const followingCountVal = (!followsRes.error && followsRes.count !== null) ? followsRes.count : 0

                    if (!galleryRes.error && galleryRes.data) {
                        setGallery(galleryRes.data.map(item => ({
                            id: item.id,
                            title: item.title || "",
                            description: item.description || "",
                            imageUrl: item.image_url
                        })))
                    }
                    setLoadingGallery(false)

                    setIsFollowed(isFollowedRes)

                    const mappedProfile: ProfileData = {
                        id: resolvedUserId,
                        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Utilisateur EmiID",
                        role: data.role || "Membre EmiID",
                        bio: data.bio || "Ce membre n'a pas encore rédigé sa biographie professionnelle.",
                        location: data.city ? `${data.city}, ${countryName || ""}` : countryName || "Afrique",
                        avatar: data.avatar_url || "/profil/avatar.jpg",
                        coverImage: data.cover_url || undefined,
                        specialty: data.specialty || "Expertise",
                        category: data.category || "",
                        slug: data.slug || undefined,
                        verified: !!data.is_verified,
                        premium: !!data.is_premium,
                        followers: data.followers_count || 0,
                        following: followingCountVal,
                        isOnline: false,
                        isFollowed: isFollowedRes,
                        joinedDate: data.created_at
                            ? new Date(data.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                            : "2024",
                        email: data.email || undefined,
                        website: data.website || undefined,
                        phone: data.phone || undefined,
                        skills:
                            data.profile_tags
                                ?.map((pt) => pt.tags?.name)
                                .filter((name): name is string => typeof name === "string" && name.trim().length > 0) || [],
                        experiences: [],
                    }

                    setProfile(mappedProfile)
                    setFollowersCount(mappedProfile.followers)
                    setJoinedDate(mappedProfile.joinedDate)

                } else if (error && error.code === "PGRST116") {
                    setProfile(null)
                }
            } catch (e) {
                console.error("Erreur chargement profil:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [profileId])

    useEffect(() => {
        const checkCurrentUser = async () => {
            if (!profile) return
            try {
                const supabase = createClient()
                const {
                    data: { user },
                } = await supabase.auth.getUser()
                setCurrentUserId(user?.id ?? null)
                setIsOwnProfile(!!user && user.id === profile.id)
            } catch (e) {
                console.error("Erreur check user:", e)
            }
        }
        checkCurrentUser()
    }, [profile])

    // Redirection de l'UUID vers le pseudo (slug) pour masquer l'ID de l'utilisateur
    useEffect(() => {
        if (profile && profile.slug && profileId !== profile.slug) {
            router.replace(`/profil/${profile.slug}`)
        }
    }, [profile, profileId, router])

    const initials = useMemo(() => {
        if (!profile?.name) return ""
        return (
            profile.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("")
        )
    }, [profile?.name])

    const getProfileUrl = () =>
        typeof window !== "undefined" ? `${window.location.origin}/profil/${profile?.slug || profile?.id}` : ""

    const profileUrl = getProfileUrl()

    const copyToClipboard = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value)
            setCopiedLink(value)
            toast.success("Lien copié !", { description: "Prêt à être partagé." })
            setTimeout(() => setCopiedLink(null), 2000)
        } catch {
            toast.error("Impossible de copier le lien")
        }
    }

    const getVCard = () => {
        const safe = (value?: string) =>
            (value || "")
                .replace(/\r?\n/g, " ")
                .replace(/,/g, "\\,")
                .trim()

        const fullName = safe(profile?.name)
        const role = safe(profile?.role)
        const phone = safe(profile?.phone)
        const email = safe(profile?.email)
        const website = safe(profile?.website)

        return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${fullName}`,
            role ? `TITLE:${role}` : null,
            phone ? `TEL;TYPE=CELL:${phone}` : null,
            email ? `EMAIL;TYPE=INTERNET:${email}` : null,
            website ? `URL:${website}` : null,
            `URL:${profileUrl}`,
            "END:VCARD",
        ]
            .filter(Boolean)
            .join("\n")
    }

    const downloadVCard = () => {
        try {
            const vcard = getVCard()
            const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download =
                `${(profile?.name || "contact").replace(/[^\p{L}\p{N}\s_-]/gu, "").trim() || "contact"}.vcf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
            toast.success("vCard téléchargée", { description: "Ajoutez ce contact à votre carnet." })
        } catch {
            toast.error("Impossible de télécharger la vCard")
        }
    }

    const handleShare = async () => {
        if (!profileUrl) return

        const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }) : null
        if (nav?.share) {
            try {
                await nav.share({
                    title: `${profile?.name || "Profil"} — EmiID`,
                    text: profile?.bio
                        ? profile.bio.slice(0, 120)
                        : `Découvrez le profil de ${profile?.name || "ce membre"} sur EmiID.`,
                    url: profileUrl,
                })
                return
            } catch {
                // Annulation utilisateur ou refus navigateur → fallback modal.
            }
        }

        setIsShareModalOpen(true)
    }

    const handleFollow = async () => {
        if (!profile || followLoading) return
        setFollowLoading(true)
        try {
            const res = await fetchWithAuth(`/api/users/follow/${profile.id}`, { method: "POST" })
            if (res.ok) {
                const data = await res.json()
                setIsFollowed(data.followed)
                setFollowersCount((prev) => (data.followed ? prev + 1 : prev - 1))
                toast.success(data.followed ? "Vous suivez ce membre" : "Abonnement retiré")
            } else {
                toast.error("Veuillez vous connecter pour suivre ce membre")
            }
        } catch {
            toast.error("Erreur de connexion")
        } finally {
            setFollowLoading(false)
        }
    }

    const openReport = () => {
        if (!currentUserId) {
            toast.error("Veuillez vous connecter pour signaler ce profil")
            return
        }
        setReportReason("")
        setIsReportOpen(true)
    }

    const handleReportSubmit = async () => {
        if (!profile || !currentUserId) return
        const reason = reportReason.trim()
        if (reason.length < 3) {
            toast.error("Merci de préciser la raison (3 caractères minimum)")
            return
        }
        setReportSubmitting(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from("content_reports").insert({
                subject_type: "profile",
                subject_id: profile.id,
                reporter_id: currentUserId,
                reason,
            })
            if (error) {
                // 23505 = violation de contrainte unique (signalement déjà en cours)
                if (error.code === "23505") {
                    toast.info("Vous avez déjà signalé ce profil. Il est en cours d'examen.")
                    setIsReportOpen(false)
                    return
                }
                throw error
            }
            toast.success("Signalement envoyé", { description: "Notre équipe va l'examiner." })
            setIsReportOpen(false)
        } catch (e) {
            console.error("Erreur signalement:", e)
            toast.error("Impossible d'envoyer le signalement")
        } finally {
            setReportSubmitting(false)
        }
    }

    const handleBlock = async () => {
        if (!profile) return
        if (!currentUserId) {
            toast.error("Veuillez vous connecter pour bloquer ce profil")
            return
        }
        setBlocking(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from("user_blocks").insert({
                blocker_id: currentUserId,
                blocked_id: profile.id,
            })
            // 23505 = déjà bloqué : on considère l'action comme réussie (idempotent)
            if (error && error.code !== "23505") throw error
            toast.success("Profil bloqué", { description: "Vous ne verrez plus ce membre." })
            setIsBlockOpen(false)
            router.push("/annuaire")
        } catch (e) {
            console.error("Erreur blocage:", e)
            toast.error("Impossible de bloquer ce profil")
        } finally {
            setBlocking(false)
        }
    }

    const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return
            const file = event.target.files[0]

            if (!file.type.startsWith("image/")) {
                toast.error("Veuillez sélectionner une image valide.")
                return
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error("L'image est trop lourde (Max 2MB) !")
                return
            }

            setUploadingCover(true)
            const supabase = createClient()
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session) {
                toast.error("Vous devez être connecté pour effectuer cette action.")
                return
            }

            const user = session.user
            const fileExt = file.name.split(".").pop()
            const fileName = `cover_${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
                upsert: true,
                contentType: file.type,
            })
            if (uploadError) throw uploadError

            const {
                data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(filePath)

            const { error: updateError } = await supabase
                .from("user_profiles")
                .update({ cover_url: publicUrl } as any)
                .eq("user_id", user.id)
            if (updateError) throw updateError

            setProfile((prev) => (prev ? { ...prev, coverImage: publicUrl } : null))
            toast.success("Image de couverture mise à jour !")
        } catch (error: any) {
            console.error("Erreur upload couverture:", error)
            const message = error?.message || (typeof error === "string" ? error : "Inconnue")
            toast.error("Erreur lors de l'upload de la couverture : " + message)
        } finally {
            setUploadingCover(false)
        }
    }

    if (loading) return <ProfileSkeleton />

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] gap-6 p-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mb-2 shadow-sm">
                    <Users className="h-9 w-9 text-slate-300" />
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Profil introuvable</h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Ce compte n&apos;existe pas ou a été désactivé par nos modérateurs.
                    </p>
                </div>
                <Button
                    onClick={() => router.push("/annuaire")}
                    size="lg"
                    className="rounded-2xl gap-2 font-bold bg-[#022753] hover:bg-[#022753]/95 shadow-lg shadow-[#022753]/20 transition-all active:scale-95"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l&apos;annuaire
                </Button>
            </div>
        )
    }

    const getSkillBadgeStyles = (idx: number) => {
        const presets = [
            "from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200/50 hover:bg-blue-100/20",
            "from-[#CE1126]/5 to-[#CE1126]/10 text-[#CE1126] border-[#CE1126]/20 hover:bg-[#CE1126]/15",
            "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100/20",
            "from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200/50 hover:bg-amber-100/20",
            "from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200/50 hover:bg-purple-100/20",
        ]
        return presets[idx % presets.length]
    }

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#022753]/5 via-[#f8fafc] to-[#CE1126]/5 text-slate-900 antialiased selection:bg-[#022753]/10 selection:text-[#022753]">
            {/* Header */}
            <div
                className={cn(
                    "sticky top-0 z-50 transition-all duration-300",
                    scrolled 
                        ? "bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm shadow-slate-100/50" 
                        : "bg-transparent border-b border-transparent",
                )}
            >
                <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-700" />
                        <span className="font-bold text-slate-800">Retour</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="rounded-xl gap-2 border-white/60 bg-white/60 backdrop-blur-md hover:bg-white active:scale-95 transition-all shadow-sm"
                        >
                            <Share2 className="h-4 w-4 text-slate-600" />
                            Partager
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Plus d'options"
                                    className="rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                                >
                                    <MoreHorizontal className="h-5 w-5 text-slate-700" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl shadow-xl border-slate-100/60 bg-white/95 backdrop-blur-md w-52 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                <DropdownMenuItem
                                    className="rounded-xl font-bold py-2.5 cursor-pointer hover:bg-slate-50 text-xs text-slate-700"
                                    onClick={() => setIsShareModalOpen(true)}
                                >
                                    Outils de partage
                                </DropdownMenuItem>
                                {!isOwnProfile && (
                                    <>
                                        <DropdownMenuItem
                                            className="rounded-xl font-bold py-2.5 cursor-pointer hover:bg-slate-50 text-xs text-slate-700"
                                            onClick={openReport}
                                        >
                                            Signaler
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="rounded-xl font-bold py-2.5 text-red-600 cursor-pointer hover:bg-red-50 text-xs"
                                            onClick={() => setIsBlockOpen(true)}
                                        >
                                            Bloquer
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <main className="container max-w-6xl mx-auto px-4 pb-24 pt-4">
                <ProfileHero
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                    uploadingCover={uploadingCover}
                    handleCoverUpload={handleCoverUpload}
                    initials={initials}
                    followersCount={followersCount}
                    followLoading={followLoading}
                    isFollowed={isFollowed}
                    handleFollow={handleFollow}
                    isLoggedIn={isLoggedIn}
                    handleShare={handleShare}
                />

                <section className="mt-6 grid lg:grid-cols-12 gap-6 items-start">
                    <ProfileMainContent
                        profile={profile}
                        gallery={gallery}
                        loadingGallery={loadingGallery}
                    />

                    <ProfileSidebar
                        profile={profile}
                        joinedDate={joinedDate}
                        profileUrl={profileUrl}
                        copiedLink={copiedLink}
                        copyToClipboard={copyToClipboard}
                        setIsShareModalOpen={setIsShareModalOpen}
                        downloadVCard={downloadVCard}
                    />
                </section>
            </main>

            {/* Share Dialog (chargé à la demande) */}
            {profile && isShareModalOpen && (
                <ShareModal
                    isOpen={isShareModalOpen}
                    onOpenChange={setIsShareModalOpen}
                    profile={profile}
                    profileUrl={profileUrl}
                />
            )}

            {/* Dialogues de modération (chargés à la demande) */}
            {(isReportOpen || isBlockOpen) && (
                <ProfileModerationDialogs
                    profileName={profile?.name}
                    isReportOpen={isReportOpen}
                    onReportOpenChange={setIsReportOpen}
                    reportReason={reportReason}
                    onReportReasonChange={setReportReason}
                    reportSubmitting={reportSubmitting}
                    onReportSubmit={handleReportSubmit}
                    isBlockOpen={isBlockOpen}
                    onBlockOpenChange={setIsBlockOpen}
                    blocking={blocking}
                    onBlock={handleBlock}
                />
            )}
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#022753]/5 via-[#f8fafc] to-[#CE1126]/5 animate-pulse">
            <div className="h-16 container max-w-6xl mx-auto px-4 flex items-center justify-between py-6">
                <div className="h-10 w-24 bg-slate-200 rounded-2xl" />
                <div className="h-10 w-28 bg-slate-200 rounded-2xl" />
            </div>

            <div className="container max-w-6xl mx-auto px-4">
                <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="h-48 sm:h-56 bg-slate-200" />
                    <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
                        <div className="h-24 w-24 bg-slate-200 rounded-full ring-4 ring-white" />
                        <div className="flex-1 space-y-3 w-full">
                            <div className="h-7 w-1/3 bg-slate-200 rounded-xl" />
                            <div className="h-5 w-1/2 bg-slate-200 rounded-lg" />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="h-11 w-28 bg-slate-200 rounded-2xl" />
                            <div className="h-11 w-28 bg-slate-200 rounded-2xl" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-40 bg-white border border-slate-200 rounded-[32px]" />
                        <div className="h-64 bg-white border border-slate-200 rounded-[32px]" />
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className="h-44 bg-white border border-slate-200 rounded-[32px]" />
                        <div className="h-44 bg-white border border-slate-200 rounded-[32px]" />
                    </div>
                </div>
            </div>
        </div>
    )
}
