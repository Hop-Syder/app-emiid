"use client"

import { useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"

interface CurrentUserProfile {
    first_name: string
    last_name: string
    email?: string
    avatar_url?: string
}

function getSessionFallback(session: Session): CurrentUserProfile {
    return {
        first_name: session.user.user_metadata?.first_name || "",
        last_name: session.user.user_metadata?.last_name || "",
        email: session.user.email,
        avatar_url: session.user.user_metadata?.avatar_url || undefined,
    }
}

export function useCurrentUserProfile() {
    const supabase = useMemo(() => createClient(), [])
    const [session, setSession] = useState<Session | null>(null)
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
                    throw new Error(`Erreur HTTP ${response.status}`)
                }

                const data = await response.json()

                if (!isMounted) {
                    return
                }

                setCurrentUser({
                    first_name: data.first_name || fallbackProfile.first_name,
                    last_name: data.last_name || fallbackProfile.last_name,
                    email: data.email || fallbackProfile.email,
                    avatar_url: data.avatar_url || fallbackProfile.avatar_url,
                })
            } catch (error) {
                console.error("Erreur chargement profil connecté:", error)

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
