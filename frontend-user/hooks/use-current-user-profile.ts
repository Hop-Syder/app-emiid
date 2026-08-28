/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé pour récupérer les informations de profil de l'utilisateur connecté via l'API backend
 * @created 2026-01-16
 * @updated 2026-06-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"

interface CurrentUserProfile {
    first_name: string
    last_name: string
    email?: string
    avatar_url?: string
    slug?: string
    is_published?: boolean
    has_profile?: boolean
}

function getSessionFallback(session: Session): CurrentUserProfile {
    const meta = session.user.user_metadata || {};
    return {
        first_name: meta.first_name || meta.full_name?.split(' ')[0] || "",
        last_name: meta.last_name || meta.full_name?.split(' ').slice(1).join(' ') || "",
        email: session.user.email,
        avatar_url: meta.avatar_url || meta.picture || undefined,
    }
}

// Cache du profil connecté (sessionStorage) → header/nav instantanés, sans flash.
const ME_SS_KEY = "emiid_me_v1"

function readMeCache(userId: string): CurrentUserProfile | null {
    if (typeof window === "undefined") return null
    try {
        const raw = sessionStorage.getItem(ME_SS_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as { userId: string; profile: CurrentUserProfile }
        return parsed.userId === userId ? parsed.profile : null
    } catch { return null }
}

function writeMeCache(userId: string, profile: CurrentUserProfile) {
    if (typeof window === "undefined") return
    try { sessionStorage.setItem(ME_SS_KEY, JSON.stringify({ userId, profile })) } catch { /* ignore */ }
}

function clearMeCache() {
    if (typeof window === "undefined") return
    try { sessionStorage.removeItem(ME_SS_KEY) } catch { /* ignore */ }
}

export function useCurrentUserProfile() {
    const supabase = useMemo(() => createClient(), [])
    const [session, setSession] = useState<Session | null | undefined>(undefined)
    const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null)

    useEffect(() => {
        let isMounted = true

        const syncUser = async (nextSession: Session | null) => {
            if (!isMounted) {
                return
            }

            setSession(nextSession)

            if (!nextSession) {
                setCurrentUser(null)
                clearMeCache()
                return
            }

            const fallbackProfile = getSessionFallback(nextSession)
            // Affichage instantané : cache complet s'il existe, sinon fallback session.
            const cached = readMeCache(nextSession.user.id)
            setCurrentUser(cached || fallbackProfile)

            try {
                const response = await fetchWithAuth("/api/users/me")

                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`)
                }

                const data = await response.json()

                if (!isMounted) {
                    return
                }

                const dbAvatar = data?.avatar_url;
                const finalAvatar = (dbAvatar && dbAvatar !== "/profil/avatar.jpg")
                    ? dbAvatar
                    : fallbackProfile.avatar_url;

                const enriched: CurrentUserProfile = {
                    first_name: data?.first_name || fallbackProfile.first_name,
                    last_name: data?.last_name || fallbackProfile.last_name,
                    email: data?.email || fallbackProfile.email,
                    avatar_url: finalAvatar,
                    slug: data?.slug,
                    is_published: data?.is_published,
                    has_profile: !!data?.has_profile,
                }
                setCurrentUser(enriched)
                writeMeCache(nextSession.user.id, enriched)
            } catch (error) {
                console.error("Erreur chargement profil connecté (Backend API):", error)

                if (isMounted) {
                    setCurrentUser(cached || fallbackProfile)
                }
            }
        }

        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            void syncUser(currentSession)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            void syncUser(nextSession)
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

    return { session, currentUser }
}
