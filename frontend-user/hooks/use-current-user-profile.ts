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
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', nextSession.user.id)
                    .single()

                if (error) {
                    throw error
                }

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
                })
            } catch (error) {
                console.error("Erreur chargement profil connecté (Supabase):", error)

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
