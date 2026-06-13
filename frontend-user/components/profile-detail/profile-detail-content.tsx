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
        const value = profile?.name || "EmiID"
        return (
            value
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("") || "EM"
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
                {/* Hero Card */}
                <section className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/40 rounded-[32px] overflow-hidden">
                    <div
                        className={cn(
                            "relative h-44 sm:h-56 md:h-64 overflow-hidden",
                            isOwnProfile && !uploadingCover ? "cursor-pointer group/cover" : "",
                        )}
                        onClick={() => {
                            if (isOwnProfile && !uploadingCover) document.getElementById("cover-upload-input")?.click()
                        }}
                    >
                        <img
                            src={
                                profile.coverImage
                                    ? getOptimizedImageUrl(profile.coverImage, { width: 1400, height: 420, quality: 90 })
                                    : "/placeholder.jpg"
                            }
                            alt="Couverture"
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                        {isOwnProfile && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 bg-black/30">
                                <div className="bg-white/95 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
                                    {uploadingCover ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                                    ) : (
                                        <Camera className="h-4 w-4 text-slate-700" />
                                    )}
                                    {uploadingCover ? "Mise à jour..." : "Modifier la couverture"}
                                </div>
                            </div>
                        )}

                        <input
                            id="cover-upload-input"
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            disabled={uploadingCover}
                            className="hidden"
                        />
                    </div>

                    {/* Profile Meta Section (Overlapping Avatar) */}
                    <div className="relative px-6 sm:px-8 pb-6 pt-16">
                        {/* Avatar wrapper */}
                        <div className="absolute -top-12 sm:-top-16 left-6 sm:left-8 flex items-end gap-4">
                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white shadow-xl relative z-10 transition-transform duration-500 hover:scale-105 bg-white">
                                <AvatarImage
                                    src={getOptimizedImageUrl(profile.avatar || "/profil/avatar.jpg", { width: 240, height: 240 })}
                                    alt={profile.name}
                                    className="object-cover rounded-full"
                                />
                                <AvatarFallback className="bg-gradient-to-br from-[#022753] to-[#022753]/80 text-white text-3xl font-black rounded-full flex items-center justify-center">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-none">
                                        {profile.name}
                                    </h1>
                                    {profile.verified && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/50 px-2.5 py-1 text-[11px] font-bold text-blue-600 shadow-sm shadow-blue-100/50">
                                            <Shield className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10 animate-pulse" />
                                            Vérifié
                                        </span>
                                    )}
                                    {profile.premium && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/50 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-sm shadow-amber-100/50 animate-pulse">
                                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                            Premium
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-slate-600 font-semibold">
                                    <span className="inline-flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                                        <Users className="h-3.5 w-3.5 text-[#CE1126]" />
                                        <span>{profile.specialty}</span>
                                    </span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 hidden sm:inline" />
                                    <span className="inline-flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                                        <MapPin className="h-3.5 w-3.5 text-[#022753]" />
                                        <span>{profile.location}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t border-slate-100 md:border-transparent pt-4 md:pt-0">
                                {/* Stats Block */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 sm:flex-initial rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 py-2 text-center min-w-[75px] shadow-sm hover:scale-105 transition-transform duration-300">
                                        <div className="text-lg font-black text-[#022753] leading-none">{followersCount}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Abonnés</div>
                                    </div>
                                    <div className="flex-1 sm:flex-initial rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 py-2 text-center min-w-[75px] shadow-sm hover:scale-105 transition-transform duration-300">
                                        <div className="text-lg font-black text-[#022753] leading-none">{profile.following}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Suivis</div>
                                    </div>
                                    <div className="flex-1 sm:flex-initial rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 py-2 text-center min-w-[75px] shadow-sm hover:scale-105 transition-transform duration-300">
                                        <div className="text-lg font-black text-[#022753] leading-none">{profile.skills.length}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Skills</div>
                                    </div>
                                </div>

                                {/* Actions buttons */}
                                <div className="flex gap-2.5 shrink-0">
                                    <Button
                                        size="lg"
                                        disabled={followLoading}
                                        className="flex-1 sm:flex-initial rounded-2xl h-11 text-xs gap-2 font-black bg-[#022753] hover:bg-[#022753]/95 shadow-md shadow-[#022753]/10 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-white disabled:opacity-70"
                                        onClick={handleFollow}
                                    >
                                        {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                                        {isFollowed ? "Abonné" : "Suivre"}
                                    </Button>
                                    {isLoggedIn && (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="flex-1 sm:flex-initial rounded-2xl h-11 text-xs gap-2 font-black border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                                            asChild
                                        >
                                            <Link href={`/messages?contact=${profile.id}`}>
                                                <MessageCircle className="h-4 w-4 text-slate-700" />
                                                Message
                                            </Link>
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="hidden sm:flex md:flex-initial rounded-2xl h-11 text-xs gap-2 font-black border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                                        onClick={handleShare}
                                    >
                                        <Share2 className="h-4 w-4 text-slate-700" />
                                        Partager
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        {/* About card */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 sm:p-8 shadow-xl shadow-slate-100/40 relative overflow-hidden group">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#CE1126]/5 to-transparent rounded-bl-full pointer-events-none" />
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Award className="h-4 w-4 text-[#CE1126]" />
                                À propos de moi
                            </h2>
                            <p className="mt-5 text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line font-medium">
                                {profile.bio}
                            </p>
                        </div>

                        {/* Tabs content card */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 sm:p-8 shadow-xl shadow-slate-100/40">
                            <Tabs defaultValue="skills" className="w-full">
                                <TabsList className="bg-slate-100/50 border border-slate-200/50 w-full justify-start h-auto p-1.5 mb-6 gap-2 rounded-2xl backdrop-blur-sm flex overflow-x-auto no-scrollbar snap-x whitespace-nowrap">
                                    <TabsTrigger
                                        value="skills"
                                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#022753] data-[state=active]:shadow-md data-[state=active]:border-white/80 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-black text-slate-500 transition-all duration-300 snap-start shrink-0"
                                    >
                                        Compétences
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="portfolio"
                                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#022753] data-[state=active]:shadow-md data-[state=active]:border-white/80 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-black text-slate-500 transition-all duration-300 snap-start shrink-0"
                                    >
                                        Portfolio & Réalisations
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="experience"
                                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#022753] data-[state=active]:shadow-md data-[state=active]:border-white/80 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-black text-slate-500 transition-all duration-300 snap-start shrink-0"
                                    >
                                        Parcours & Expériences
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="skills" className="animate-in fade-in duration-300 focus-visible:outline-none">
                                    <div className="flex flex-wrap gap-2.5">
                                        {profile.skills.length > 0 ? (
                                            profile.skills.map((skill, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="outline"
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl bg-gradient-to-r font-bold border transition-all text-xs hover:-translate-y-0.5 duration-300 shadow-sm",
                                                        getSkillBadgeStyles(idx)
                                                    )}
                                                >
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <div className="p-8 border border-dashed border-slate-200 text-center w-full rounded-2xl bg-slate-50/50">
                                                <p className="text-slate-500 font-bold text-xs">Aucune compétence spécifiée pour le moment.</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="portfolio" className="animate-in fade-in duration-300 focus-visible:outline-none">
                                    {loadingGallery ? (
                                        <div className="flex flex-col items-center justify-center p-12 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#022753] mb-4"></div>
                                            <p className="text-slate-500 text-xs font-bold">Chargement du portfolio...</p>
                                        </div>
                                    ) : gallery.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                            {gallery.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="group bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative"
                                                >
                                                    <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.title}
                                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        {item.status === "pending" && (
                                                            <div className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-400/30">
                                                                En attente de validation
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-5">
                                                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#022753] transition-colors duration-300">
                                                            {item.title}
                                                        </h4>
                                                        {item.description && (
                                                            <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-2">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 border border-dashed border-slate-200 text-center w-full rounded-2xl bg-slate-50/50">
                                            <p className="text-slate-500 font-bold text-xs">Aucune réalisation publiée pour le moment.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="experience" className="animate-in fade-in duration-300 focus-visible:outline-none">
                                    <div className="space-y-4">
                                        {profile.experiences.length > 0 ? (
                                            <div className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-6 py-2">
                                                {profile.experiences.map((exp, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#022753] flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                                            <div className="h-1 w-1 rounded-full bg-[#022753]" />
                                                        </div>
                                                        <div className="transition-all duration-300 group-hover:translate-x-1">
                                                            <h4 className="text-sm font-extrabold text-slate-900">{exp.title}</h4>
                                                            <p className="text-xs font-bold text-slate-500 mt-1">
                                                                {exp.company} • {exp.period}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
                                                <p className="text-sm font-bold text-slate-700">Parcours non renseigné.</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Ce membre est actif sur EmiID et ouvert aux opportunités de collaboration.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    <aside className="lg:col-span-4 space-y-6">
                        {/* Coordinates card */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-xl shadow-slate-100/40 relative overflow-hidden">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Globe className="h-4 w-4 text-[#022753]" />
                                Coordonnées
                            </h3>

                            <div className="mt-5 space-y-4 text-sm">
                                <div className="flex items-start gap-3.5 text-slate-700 hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors duration-200">
                                    <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membre depuis</div>
                                        <div className="font-extrabold text-slate-800">{joinedDate}</div>
                                    </div>
                                </div>

                                {profile.email && (
                                    <div className="flex items-start gap-3.5 text-slate-700 hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors duration-200">
                                        <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</div>
                                            <div className="font-extrabold text-slate-800 break-all">{profile.email}</div>
                                        </div>
                                    </div>
                                )}

                                {profile.phone && (
                                    <div className="flex items-start gap-3.5 text-slate-700 hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors duration-200">
                                        <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</div>
                                            <div className="font-extrabold text-slate-800 break-words">{profile.phone}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {profile.website && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full mt-5 h-11 rounded-2xl text-xs font-black border-slate-200 bg-white/80 hover:bg-slate-50 gap-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                                        Visiter le site <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                        </div>

                        {/* Share card */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-xl shadow-slate-100/40">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Share2 className="h-4 w-4 text-[#022753]" />
                                Partage
                            </h3>

                            <div className="mt-5 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={profileUrl}
                                        className="h-11 bg-slate-50/70 border-slate-200 text-slate-700 font-mono text-xs focus-visible:ring-0 rounded-2xl font-semibold select-all"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-11 w-11 rounded-2xl shrink-0 border-slate-200 bg-white/80 hover:bg-slate-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                                        onClick={() => copyToClipboard(profileUrl)}
                                    >
                                        {copiedLink === profileUrl ? <Check className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" /> : <Copy className="h-4 w-4 text-slate-700" />}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className="h-11 rounded-2xl border-slate-200 bg-white/80 hover:bg-slate-50 font-black text-xs gap-2 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                                        onClick={() => setIsShareModalOpen(true)}
                                    >
                                        <Share className="h-4 w-4 text-[#022753]" />
                                        Partager
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-11 rounded-2xl border-slate-200 bg-white/80 hover:bg-slate-50 font-black text-xs gap-2 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                                        onClick={downloadVCard}
                                    >
                                        <Download className="h-4 w-4 text-[#CE1126]" />
                                        vCard
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </aside>
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
