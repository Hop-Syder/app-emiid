"use client"

import { useState, useEffect } from "react"
import { 
    ArrowLeft, 
    Shield, 
    MapPin, 
    Users, 
    MessageCircle, 
    Share2, 
    Globe,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    Star,
    ExternalLink,
    MoreHorizontal
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPublic, fetchWithAuth } from "@/lib/apiClient"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProjectShowcase } from "./project-showcase"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock profile data
const mockProfiles: Record<string, ProfileData> = {
    "1": {
        id: "1",
        name: "Amara Diallo",
        role: "Entrepreneur Tech",
        bio: "Passionnee par l'innovation technologique en Afrique. Fondatrice de plusieurs startups dans le domaine de la FinTech. Je crois fermement que la technologie peut transformer notre continent.",
        location: "Dakar, Senegal",
        avatar: "/african-woman-entrepreneur.jpg",
        coverImage: "/cover-tech.jpg",
        specialty: "FinTech",
        category: "Technologie",
        verified: true,
        premium: true,
        followers: 2340,
        following: 180,
        projects: 12,
        isOnline: true,
        isFollowed: false,
        joinedDate: "Janvier 2023",
        email: "amara@example.com",
        phone: "+221 77 123 4567",
        website: "https://amaradiallo.com",
        skills: ["React", "Node.js", "Finance", "Leadership", "Product Management"],
        experiences: [
            { title: "CEO & Fondatrice", company: "PayAfrik", period: "2021 - Present", current: true },
            { title: "Product Manager", company: "Orange Money", period: "2019 - 2021", current: false },
            { title: "Developpeur Full Stack", company: "Sonatel", period: "2017 - 2019", current: false },
        ],
        portfolio: [
            { title: "PayAfrik App", description: "Application de paiement mobile", image: "/project-1.jpg" },
            { title: "AgriConnect", description: "Plateforme pour agriculteurs", image: "/project-2.jpg" },
            { title: "EduTech Senegal", description: "E-learning pour etudiants", image: "/project-3.jpg" },
        ]
    },
    "2": {
        id: "2",
        name: "Kofi Mensah",
        role: "Developpeur Senior",
        bio: "Expert en intelligence artificielle et machine learning. Plus de 10 ans d'experience dans le developpement de solutions innovantes pour l'Afrique de l'Ouest.",
        location: "Accra, Ghana",
        avatar: "/african-man-developer.jpg",
        coverImage: "/cover-dev.jpg",
        specialty: "Intelligence Artificielle",
        category: "Developpement",
        verified: true,
        premium: true,
        followers: 1890,
        following: 245,
        projects: 28,
        isOnline: false,
        isFollowed: true,
        joinedDate: "Mars 2022",
        email: "kofi@example.com",
        website: "https://kofimensah.dev",
        skills: ["Python", "TensorFlow", "PyTorch", "Data Science", "Cloud Computing"],
        experiences: [
            { title: "Lead AI Engineer", company: "AfroAI Labs", period: "2022 - Present", current: true },
            { title: "Senior Developer", company: "MTN Ghana", period: "2018 - 2022", current: false },
        ],
        portfolio: [
            { title: "AfroVision AI", description: "Reconnaissance d'images", image: "/project-4.jpg" },
            { title: "ChatBot Ghana", description: "Assistant virtuel intelligent", image: "/project-5.jpg" },
        ]
    },
    "3": {
        id: "3",
        name: "Fatou Sow",
        role: "CEO & Fondatrice",
        bio: "Entrepreneure dans le e-commerce depuis 2018. Ma mission est de connecter les artisans africains aux marches internationaux.",
        location: "Abidjan, Cote d'Ivoire",
        avatar: "/african-woman-ceo.jpg",
        coverImage: "/cover-ecommerce.jpg",
        specialty: "E-commerce",
        category: "Commerce",
        verified: true,
        premium: true,
        followers: 4560,
        following: 320,
        projects: 8,
        isOnline: true,
        isFollowed: false,
        joinedDate: "Juin 2022",
        email: "fatou@example.com",
        website: "https://afrimarket.ci",
        skills: ["E-commerce", "Marketing Digital", "Gestion d'equipe", "Logistique", "Relations clients"],
        experiences: [
            { title: "CEO", company: "AfriMarket", period: "2020 - Present", current: true },
            { title: "Directrice Marketing", company: "Jumia CI", period: "2018 - 2020", current: false },
        ],
        portfolio: [
            { title: "AfriMarket", description: "Marketplace panafricaine", image: "/project-6.jpg" },
        ]
    }
}

// Default profile for unknown IDs
const defaultProfile: ProfileData = {
    id: "default",
    name: "Utilisateur Nexus",
    role: "Membre",
    bio: "Membre de la communaute Nexus Connect.",
    location: "Afrique",
    avatar: "",
    specialty: "General",
    verified: false,
    premium: false,
    followers: 0,
    following: 0,
    projects: 0,
    isOnline: false,
    isFollowed: false,
    joinedDate: "2024",
    skills: [],
    experiences: [],
    portfolio: []
}

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
    verified: boolean
    premium: boolean
    followers: number
    following: number
    projects: number
    isOnline: boolean
    isFollowed: boolean
    joinedDate: string
    email?: string
    phone?: string
    website?: string
    skills: string[]
    experiences: { title: string; company: string; period: string; current: boolean }[]
    portfolio: { title: string; description: string; image: string }[]
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

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 100)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) return
            setLoading(true)
            try {
                const response = await fetchPublic(`/api/public/profiles/${profileId}`)
                if (response.ok) {
                    const data = await response.json()
                    const mappedProfile: ProfileData = {
                        id: data.user_id || data.id,
                        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Utilisateur Nexus",
                        role: data.role || "Membre Nexus",
                        bio: data.bio || "Ce membre n'a pas encore rédigé sa biographie professionnelle.",
                        location: data.city ? `${data.city}, ${data.countries?.name || ""}` : (data.countries?.name || "Afrique"),
                        avatar: data.avatar_url || "/african-user.jpg",
                        coverImage: data.cover_url || undefined,
                        specialty: data.specialty || "Expertise",
                        category: data.category || "",
                        verified: !!data.is_verified,
                        premium: !!data.is_premium,
                        followers: data.followers_count || 0,
                        following: data.following_count || 0,
                        projects: data.projects_count || 0,
                        isOnline: false,
                        isFollowed: false, 
                        joinedDate: data.created_at ? new Date(data.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "2024",
                        email: data.email,
                        website: data.website,
                        phone: data.phone,
                        skills: data.tags || [],
                        experiences: [], 
                        portfolio: [] 
                    }
                    setProfile(mappedProfile)
                    setFollowersCount(mappedProfile.followers)

                    // Vérifier si l'utilisateur actuel suit ce profil
                    try {
                        const followRes = await fetchWithAuth("/api/users/follows")
                        if (followRes.ok) {
                            const follows = await followRes.json()
                            const alreadyFollowed = follows.some((f: any) => f.user_id === mappedProfile.id)
                            setIsFollowed(alreadyFollowed)
                        }
                    } catch (e) {
                        // Pas connecté ou erreur silencieuse
                    }
                } else if (response.status === 404) {
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
                toast.success(data.followed ? "Abonnement effectué" : "Désabonné avec succès")
            } else {
                toast.error("Veuillez vous connecter pour suivre ce membre")
            }
        } catch (e) {
            toast.error("Erreur de connexion")
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("Lien copié !", { description: "Le lien du profil est dans votre presse-papiers." })
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
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <Users className="h-16 w-16 text-slate-300" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">Profil Introuvable</h2>
                    <p className="text-slate-500 max-w-xs mx-auto">Ce compte n'existe pas ou a été désactivé par l'administrateur.</p>
                </div>
                <Button onClick={() => router.push('/annuaire')} size="lg" className="rounded-2xl gap-2 font-bold bg-[#022753]">
                    <ArrowLeft className="h-5 w-5" />
                    Retour à l'annuaire
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDFCF9]">
            {/* Header Glassmorphism */}
            <div className={cn(
                "sticky top-0 z-50 transition-all duration-500 border-b",
                scrolled ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/40 py-2" : "bg-transparent border-transparent py-4"
            )}>
                <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.back()}
                        className="gap-2 rounded-xl bg-white/50 hover:bg-white shadow-sm border border-slate-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-bold text-slate-700">Retour</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-xl bg-white/50 hover:bg-white shadow-sm border border-slate-100 h-10 w-10">
                            <Share2 className="h-4.5 w-4.5 text-slate-600" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl bg-white/50 hover:bg-white shadow-sm border border-slate-100 h-10 w-10">
                                    <MoreHorizontal className="h-4.5 w-4.5 text-slate-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-slate-100 w-48 p-1">
                                <DropdownMenuItem className="rounded-lg font-medium py-2">Signaler</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg font-medium py-2 text-red-600">Bloquer</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <main className="container max-w-5xl mx-auto px-4 pb-20">
                {/* Profile Hero Section */}
                <div className="relative mt-2">
                    {/* Cover Banner */}
                    <div className="h-44 sm:h-72 rounded-[2.5rem] overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#022753] via-[#022753]/90 to-[#CE1126]/40 flex items-center justify-center">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                            {!profile.coverImage && (
                                <img src="/logo/logo-1.png" alt="Nexus" className="h-16 opacity-10 grayscale group-hover:scale-110 transition-transform duration-700" />
                            )}
                        </div>
                        {profile.coverImage && (
                            <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        )}
                        <div className="absolute top-6 right-6 flex items-center gap-2">
                            {profile.premium && (
                                <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 gap-1.5 px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/20 font-black text-xs uppercase tracking-wider">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    Membre Premium
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Profile Header Card */}
                    <div className="max-w-[calc(100%-2rem)] sm:max-w-4xl mx-auto -mt-24 sm:-mt-28 relative z-10">
                        <div className="bg-white/80 backdrop-blur-2xl border border-white p-6 sm:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50">
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                {/* Avatar with Glow */}
                                <div className="relative group">
                                    <div className={cn(
                                        "absolute -inset-2 bg-gradient-to-br rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500",
                                        profile.premium ? "from-amber-400 to-yellow-500" : "from-primary to-accent"
                                    )} />
                                    <Avatar className="h-32 w-32 sm:h-40 sm:w-40 ring-4 ring-white shadow-2xl relative">
                                        <AvatarImage src={profile.avatar || "/african-user.jpg"} alt={profile.name} className="object-cover" />
                                        <AvatarFallback className="bg-slate-100 text-slate-400 text-4xl font-black">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    {profile.isOnline && (
                                        <div className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-emerald-500 border-4 border-white shadow-lg animate-pulse" />
                                    )}
                                </div>

                                {/* Identity Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-none">
                                                {profile.name}
                                            </h1>
                                            {profile.verified && (
                                                <div className="bg-blue-500/10 p-1.5 rounded-full">
                                                    <Shield className="h-6 w-6 text-blue-500 fill-blue-500/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:text-base font-bold text-slate-500 justify-center md:justify-start">
                                            <span className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-primary" />
                                                {profile.role}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                {profile.location}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Actions Profile Page */}
                                    <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start pt-2">
                                        <Button 
                                            size="lg"
                                            className="rounded-2xl px-8 h-12 gap-3 font-bold bg-[#022753] hover:bg-[#022753]/90 shadow-xl shadow-[#022753]/20 transition-all hover:-translate-y-1 active:scale-95"
                                            onClick={handleFollow}
                                        >
                                            {isFollowed ? (
                                                <>Retirer du Portfolio</>
                                            ) : (
                                                <>
                                                    <Users className="h-5 w-5" />
                                                    Ajouter au Portfolio
                                                </>
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="lg"
                                            className="rounded-2xl h-12 px-8 gap-3 font-bold border-slate-200 hover:bg-slate-50 shadow-lg shadow-slate-200/50 transition-all hover:border-slate-300"
                                            asChild
                                        >
                                            <Link href={`/messages?contact=${profile.id}`}>
                                                <MessageCircle className="h-5 w-5" />
                                                Envoyer un Message
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid Dashboard Style */}
                            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-10 pt-8 border-t border-slate-100">
                                <div className="text-center group cursor-pointer hover:scale-105 transition-transform">
                                    <p className="text-2xl sm:text-3xl font-black text-slate-900">{followersCount.toLocaleString()}</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Followers</p>
                                </div>
                                <div className="text-center group cursor-pointer hover:scale-105 transition-transform border-x border-slate-100">
                                    <p className="text-2xl sm:text-3xl font-black text-slate-900">{profile.following.toLocaleString()}</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Relations</p>
                                </div>
                                <div className="text-center group cursor-pointer hover:scale-105 transition-transform">
                                    <p className="text-2xl sm:text-3xl font-black text-slate-900">{profile.projects}</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Projets</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Bio Card */}
                        <Card className="rounded-[2.5rem] border-0 shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-white px-8 py-6">
                                <CardTitle className="text-lg font-black text-slate-900">À propos</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {profile.bio}
                                </p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Membre depuis</p>
                                            <p className="text-sm font-bold text-slate-700">{profile.joinedDate}</p>
                                        </div>
                                    </div>
                                    {profile.email && (
                                        <div className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Email Contact</p>
                                                <p className="text-sm font-bold text-slate-700">{profile.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Speciality Badge */}
                        <Card className="rounded-[2.5rem] border-0 shadow-xl shadow-slate-200/40 bg-gradient-to-br from-[#022753] to-[#022753]/90 text-white overflow-hidden">
                            <CardContent className="p-8 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Secteur Principal</h3>
                                <div className="space-y-1">
                                    <p className="text-3xl font-black">{profile.specialty}</p>
                                    <p className="text-amber-400 font-bold opacity-80">{profile.category || 'Expert Nexus'}</p>
                                </div>
                                {profile.website && (
                                    <Button asChild variant="link" className="p-0 text-white hover:text-amber-400 mt-4 h-auto font-bold flex items-center gap-2">
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer">
                                            Visiter le site web <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Projects & Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="skills" className="w-full">
                            <TabsList className="bg-transparent border-b border-slate-100 w-full justify-start h-auto p-0 mb-6 gap-8 rounded-none">
                                <TabsTrigger value="skills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#CE1126] data-[state=active]:text-[#CE1126] bg-transparent shadow-none px-2 pb-4 font-black transition-all">Compétences</TabsTrigger>
                                <TabsTrigger value="portfolio" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#CE1126] data-[state=active]:text-[#CE1126] bg-transparent shadow-none px-2 pb-4 font-black transition-all text-slate-400 hover:text-slate-600">Projets & Réalisations</TabsTrigger>
                                <TabsTrigger value="experience" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#CE1126] data-[state=active]:text-[#CE1126] bg-transparent shadow-none px-2 pb-4 font-black transition-all text-slate-400 hover:text-slate-600">Parcours</TabsTrigger>
                            </TabsList>

                            <TabsContent value="skills" className="animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex flex-wrap gap-3">
                                    {profile.skills.length > 0 ? (
                                        profile.skills.map((skill, idx) => (
                                            <Badge key={idx} variant="secondary" className="px-5 py-2.5 rounded-2xl bg-white border border-slate-100 text-slate-700 font-bold hover:bg-slate-50 transition-all hover:scale-105 cursor-default shadow-sm hover:shadow-md">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center w-full">
                                            <p className="text-slate-400 font-bold italic">Aucune compétence listée</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="portfolio" className="animate-in fade-in slide-in-from-left-4 duration-500">
                                <ProjectShowcase userId={profileId} />
                            </TabsContent>

                            <TabsContent value="experience" className="animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="space-y-4">
                                    <Card className="rounded-[2rem] border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
                                        <CardContent className="p-8 flex items-center gap-6">
                                            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary font-black shrink-0">NC</div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900">Membre actif du Réseau</h4>
                                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Nexus Connect</p>
                                                <p className="text-xs text-slate-400 mt-2">Contribue à l'épanouissement technologique et économique de la sous-région.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-[#FDFCF9] animate-pulse">
            <div className="h-14 container max-w-5xl mx-auto px-4 flex items-center justify-between py-10">
                <div className="h-8 w-24 bg-slate-200 rounded-xl" />
                <div className="h-8 w-8 bg-slate-200 rounded-xl" />
            </div>
            <div className="container max-w-5xl mx-auto px-4 mt-2">
                <div className="h-44 sm:h-72 w-full bg-slate-200 rounded-[2.5rem]" />
                <div className="max-w-4xl mx-auto -mt-24 bg-white p-10 rounded-[3rem] shadow-xl">
                    <div className="flex gap-8 flex-col sm:flex-row items-center">
                        <div className="h-40 w-40 bg-slate-200 rounded-[2.5rem]" />
                        <div className="flex-1 space-y-4 w-full">
                            <div className="h-10 w-2/3 bg-slate-200 rounded-xl" />
                            <div className="h-6 w-1/2 bg-slate-200 rounded-xl" />
                            <div className="h-12 w-full bg-slate-200 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
