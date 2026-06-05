/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook pour la gestion des préférences de notifications
 * @created 2026-06-05
 */

"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface NotificationPreferences {
    id: string
    user_id: string
    email_enabled: boolean
    push_enabled: boolean
    notify_followers: boolean
    notify_views: boolean
    notify_messages: boolean
    notify_system: boolean
    email_frequency: 'instant' | 'daily' | 'weekly' | 'never'
    created_at: string
    updated_at: string
}

const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
    email_enabled: true,
    push_enabled: false,
    notify_followers: true,
    notify_views: true,
    notify_messages: true,
    notify_system: true,
    email_frequency: 'instant',
}

export function useNotificationPreferences() {
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = useMemo(() => createClient(), [])

    // Charger les préférences
    useEffect(() => {
        let isMounted = true

        const loadPreferences = async () => {
            setIsLoading(true)
            setError(null)

            const { data: { user } } = await supabase.auth.getUser()
            if (!isMounted) return

            if (!user) {
                setPreferences(null)
                setIsLoading(false)
                return
            }

            // Essayer de récupérer les préférences existantes
            const { data, error: fetchError } = await supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (!isMounted) return

            if (fetchError) {
                // Si pas de préférences, créer les valeurs par défaut
                if (fetchError.code === 'PGRST116') {
                    const { data: newData, error: insertError } = await supabase
                        .from('notification_preferences')
                        .insert({ user_id: user.id, ...DEFAULT_PREFERENCES })
                        .select()
                        .single()

                    if (!isMounted) return

                    if (insertError) {
                        setError(insertError.message)
                    } else {
                        setPreferences(newData)
                    }
                } else {
                    setError(fetchError.message)
                }
            } else {
                setPreferences(data)
            }

            setIsLoading(false)
        }

        void loadPreferences()

        return () => {
            isMounted = false
        }
    }, [supabase])

    // Mettre à jour une préférence
    const updatePreference = useCallback(async <K extends keyof Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>(
        key: K,
        value: NotificationPreferences[K]
    ): Promise<boolean> => {
        if (!preferences) return false

        setIsSaving(true)
        setError(null)

        const { error: updateError } = await supabase
            .from('notification_preferences')
            .update({ [key]: value, updated_at: new Date().toISOString() })
            .eq('id', preferences.id)

        if (updateError) {
            setError(updateError.message)
            setIsSaving(false)
            return false
        }

        setPreferences(prev => prev ? { ...prev, [key]: value } : null)
        setIsSaving(false)
        return true
    }, [preferences, supabase])

    // Mettre à jour plusieurs préférences d'un coup
    const updatePreferences = useCallback(async (
        updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
    ): Promise<boolean> => {
        if (!preferences) return false

        setIsSaving(true)
        setError(null)

        const { error: updateError } = await supabase
            .from('notification_preferences')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', preferences.id)

        if (updateError) {
            setError(updateError.message)
            setIsSaving(false)
            return false
        }

        setPreferences(prev => prev ? { ...prev, ...updates } : null)
        setIsSaving(false)
        return true
    }, [preferences, supabase])

    return {
        preferences,
        isLoading,
        isSaving,
        error,
        updatePreference,
        updatePreferences,
    }
}
