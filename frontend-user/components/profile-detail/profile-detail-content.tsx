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
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

    useEffect(() => {
        // Simulate API fetch
        const fetchProfile = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/public/profiles/${profileId}`)
                if (response.ok) {
                    const data = await response.json()
                    const mappedProfile: ProfileData = {
                        id: data.user_id || data.id,
                        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Utilisateur Nexus",
                        role: data.role || "Membre Nexus",
                        bio: data.bio || "Aucune description fournie.",
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
                        isOnline: false, // Could be handled by extra logic later
                        isFollowed: false, // Handled below
                        joinedDate: new Date(data.created_at).toLocaleDateString(),
                        email: data.email,
                        website: data.website,
                        skills: data.tags || [],
                        experiences: [], // Need mapping if available in BDD later
                        portfolio: [] // Need mapping if available in BDD later
                    }
                    setProfile(mappedProfile)
                    setFollowersCount(mappedProfile.followers)
                }
            } catch (error) {
                console.error("Erreur chargement profil:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [profileId])

    const handleFollow = () => {
        setIsFollowed(!isFollowed)
        setFollowersCount(prev => isFollowed ? prev - 1 : prev + 1)
        toast.success(isFollowed ? "Retire du portefeuille" : "Ajoute au portefeuille")
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("Lien copie dans le presse-papiers")
    }

    const initials = profile?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'NA'

    if (loading) {
        return <ProfileSkeleton />
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-muted-foreground">Profil non trouve</p>
                <Button onClick={() => router.back()}>Retour</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header with back button */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
                <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Retour</span>
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Signaler le profil</DropdownMenuItem>
                                <DropdownMenuItem>Bloquer</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="container max-w-4xl mx-auto px-4 py-6">
                {/* Profile Header */}
                <div className="relative">
                    {/* Cover Image */}
                    <div className="h-32 sm:h-48 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 overflow-hidden">
                        {profile.coverImage && (
                            <img 
                                src={profile.coverImage} 
                                alt="Cover" 
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="absolute -bottom-12 left-4 sm:left-8">
                        <div className="relative">
                            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-background shadow-xl">
                                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            {profile.isOnline && (
                                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-background" />
                            )}
                        </div>
                    </div>

                    {/* Premium badge */}
                    {profile.premium && (
                        <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Premium
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="mt-16 sm:mt-14">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
                                {profile.verified && (
                                    <Shield className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <p className="text-muted-foreground">{profile.role}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {profile.location}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="rounded-full"
                                asChild
                            >
                                <Link href={`/messages?contact=${profile.id}`}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Message
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleFollow}
                                className={`rounded-full px-6 ${
                                    isFollowed 
                                        ? "bg-muted text-foreground hover:bg-muted/80" 
                                        : "bg-primary hover:bg-primary/90"
                                }`}
                            >
                                {isFollowed ? "Suivi" : "Suivre"}
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-6 py-4 border-y">
                        <div className="text-center">
                            <p className="text-xl font-bold">{followersCount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">{profile.following.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Suivis</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">{profile.projects}</p>
                            <p className="text-sm text-muted-foreground">Projets</p>
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="mt-4 text-foreground leading-relaxed">{profile.bio}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant="secondary" className="rounded-full">
                            {profile.specialty}
                        </Badge>
                        {profile.category && (
                            <Badge variant="outline" className="rounded-full">
                                {profile.category}
                            </Badge>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        {profile.website && (
                            <a 
                                href={profile.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                            >
                                <Globe className="h-4 w-4" />
                                Site web
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                        {profile.email && (
                            <a 
                                href={`mailto:${profile.email}`}
                                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <Mail className="h-4 w-4" />
                                {profile.email}
                            </a>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Membre depuis {profile.joinedDate}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="about" className="mt-8">
                    <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-6">
                        <TabsTrigger 
                            value="about"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
                        >
                            A propos
                        </TabsTrigger>
                        <TabsTrigger 
                            value="portfolio"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
                        >
                            Portfolio
                        </TabsTrigger>
                        <TabsTrigger 
                            value="experience"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
                        >
                            Experience
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="mt-6 space-y-6">
                        {/* Skills */}
                        {profile.skills.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Competences</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map((skill, index) => (
                                            <Badge 
                                                key={index} 
                                                variant="secondary"
                                                className="rounded-full px-3 py-1"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="portfolio" className="mt-6">
                        {profile.portfolio.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {profile.portfolio.map((project, index) => (
                                    <Card key={index} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                                        <div className="h-40 bg-muted relative overflow-hidden">
                                            {project.image && (
                                                <img 
                                                    src={project.image} 
                                                    alt={project.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <h3 className="font-semibold text-white">{project.title}</h3>
                                                <p className="text-sm text-white/80">{project.description}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                Aucun projet dans le portfolio
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="experience" className="mt-6">
                        {profile.experiences.length > 0 ? (
                            <div className="space-y-4">
                                {profile.experiences.map((exp, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Briefcase className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{exp.title}</h3>
                                                        {exp.current && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Actuel
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{exp.period}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                Aucune experience ajoutee
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-50 bg-background border-b">
                <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center">
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
            <div className="container max-w-4xl mx-auto px-4 py-6">
                <Skeleton className="h-48 rounded-xl" />
                <div className="mt-16 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <div className="flex gap-6 mt-6 py-4">
                        <Skeleton className="h-12 w-20" />
                        <Skeleton className="h-12 w-20" />
                        <Skeleton className="h-12 w-20" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </div>
    )
}
