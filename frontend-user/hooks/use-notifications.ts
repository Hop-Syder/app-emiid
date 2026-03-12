/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook pour la gestion des notifications temps réel
 * @created 2026-03-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface Notification {
    id: string
    type: string
    title: string
    content: string
    link?: string
    is_read: boolean
    created_at: string
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        let userId: string | null = null

        const loadNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            userId = user.id

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (!error && data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
        }

        loadNotifications()

        // Realtime subscription
        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: userId ? `user_id=eq.${userId}` : undefined
                },
                (payload) => {
                    const newNotif = payload.new as Notification
                    setNotifications(prev => [newNotif, ...prev])
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    return { notifications, unreadCount, markAsRead }
}
