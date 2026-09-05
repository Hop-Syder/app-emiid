"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { isFollowingUser } from "@/lib/follows"

export interface ProfileData {
    id: string
    name: string
    role: string
    bio: string
    business_name?: string
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
    /** Vrai si le profil a un contact à montrer, même quand `email`/`phone` sont
     *  vides côté visiteur anonyme (H2 — la RPC ne divulgue jamais la valeur,
     *  seulement le fait qu'il y en a une). */
    hasContact?: boolean
    website?: string
    skills: string[]
    experiences: { title: string; company: string; period: string; current: boolean }[]
    services?: Array<{ title: string; price: number | null; description?: string }>
    opening_hours?: Array<{ day: number; open: string; close: string; closed: boolean }>
}

interface ProfileQueryResult {
    id: string
    user_id?: string | null
    first_name: string | null
    last_name: string | null
    bio: string | null
    business_name: string | null
    district: string | null
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
    has_contact?: boolean | null
    website: string | null
    role: string | null
    services?: Array<{ title: string; price: number | null; description?: string }> | null
    opening_hours?: Array<{ day: number; open: string; close: string; closed: boolean }> | null
    countries: { name: string } | { name: string }[] | null
    profile_tags: Array<{
        tags: { name: string | null } | null
    }> | null
}

export type GalleryItem = {
    id: string
    title: string
    description: string
    imageUrl: string
    status?: string
    projectUrl?: string | null
    driveUrl?: string | null
}

export function useProfileData(profileId: string) {
    const router = useRouter()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFollowed, setIsFollowed] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [joinedDate, setJoinedDate] = useState<string>("...")
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [gallery, setGallery] = useState<GalleryItem[]>([])
    const [loadingGallery, setLoadingGallery] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            setIsLoggedIn(!!session)
        }
        checkAuth()
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) return
            setLoading(true)
            try {
                const supabase = createClient()
                await supabase.auth.getSession()

                const cleanProfileId = profileId.toLowerCase()
                const isUUID =
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanProfileId)

                let data: ProfileQueryResult | null = null
                let error: unknown = null

                // eslint-disable-next-line no-restricted-syntax -- tentative authentifiée (SON profil) ; fallback RPC get_public_profile pour l'anonyme/cross-user
                let query = supabase
                    .from("user_profiles")
                    .select("id, user_id, first_name, last_name, bio, business_name, district, city, avatar_url, cover_url, specialty, category, slug, is_published, is_verified, is_premium, followers_count, created_at, website, role, services, opening_hours, countries(name), profile_tags(tags(name))")

                if (isUUID) {
                    query = query.or(`slug.eq.${cleanProfileId},user_id.eq.${cleanProfileId},id.eq.${cleanProfileId}`)
                } else {
                    query = query.eq("slug", cleanProfileId)
                }

                const res = await query.single()
                data = res.data as unknown as ProfileQueryResult
                error = res.error

                if (error) {
                    console.warn("[useProfileData] Échec user_profiles, tentative public_profiles...", (error as { message?: string }).message)
                }

                if (error || !data) {
                    // public_profiles n'expose plus email/phone (cf. migration H1 :
                    // anti-énumération en masse). On récupère le profil public complet
                    // — contact inclus — via la fonction get_public_profile, qui ne
                    // renvoie qu'UN profil publié à la fois.
                    const publicRes = await supabase.rpc("get_public_profile", { identifier: cleanProfileId })

                    if (publicRes.data && !publicRes.error) {
                        data = publicRes.data as unknown as ProfileQueryResult
                        error = null
                    } else if (!publicRes.error) {
                        // Aucun profil publié pour cet identifiant → traité comme "introuvable".
                        error = { code: "PGRST116" }
                    } else {
                        console.error("[useProfileData] Échec final:", publicRes.error)
                        error = publicRes.error || error
                    }
                }

                if (data && !error) {
                    // Contact (email / téléphone) : jamais lu en direct sur user_profiles
                    // (le rôle authenticated n'a plus ces colonnes). Il est toujours servi
                    // par la RPC get_public_profile, qui applique l'opt-in show_contact et
                    // ne renvoie le contact qu'aux visiteurs authentifiés. Sur le chemin
                    // « fallback RPC », data.has_contact est déjà défini → on ne rappelle pas.
                    if (data.has_contact === undefined) {
                        const contactRes = await supabase.rpc("get_public_profile", { identifier: cleanProfileId })
                        const contact = contactRes.data as unknown as ProfileQueryResult | null
                        if (contact && !contactRes.error) {
                            data.email = contact.email
                            data.phone = contact.phone
                            data.has_contact = contact.has_contact
                        }
                    }

                    const countriesData = data.countries
                    const countryName = countriesData
                        ? (Array.isArray(countriesData) ? countriesData[0]?.name : countriesData.name)
                        : ""

                    const resolvedUserId = data.user_id || data.id

                    // Tracking de vue : enregistre une visite (fire-and-forget) si le
                    // visiteur n'est pas le propriétaire. Alimente les stats d'impact.
                    void (async () => {
                        try {
                            const { data: { user: viewer } } = await supabase.auth.getUser()
                            if (viewer?.id === resolvedUserId) return // pas d'auto-vue
                            await supabase.from("profile_views").insert({
                                profile_id: resolvedUserId,
                                viewer_id: viewer?.id ?? null,
                            })
                        } catch { /* silencieux : le tracking ne doit jamais casser l'affichage */ }
                    })()

                    setLoadingGallery(true)
                    const [followsRes, galleryRes, isFollowedRes] = await Promise.all([
                        supabase
                            .from("user_follows")
                            .select("*", { count: "exact", head: true })
                            .eq("follower_id", resolvedUserId),

                        supabase
                            .from("project_gallery")
                            .select("id, title, description, image_url, project_url, drive_url")
                            .eq("profile_id", data.id)
                            .order("order_index", { ascending: true }),

                        // Statut de suivi : requête directe sur la table de liaison (RLS
                        // "Follows Read" : le follower voit ses propres lignes). Fiabilise
                        // l'état au F5 et évite un aller-retour HTTP vers le backend.
                        isFollowingUser(resolvedUserId),
                    ])

                    const followingCountVal = !followsRes.error && followsRes.count !== null ? followsRes.count : 0

                    if (!galleryRes.error && galleryRes.data) {
                        setGallery(
                            galleryRes.data.map((item) => ({
                                id: item.id,
                                title: item.title || "",
                                description: item.description || "",
                                imageUrl: item.image_url,
                                projectUrl: item.project_url || null,
                                driveUrl: item.drive_url || null,
                            }))
                        )
                    }
                    setLoadingGallery(false)
                    setIsFollowed(isFollowedRes)

                    const mappedProfile: ProfileData = {
                        id: resolvedUserId,
                        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Utilisateur EmiID",
                        role: data.role || "Membre EmiID",
                        bio: data.bio || "Ce membre n'a pas encore rédigé sa biographie professionnelle.",
                        business_name: data.business_name || undefined,
                        location: [data.district, data.city, countryName].filter(Boolean).join(", ") || "Afrique",
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
                        hasContact: data.has_contact ?? !!(data.email || data.phone),
                        skills:
                            data.profile_tags
                                ?.map((pt) => pt.tags?.name)
                                .filter((name): name is string => typeof name === "string" && name.trim().length > 0) || [],
                        experiences: [],
                        services: Array.isArray(data.services) ? data.services : [],
                        opening_hours: Array.isArray(data.opening_hours) ? data.opening_hours : [],
                    }

                    setProfile(mappedProfile)
                    setFollowersCount(mappedProfile.followers)
                    setJoinedDate(mappedProfile.joinedDate)
                } else if ((error as { code?: string })?.code === "PGRST116") {
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
                const { data: { user } } = await supabase.auth.getUser()
                setCurrentUserId(user?.id ?? null)
                setIsOwnProfile(!!user && user.id === profile.id)
            } catch (e) {
                console.error("Erreur check user:", e)
            }
        }
        checkCurrentUser()
    }, [profile])

    useEffect(() => {
        if (profile && profile.slug && profileId !== profile.slug) {
            router.replace(`/profil/${profile.slug}`)
        }
    }, [profile, profileId, router])

    return {
        profile, setProfile,
        loading,
        isFollowed, setIsFollowed,
        followersCount, setFollowersCount,
        joinedDate,
        isOwnProfile,
        isLoggedIn,
        gallery,
        loadingGallery,
        currentUserId,
    }
}
