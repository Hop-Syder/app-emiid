/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant UI/UX de détail de profil utilisateur pour EmiID. Version premium et optimisée avec des transitions fluides, une mise en page asymétrique et une gestion intelligente de l'espace.
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
    Twitter
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

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
                toast.success(data.followed ? "Ajouté à votre portfolio" : "Retiré de votre portfolio")
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
        toast.success("Lien copié !", { description: "Prêt à être collé sur vos réseaux." })
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
                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mb-2 shadow-sm">
                    <Users className="h-10 w-10 text-slate-400" />
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Profil introuvable</h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Ce compte n&apos;existe pas ou a été restreint par la modération.</p>
                </div>
                <Button onClick={() => router.push('/annuaire')} size="lg" className="rounded-2xl gap-2 font-bold bg-[#022753] hover:bg-[#022753]/95 shadow-lg shadow-[#022753]/20 transition-all active:scale-95">
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l&apos;annuaire
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAFAF9]">
            {/* Header Sticky Glassmorphism */}
            <div className={cn(
                "sticky top-0 z-50 transition-all duration-300 border-b",
                scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-slate-100 py-3" : "bg-transparent border-transparent py-5"
            )}>
                <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 rounded-xl bg-white hover:bg-slate-50 shadow-sm border border-slate-100/80 transition-all active:scale-95"
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                        <span className="font-bold text-slate-700">Retour</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Partager ce profil" className="rounded-xl bg-white hover:bg-slate-50 shadow-sm border border-slate-100/80 h-10 w-10 transition-all active:scale-95">
                            <Share2 className="h-4.5 w-4.5 text-slate-600" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Plus d'options" className="rounded-xl bg-white hover:bg-slate-50 shadow-sm border border-slate-100/80 h-10 w-10 transition-all active:scale-95">
                                    <MoreHorizontal className="h-4.5 w-4.5 text-slate-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-slate-100 w-48 p-1">
                                <DropdownMenuItem className="rounded-lg font-medium py-2 cursor-pointer hover:bg-slate-50">Signaler</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg font-medium py-2 text-red-600 cursor-pointer hover:bg-red-50">Bloquer</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <main className="container max-w-5xl mx-auto px-4 pb-24">
                {/* Profile Hero & Header Section */}
                <div className="relative mt-2">
                    {/* Cover Banner Premium */}
                    <div className="h-48 sm:h-64 rounded-3xl overflow-hidden relative group shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#022753] via-[#022753]/95 to-[#CE1126]/30 flex items-center justify-center">
                            {/* Subtles dots patterns */}
                            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                            {!profile.coverImage && (
                                <img src="/logo/logo-1.png" alt="EmiID" className="h-14 opacity-[0.08] grayscale transition-transform duration-700 group-hover:scale-105" />
                            )}
                        </div>
                        {profile.coverImage && (
                            <img 
                                src={getOptimizedImageUrl(profile.coverImage, { width: 1200, height: 400, quality: 90 })} 
                                alt="Cover" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103" 
                            />
                        )}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            {profile.premium && (
                                <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 border-0 gap-1.5 px-3 py-1 rounded-full shadow-md font-bold text-[10px] uppercase tracking-wider">
                                    <Star className="h-3 w-3 fill-slate-900 text-slate-900" />
                                    Premium
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Integrated Profile Info Block */}
                    <div className="px-4 sm:px-8 -mt-16 sm:-mt-20 relative z-10">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-end text-center md:text-left">
                            {/* Avatar Wrapper with subtle shadow and border */}
                            <div className="relative group shrink-0">
                                <div className={cn(
                                    "absolute -inset-1 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-300",
                                    profile.premium ? "from-amber-400 to-yellow-500" : "from-[#022753] to-red-500"
                                )} />
                                <Avatar className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl ring-4 ring-white shadow-lg relative">
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

                            {/* Identity Summary Info */}
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                                        {profile.name}
                                    </h1>
                                    {profile.verified && (
                                        <div className="bg-blue-500/10 p-1 rounded-full shrink-0">
                                            <Shield className="h-4.5 w-4.5 text-blue-500 fill-blue-500/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm font-semibold text-slate-500 justify-center md:justify-start mt-2">
                                    <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                                        <Briefcase className="h-3.5 w-3.5 text-[#022753]" />
                                        {profile.role}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                                        <MapPin className="h-3.5 w-3.5 text-[#022753]" />
                                        {profile.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Asymmetrical Section Grid */}
                <div className="mt-8 grid lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left & Center: Professional Journey & Skills (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Bio / Description directly styled without heavy card */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#CE1126]" />
                                À propos
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-line">
                                {profile.bio}
                            </p>
                        </div>

                        {/* Custom Tabs for Skills & Journey */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <Tabs defaultValue="skills" className="w-full">
                                <TabsList className="bg-slate-50 border border-slate-100/60 w-full justify-start h-auto p-1.5 mb-6 gap-2 rounded-2xl">
                                    <TabsTrigger 
                                        value="skills" 
                                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm bg-transparent px-4 py-2 text-sm font-bold text-slate-500 transition-all"
                                    >
                                        Compétences
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="experience" 
                                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm bg-transparent px-4 py-2 text-sm font-bold text-slate-500 transition-all"
                                    >
                                        Parcours & Activité
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="skills" className="animate-in fade-in duration-300 focus-visible:outline-none">
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.length > 0 ? (
                                            profile.skills.map((skill, idx) => (
                                                <Badge 
                                                    key={idx} 
                                                    variant="secondary" 
                                                    className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-100/80 transition-all hover:-translate-y-0.5 cursor-default shadow-sm"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <div className="p-8 border border-dashed border-slate-200 text-center w-full rounded-2xl bg-slate-50/50">
                                                <p className="text-slate-400 font-medium italic text-sm">Aucune compétence listée</p>
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
                                                        {/* Timeline bullet */}
                                                        <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-white border-2 border-[#022753] flex items-center justify-center">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-[#022753]" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-slate-900">{exp.title}</h4>
                                                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{exp.company} &bull; {exp.period}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="relative border-l-2 border-slate-100 pl-6 ml-3 py-2">
                                                <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-white border-2 border-[#022753] flex items-center justify-center">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-[#022753]" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900">Membre actif de l&apos;écosystème</h4>
                                                    <p className="text-xs font-semibold text-[#022753] uppercase tracking-wider mt-1">Réseau EmiID</p>
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

                    {/* Right: Contact, Actions & Stats (1/3) */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Compact Action Panel Card */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                            
                            {/* Stats inline wrapper */}
                            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-50">
                                <div className="text-center">
                                    <p className="text-xl font-black text-slate-900">{followersCount}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Followers</p>
                                </div>
                                <div className="text-center border-x border-slate-100">
                                    <p className="text-xl font-black text-slate-900">{profile.following}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Relations</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-slate-900">{profile.skills.length}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Compétences</p>
                                </div>
                            </div>

                            {/* Main CTA Actions */}
                            <div className="space-y-3 pt-2">
                                <Button
                                    size="lg"
                                    className="w-full rounded-2xl h-11 text-sm gap-2 font-bold bg-[#022753] hover:bg-[#022753]/90 shadow-md shadow-[#022753]/10 transition-all active:scale-98"
                                    onClick={handleFollow}
                                >
                                    <Users className="h-4.5 w-4.5" />
                                    {isFollowed ? "Retirer du Portfolio" : "Ajouter au Portfolio"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full rounded-2xl h-11 text-sm gap-2 font-bold border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98"
                                    asChild
                                >
                                    <Link href={`/messages?contact=${profile.id}`}>
                                        <MessageCircle className="h-4.5 w-4.5 text-slate-600" />
                                        Envoyer un Message
                                    </Link>
                                </Button>
                            </div>

                            {/* Profile details / Metadata list */}
                            <div className="space-y-3 pt-3 border-t border-slate-50 text-xs">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span className="font-semibold text-slate-400">Membre depuis</span>
                                    <span className="font-bold text-slate-800">{joinedDate}</span>
                                </div>
                                {profile.specialty && (
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="font-semibold text-slate-400">Secteur</span>
                                        <span className="font-bold text-slate-800">{profile.specialty}</span>
                                    </div>
                                )}
                                {profile.email && (
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="font-semibold text-slate-400">Email</span>
                                        <span className="font-bold text-slate-800 truncate max-w-[150px]">{profile.email}</span>
                                    </div>
                                )}
                                {profile.phone && (
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="font-semibold text-slate-400">Téléphone</span>
                                        <span className="font-bold text-slate-800">{profile.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Website Button if available */}
                            {profile.website && (
                                <Button asChild variant="outline" className="w-full h-10 rounded-xl text-xs font-bold border-slate-100 hover:bg-slate-50 hover:text-[#022753] gap-2 transition-all">
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                                        Visiter le site web <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Partager ce profil 🚀</DialogTitle>
                        <DialogDescription>
                            Faites découvrir le profil de {profile?.name} à votre réseau.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {profile?.slug && (
                            <div className="space-y-2">
                                <span className="text-sm font-semibold text-primary flex items-center gap-2">
                                    <Badge variant="outline" className="border-primary text-primary text-[10px]">Recommandé</Badge>
                                    Lien personnalisé du profil
                                </span>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        readOnly 
                                        value={typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile.slug}` : ''} 
                                        className="h-12 bg-slate-50 border-slate-200 text-slate-600 font-medium font-mono text-xs focus-visible:ring-0"
                                    />
                                    <Button 
                                        size="icon" 
                                        variant="outline" 
                                        className="h-12 w-12 rounded-xl shrink-0"
                                        onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile.slug}` : '')}
                                    >
                                        {copiedLink === (typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile.slug}` : '') ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <span className="text-sm font-semibold text-slate-500">
                                Lien technique (ID) {profile?.slug && "(Alternatif)"}
                            </span>
                            <div className="flex items-center gap-2">
                                <Input 
                                    readOnly 
                                    value={typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.id}` : ''} 
                                    className="h-12 bg-slate-50 border-slate-200 text-slate-400 font-mono text-xs focus-visible:ring-0"
                                />
                                <Button 
                                    size="icon" 
                                    variant="outline" 
                                    className="h-12 w-12 rounded-xl shrink-0 border-slate-200"
                                    onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.id}` : '')}
                                >
                                    {copiedLink === (typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.id}` : '') ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Partage rapide</span>
                            <div className="grid grid-cols-3 gap-3">
                                <Button 
                                    variant="outline" 
                                    className="h-12 rounded-xl border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 flex gap-2"
                                    onClick={() => shareToWhatsApp(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.slug || profile?.id}` : '')}
                                >
                                    <img src="/svg/whatsapp-logo.svg" className="h-4 w-4" alt="WhatsApp" />
                                    WhatsApp
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-12 rounded-xl border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/10 flex gap-2"
                                    onClick={() => shareToLinkedIn(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.slug || profile?.id}` : '')}
                                >
                                    <Linkedin className="h-4 w-4" />
                                    LinkedIn
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-12 rounded-xl border-slate-900 text-slate-900 hover:bg-slate-100 flex gap-2"
                                    onClick={() => shareToTwitter(typeof window !== 'undefined' ? `${window.location.origin}/profil/${profile?.slug || profile?.id}` : '')}
                                >
                                    <Twitter className="h-4 w-4" />
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
        <div className="min-h-screen bg-[#FAFAF9] animate-pulse">
            <div className="h-16 container max-w-5xl mx-auto px-4 flex items-center justify-between py-6">
                <div className="h-10 w-24 bg-slate-200 rounded-xl" />
                <div className="h-10 w-20 bg-slate-200 rounded-xl" />
            </div>
            <div className="container max-w-5xl mx-auto px-4 mt-2">
                <div className="h-48 sm:h-64 w-full bg-slate-200 rounded-3xl" />
                <div className="px-8 -mt-16 sm:-mt-20 flex flex-col md:flex-row gap-6 items-center md:items-end w-full">
                    <div className="h-28 w-28 sm:h-36 sm:w-36 bg-slate-200 rounded-3xl ring-4 ring-white" />
                    <div className="flex-1 space-y-3 w-full pb-2">
                        <div className="h-8 w-1/3 bg-slate-200 rounded-xl" />
                        <div className="h-5 w-1/4 bg-slate-200 rounded-lg" />
                    </div>
                </div>
                
                <div className="mt-8 grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-40 bg-white border border-slate-100 rounded-3xl p-6" />
                        <div className="h-64 bg-white border border-slate-100 rounded-3xl p-6" />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="h-80 bg-white border border-slate-100 rounded-3xl p-6" />
                    </div>
                </div>
            </div>
        </div>
    )
}
