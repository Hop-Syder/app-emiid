/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook pour la gestion des notifications temps réel
 * @created 2026-03-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useMemo, useState } from "react"
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
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        let isMounted = true

        const loadNotifications = async () => {
            setIsLoading(true)
            setError(null)

            const { data: { user } } = await supabase.auth.getUser()
            if (!isMounted) {
                return
            }

            if (!user) {
                setUserId(null)
                setNotifications([])
                setUnreadCount(0)
                setIsLoading(false)
                return
            }

            setUserId(user.id)

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (!isMounted) {
                return
            }

            if (error) {
                setError(error.message)
                setNotifications([])
                setUnreadCount(0)
            } else {
                const nextNotifications = data || []
                setNotifications(nextNotifications)
                setUnreadCount(nextNotifications.filter((notification) => !notification.is_read).length)
            }

            setIsLoading(false)
        }

        void loadNotifications()

        return () => {
            isMounted = false
        }
    }, [supabase])

    useEffect(() => {
        if (!userId) {
            return
        }

        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotif = payload.new as Notification
                    setNotifications((prev) => {
                        if (prev.some((notification) => notification.id === newNotif.id)) {
                            return prev
                        }
                        return [newNotif, ...prev]
                    })
                    setUnreadCount((prev) => prev + (newNotif.is_read ? 0 : 1))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, userId])

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (!error) {
            const wasUnread = notifications.some((notification) => notification.id === id && !notification.is_read)
            setNotifications((prev) => prev.map((notification) =>
                notification.id === id ? { ...notification, is_read: true } : notification
            ))
            if (wasUnread) {
                setUnreadCount((prev) => Math.max(0, prev - 1))
            }
        }
    }

    const markAllAsRead = async () => {
        if (!userId) {
            return
        }

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (!error) {
            setNotifications((prev) => prev.map((notification) => ({
                ...notification,
                is_read: true
            })))
            setUnreadCount(0)
        }
    }

    const deleteNotification = async (id: string) => {
        const toDelete = notifications.find(n => n.id === id)
        const wasUnread = toDelete ? !toDelete.is_read : false

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        if (!error) {
            setNotifications((prev) => prev.filter((notification) => notification.id !== id))
            if (wasUnread) {
                setUnreadCount((prev) => Math.max(0, prev - 1))
            }
        }
    }

    return { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        isLoading,
        error,
    }
}
