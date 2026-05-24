/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant UI/UX de détail de profil utilisateur pour EmiID. Version Bento Grid Premium intégrant des dégradés subtils, du verre poli (glassmorphism) et une harmonie d'espace pour un effet "wouh" de niveau international.
 * @created 2026-05-24
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect } from "react"
import {
    ArrowLeft,
    Shield,
    MapPin,
    Users,
    MessageCircle,
    Share2,
    Mail,
    Calendar,
    Briefcase,
    Star,
    ExternalLink,
    MoreHorizontal,
    Copy,
    Check,
    Linkedin,
    Twitter,
    Globe,
    Phone,
    Award,
    Camera,
    Loader2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { getOptimizedImageUrl } from "@/lib/image-optimization"

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

interface ProfileDetailContentProps {
    profileId: string
}

export function ProfileDetailContent({ profileId }: ProfileDetailContentProps) {
    const router = useRouter()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFollowed, setIsFollowed] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [scrolled, setScrolled] = useState(false)
    const [joinedDate, setJoinedDate] = useState<string>("...")
    const [uploadingCover, setUploadingCover] = useState(false)
    const [isOwnProfile, setIsOwnProfile] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const checkCurrentUser = async () => {
            if (!profile) return
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (user && user.id === profile.id) {
                    setIsOwnProfile(true)
                }
            } catch (e) {
                console.error("Erreur check user:", e)
            }
        }
        checkCurrentUser()
    }, [profile])

    const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return
            const file = event.target.files[0]

            if (!file.type.startsWith("image/")) {
                toast.error("Veuillez sélectionner une image valide.")
                return
            }

            if (file.size > 2 * 1024 * 1024) { // Max 2MB
                toast.error("L'image est trop lourde (Max 2MB) !")
                return
            }

            setUploadingCover(true)
            const supabase = createClient()
            
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error("Vous devez être connecté pour effectuer cette action.")
                return
            }

            const user = session.user
            const fileExt = file.name.split(".").pop()
            const fileName = `cover_${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            // Upload vers le bucket public 'avatars'
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath)

            // Mise à jour du profil en BDD
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ cover_url: publicUrl })
                .eq('user_id', user.id)

            if (updateError) throw updateError

            setProfile(prev => prev ? { ...prev, coverImage: publicUrl } : null)
            toast.success("Image de couverture mise à jour !")
        } catch (error: any) {
            console.error("Erreur upload couverture:", error)
            toast.error("Erreur lors de l'upload de la couverture : " + error.message)
        } finally {
            setUploadingCover(false)
        }
    }

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) return
            setLoading(true)
            try {
                const supabase = createClient()
                
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(profileId);
                
                let query = supabase
                    .from('user_profiles')
                    .select(`*, countries(name), profile_tags(tags(name))`)
                    
                if (isUUID) {
                    query = query.or(`slug.eq.${profileId},user_id.eq.${profileId}`)
                } else {
                    query = query.eq('slug', profileId)
                }
                
                const { data, error } = await query.single()
                    
                if (data && !error) {
                    const mappedProfile: ProfileData = {
                        id: data.user_id || data.id,
                        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Utilisateur EmiID",
                        role: data.role || "Membre EmiID",
                        bio: data.bio || "Ce membre n'a pas encore rédigé sa biographie professionnelle.",
                        location: data.city ? `${data.city}, ${data.countries?.name || ""}` : (data.countries?.name || "Afrique"),
                        avatar: data.avatar_url || "/profil/avatar.jpg",
                        coverImage: data.cover_url || undefined,
                        specialty: data.specialty || "Expertise",
                        category: data.category || "",
                        slug: data.slug || undefined,
                        verified: !!data.is_verified,
                        premium: !!data.is_premium,
                        followers: data.followers_count || 0,
                        following: data.following_count || 0,
                        isOnline: false,
                        isFollowed: false,
                        joinedDate: data.created_at ? new Date(data.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "2024",
                        email: data.email,
                        website: data.website,
                        phone: data.phone,
                        skills: data.profile_tags?.map((pt: any) => pt.tags?.name) || [],
                        experiences: []
                    }
                    setProfile(mappedProfile)
                    setFollowersCount(mappedProfile.followers)
                    
                    if (data.created_at) {
                        const formatted = new Date(data.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                        setJoinedDate(formatted)
                    }

                    // Vérifier si l'utilisateur actuel suit ce profil
                    try {
                        const followRes = await fetchWithAuth("/api/users/follows")
                        if (followRes.ok) {
                            const follows = await followRes.json()
                            const alreadyFollowed = follows.some((f: { user_id: string }) => f.user_id === mappedProfile.id)
                            setIsFollowed(alreadyFollowed)
                        }
                    } catch {
                        // Pas connecté ou erreur silencieuse
                    }
                } else if (error && error.code === 'PGRST116') {
                    setProfile(null)
                }
            } catch (error) {
                console.error("Erreur chargement profil:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [profileId])

    const handleFollow = async () => {
        if (!profile) return

        try {
            const res = await fetchWithAuth(`/api/users/follow/${profile.id}`, {
                method: "POST"
            })
            if (res.ok) {
                const data = await res.json()
                setIsFollowed(data.followed)
                setFollowersCount(prev => data.followed ? prev + 1 : prev - 1)
                toast.success(data.followed ? "Vous suivez ce membre" : "Abonnement retiré")
            } else {
                toast.error("Veuillez vous connecter pour suivre ce membre")
            }
        } catch {
            toast.error("Erreur de connexion")
        }
    }

    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [copiedLink, setCopiedLink] = useState<string | null>(null)

    const handleShare = () => {
        setIsShareModalOpen(true)
    }

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url)
        setCopiedLink(url)
        toast.success("Lien copié !", { description: "Prêt à être partagé." })
        setTimeout(() => setCopiedLink(null), 2000)
    }

    const shareToWhatsApp = (url: string) => {
        const text = `Découvrez le profil de ${profile?.name} sur EmiID :`
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, '_blank')
    }

    const shareToLinkedIn = (url: string) => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    }

    const shareToTwitter = (url: string) => {
        const text = `Découvrez le profil de ${profile?.name} sur EmiID :`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    }

    const initials = profile?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'NA'

    if (loading) return <ProfileSkeleton />

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] gap-6 p-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mb-2 shadow-sm">
                    <Users className="h-9 w-9 text-slate-300" />
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Profil introuvable</h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Ce compte n&apos;existe pas ou a été désactivé par nos modérateurs.</p>
                </div>
                <Button onClick={() => router.push('/annuaire')} size="lg" className="rounded-2xl gap-2 font-bold bg-[#022753] hover:bg-[#022753]/95 shadow-lg shadow-[#022753]/20 transition-all active:scale-95">
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l&apos;annuaire
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased selection:bg-[#022753]/10 selection:text-[#022753]">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-[#022753]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-gradient-to-br from-[#CE1126]/3 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Navigation Header */}
            <div className={cn(
                "sticky top-0 z-50 transition-all duration-300 border-b",
                scrolled ? "bg-white/70 backdrop-blur-xl border-slate-200/40 py-3 shadow-sm" : "bg-transparent border-transparent py-5"
            )}>
                <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 rounded-xl bg-white/80 hover:bg-slate-50 shadow-sm border border-slate-200/50 transition-all active:scale-95"
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                        <span className="font-bold text-slate-700">Retour</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Partager ce profil" className="rounded-xl bg-white/80 hover:bg-slate-50 shadow-sm border border-slate-200/50 h-10 w-10 transition-all active:scale-95">
                            <Share2 className="h-4 w-4 text-slate-600" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Plus d'options" className="rounded-xl bg-white/80 hover:bg-slate-50 shadow-sm border border-slate-200/50 h-10 w-10 transition-all active:scale-95">
                                    <MoreHorizontal className="h-4.5 w-4.5 text-slate-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-slate-100 w-48 p-1">
                                <DropdownMenuItem className="rounded-lg font-medium py-2 cursor-pointer hover:bg-slate-50">Signaler</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg font-medium py-2 text-red-600 cursor-pointer hover:bg-red-50">Bloquer</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <main className="container max-w-5xl mx-auto px-4 pb-24">
                
                {/* 1. Header Profile Bento Block */}
                <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div 
                        className={cn(
                            "relative h-44 sm:h-56 overflow-hidden",
                            isOwnProfile && !uploadingCover ? "cursor-pointer group/cover" : ""
                        )}
                        onClick={() => {
                            if (isOwnProfile && !uploadingCover) {
                                document.getElementById("cover-upload-input")?.click()
                            }
                        }}
                    >
                        {/* Cover Image */}
                        <img 
                            src={profile.coverImage ? getOptimizedImageUrl(profile.coverImage, { width: 1200, height: 350, quality: 90 }) : "/placeholder.jpg"} 
                            alt="Cover" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-102" 
                        />
                        
                        {/* Shadow Overlay */}
                        <div className="absolute inset-0 bg-black/10 group-hover/cover:bg-black/20 transition-colors" />

                        {/* Upload Button Overlay */}
                        {isOwnProfile && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <div className="bg-white/95 text-slate-800 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
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

                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            {profile.premium && (
                                <Badge className="bg-amber-400/90 hover:bg-amber-400 text-[#022753] border-none gap-1.5 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm">
                                    <Star className="h-3 w-3 fill-[#022753] text-[#022753]" />
                                    Premium
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Profile Information Row */}
                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end -mt-12 sm:-mt-16">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className={cn(
                                "absolute -inset-1.5 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300",
                                profile.premium ? "from-amber-400 to-yellow-500" : "from-[#022753] to-red-500"
                            )} />
                            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl ring-4 ring-white shadow-md relative">
                                <AvatarImage 
                                    src={getOptimizedImageUrl(profile.avatar || "/profil/avatar.jpg", { width: 300, height: 300 })} 
                                    alt={profile.name} 
                                    className="object-cover" 
                                />
                                <AvatarFallback className="bg-slate-100 text-slate-400 text-3xl font-black rounded-3xl">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            {profile.isOnline && (
                                <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white shadow-md animate-pulse" />
                            )}
                        </div>

                        {/* Text Infos */}
                        <div className="flex-1 text-center md:text-left pb-1">
                            <div className="flex items-center gap-2.5 justify-center md:justify-start flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                    {profile.name}
                                </h1>
                                {profile.verified && (
                                    <div className="bg-blue-500/10 p-0.5 rounded-full shrink-0" title="Profil vérifié">
                                        <Shield className="h-4.5 w-4.5 text-blue-600 fill-blue-600/15" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-semibold text-slate-500 justify-center md:justify-start mt-2.5">
                                <span className="flex items-center gap-1.5 text-slate-700">
                                    <Briefcase className="h-4 w-4 text-[#022753]/70" />
                                    {profile.role}
                                </span>
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 hidden sm:inline" />
                                <span className="flex items-center gap-1.5 text-slate-700">
                                    <MapPin className="h-4 w-4 text-[#022753]/70" />
                                    {profile.location}
                                </span>
                            </div>
                        </div>

                        {/* CTA Actions */}
                        <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                            <Button
                                size="lg"
                                className="flex-1 md:flex-initial rounded-xl h-11 text-xs gap-2 font-extrabold bg-[#022753] hover:bg-[#022753]/95 shadow-md shadow-[#022753]/10 transition-all active:scale-95"
                                onClick={handleFollow}
                            >
                                <Users className="h-4 w-4" />
                                {isFollowed ? "Retirer" : "Suivre"}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex-1 md:flex-initial rounded-xl h-11 text-xs gap-2 font-extrabold border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                                asChild
                            >
                                <Link href={`/messages?contact=${profile.id}`}>
                                    <MessageCircle className="h-4 w-4 text-slate-600" />
                                    Message
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 2. Main Bento Grid Workspace */}
                <div className="mt-6 grid md:grid-cols-3 gap-6 items-start">
                    
                    {/* Bento Box 1: About & Bio (2/3 width) */}
                    <div className="md:col-span-2 bg-white border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[160px]">
                        <h2 className="text-xs font-black text-[#022753] uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                            <Award className="h-4 w-4 text-[#CE1126]" />
                            À propos de moi
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-line">
                            {profile.bio}
                        </p>
                    </div>

                    {/* Bento Box 2: Stats (1/3 width) */}
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h2 className="text-xs font-black text-[#022753] uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            Activité réseau
                        </h2>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 rounded-xl bg-slate-50/50">
                                <p className="text-xl font-extrabold text-[#022753]">{followersCount}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Abonnés</p>
                            </div>
                            <div className="text-center p-2 rounded-xl bg-slate-50/50">
                                <p className="text-xl font-extrabold text-[#022753]">{profile.following}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Suivis</p>
                            </div>
                            <div className="text-center p-2 rounded-xl bg-slate-50/50">
                                <p className="text-xl font-extrabold text-[#022753]">{profile.skills.length}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Skills</p>
                            </div>
                        </div>
                    </div>

                    {/* Bento Box 3: Contact & Links (1/3 width) */}
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
                        <h2 className="text-xs font-black text-[#022753] uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                            <Globe className="h-4 w-4 text-[#022753]/80" />
                            Coordonnées & Liens
                        </h2>
                        
                        <div className="space-y-3.5 text-xs">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Membre depuis</p>
                                    <p className="font-bold text-slate-800">{joinedDate}</p>
                                </div>
                            </div>
                            
                            {profile.email && (
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Adresse Email</p>
                                        <p className="font-bold text-slate-800 truncate">{profile.email}</p>
                                    </div>
                                </div>
                            )}

                            {profile.phone && (
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Téléphone</p>
                                        <p className="font-bold text-slate-800">{profile.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {profile.website && (
                            <Button asChild variant="outline" className="w-full h-10 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 hover:text-[#022753] gap-2 transition-all mt-2">
                                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                                    Visiter le site web <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Bento Box 4: Tabs Skills / Timeline (2/3 width) */}
                    <div className="md:col-span-2 bg-white border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <Tabs defaultValue="skills" className="w-full">
                            <TabsList className="bg-slate-100/70 border border-slate-200/30 w-full justify-start h-auto p-1.5 mb-6 gap-2 rounded-2xl">
                                <TabsTrigger 
                                    value="skills" 
                                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#022753] data-[state=active]:shadow-sm bg-transparent px-4 py-2 text-xs sm:text-sm font-bold text-slate-500 transition-all"
                                >
                                    Compétences
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="experience" 
                                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#022753] data-[state=active]:shadow-sm bg-transparent px-4 py-2 text-xs sm:text-sm font-bold text-slate-500 transition-all"
                                >
                                    Parcours professionnel
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="skills" className="animate-in fade-in duration-300 focus-visible:outline-none">
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.length > 0 ? (
                                        profile.skills.map((skill, idx) => (
                                            <Badge 
                                                key={idx} 
                                                variant="secondary" 
                                                className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold border border-slate-200/50 transition-all hover:-translate-y-0.5 cursor-default shadow-sm text-xs"
                                            >
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <div className="p-8 border border-dashed border-slate-200 text-center w-full rounded-2xl bg-slate-50/50">
                                            <p className="text-slate-400 font-medium italic text-xs">Aucune compétence listée</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="experience" className="animate-in fade-in duration-300 focus-visible:outline-none">
                                <div className="space-y-4">
                                    {profile.experiences && profile.experiences.length > 0 ? (
                                        <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6 py-2">
                                            {profile.experiences.map((exp, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#022753] flex items-center justify-center">
                                                        <div className="h-1 w-1 rounded-full bg-[#022753]" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-black text-slate-900">{exp.title}</h4>
                                                        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-0.5">{exp.company} &bull; {exp.period}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="relative border-l-2 border-slate-100 pl-6 ml-3 py-2">
                                            <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#022753] flex items-center justify-center">
                                                <div className="h-1 w-1 rounded-full bg-[#022753]" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-black text-slate-950">Membre actif de l&apos;écosystème</h4>
                                                <p className="text-[10px] font-bold text-[#CE1126] uppercase tracking-wider mt-1">Réseau EmiID</p>
                                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                                    Contribue activement au développement professionnel et aux opportunités de collaborations de la plateforme.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>

            {/* Share Dialog */}
            <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Partager ce profil 🚀</DialogTitle>
                        <DialogDescription className="text-xs">
                            Faites découvrir le profil de {profile?.name} à votre réseau.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {profile?.slug && (
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-[#022753] flex items-center gap-2">
                                    <Badge variant="outline" className="border-[#022753] text-[#022753] text-[9px] px-1.5 py-0.5 rounded-md">Recommandé</Badge>
                                    Lien personnalisé du profil
                                </span>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        readOnly 
                                        value={typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile.slug}` : ''} 
                                        className="h-11 bg-slate-50 border-slate-200 text-slate-600 font-medium font-mono text-xs focus-visible:ring-0 rounded-xl"
                                    />
                                    <Button 
                                        size="icon" 
                                        variant="outline" 
                                        className="h-11 w-11 rounded-xl shrink-0 border-slate-200"
                                        onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile.slug}` : '')}
                                    >
                                        {copiedLink === (typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile.slug}` : '') ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-slate-400">
                                Lien technique (ID) {profile?.slug && "(Alternatif)"}
                            </span>
                            <div className="flex items-center gap-2">
                                <Input 
                                    readOnly 
                                    value={typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.id}` : ''} 
                                    className="h-11 bg-slate-50 border-slate-200 text-slate-400 font-mono text-xs focus-visible:ring-0 rounded-xl"
                                />
                                <Button 
                                    size="icon" 
                                    variant="outline" 
                                    className="h-11 w-11 rounded-xl shrink-0 border-slate-200"
                                    onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.id}` : '')}
                                >
                                    {copiedLink === (typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.id}` : '') ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Partage rapide</span>
                            <div className="grid grid-cols-3 gap-3">
                                <Button 
                                    variant="outline" 
                                    className="h-11 rounded-xl border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/5 flex gap-1.5 text-xs font-bold transition-all active:scale-95"
                                    onClick={() => shareToWhatsApp(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.slug || profile?.id}` : '')}
                                >
                                    <img src="/svg/whatsapp-logo.svg" className="h-4 w-4 shrink-0" alt="WhatsApp" />
                                    WhatsApp
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-11 rounded-xl border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/5 flex gap-1.5 text-xs font-bold transition-all active:scale-95"
                                    onClick={() => shareToLinkedIn(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.slug || profile?.id}` : '')}
                                >
                                    <Linkedin className="h-4 w-4 text-[#0A66C2] shrink-0" />
                                    LinkedIn
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-11 rounded-xl border-slate-200 text-slate-900 hover:bg-slate-50 flex gap-1.5 text-xs font-bold transition-all active:scale-95"
                                    onClick={() => shareToTwitter(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.slug || profile?.id}` : '')}
                                >
                                    <Twitter className="h-4 w-4 text-slate-800 shrink-0" />
                                    X
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] animate-pulse">
            <div className="h-16 container max-w-5xl mx-auto px-4 flex items-center justify-between py-6">
                <div className="h-10 w-20 bg-slate-200 rounded-xl" />
                <div className="h-10 w-24 bg-slate-200 rounded-xl" />
            </div>
            
            <div className="container max-w-5xl mx-auto px-4">
                {/* Header Profile Box Skeleton */}
                <div className="bg-white border border-slate-200/50 rounded-[2rem] overflow-hidden shadow-sm">
                    <div className="h-44 sm:h-56 bg-slate-200" />
                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end -mt-12 sm:-mt-16 w-full">
                        <div className="h-28 w-28 sm:h-32 sm:w-32 bg-slate-200 rounded-3xl ring-4 ring-white" />
                        <div className="flex-1 space-y-3 w-full pb-1">
                            <div className="h-7 w-1/3 bg-slate-200 rounded-xl" />
                            <div className="h-5 w-1/4 bg-slate-200 rounded-lg" />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                            <div className="h-11 w-24 bg-slate-200 rounded-xl" />
                            <div className="h-11 w-24 bg-slate-200 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="mt-6 grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="h-40 bg-white border border-slate-200/50 rounded-[2rem] p-6" />
                        <div className="h-64 bg-white border border-slate-200/50 rounded-[2rem] p-6" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-32 bg-white border border-slate-200/50 rounded-[2rem] p-6" />
                        <div className="h-48 bg-white border border-slate-200/50 rounded-[2rem] p-6" />
                    </div>
                </div>
            </div>
        </div>
    )
}
