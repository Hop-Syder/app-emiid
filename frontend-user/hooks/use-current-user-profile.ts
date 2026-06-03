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
                return
            }

            const fallbackProfile = getSessionFallback(nextSession)
            setCurrentUser(fallbackProfile)

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

                setCurrentUser({
                    first_name: data?.first_name || fallbackProfile.first_name,
                    last_name: data?.last_name || fallbackProfile.last_name,
                    email: data?.email || fallbackProfile.email,
                    avatar_url: finalAvatar,
                    slug: data?.slug,
                    is_published: data?.is_published,
                })
            } catch (error) {
                console.error("Erreur chargement profil connecté (Backend API):", error)

                if (isMounted) {
                    setCurrentUser(fallbackProfile)
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
