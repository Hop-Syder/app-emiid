/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook pour la gestion des notifications temps réel avec pagination
 * @created 2026-03-12
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

const PAGE_SIZE = 15

export interface NotificationSender {
    id: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
    slug: string | null
}

export interface Notification {
    id: string
    type: string
    title: string
    content: string
    link?: string | null
    is_read: boolean
    created_at: string
    sender_id?: string | null
    sender?: NotificationSender | null
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = useMemo(() => createClient(), [])

    // Fonction pour enrichir les notifications avec les infos de l'expéditeur
    const enrichNotificationsWithSender = useCallback(async (notifs: Notification[]): Promise<Notification[]> => {
        // Récupérer les sender_ids uniques (en filtrant les null/undefined)
        const senderIds = [...new Set(notifs.map(n => n.sender_id).filter(Boolean))] as string[]
        
        if (senderIds.length === 0) return notifs

        // On lit la VUE public_profiles : la RLS de user_profiles ne permet que
        // sa propre ligne, donc lire les profils des EXPÉDITEURS (autres users)
        // y échouait → l'enrichissement nom/avatar des notifications était vide.
        const { data: profiles } = await supabase
            .from('public_profiles')
            .select('user_id, first_name, last_name, avatar_url, slug')
            .in('user_id', senderIds)

        if (!profiles) return notifs

        const profileMap = new Map(profiles.map(p => [p.user_id, p]))

        return notifs.map(notif => {
            if (notif.sender_id && profileMap.has(notif.sender_id)) {
                const profile = profileMap.get(notif.sender_id)!
                return {
                    ...notif,
                    sender: {
                        id: notif.sender_id,
                        first_name: profile.first_name,
                        last_name: profile.last_name,
                        avatar_url: profile.avatar_url,
                        slug: profile.slug,
                    }
                }
            }
            return notif
        })
    }, [supabase])

    // Chargement initial
    useEffect(() => {
        let isMounted = true

        const loadNotifications = async () => {
            setIsLoading(true)
            setError(null)

            const { data: { user } } = await supabase.auth.getUser()
            if (!isMounted) return

            if (!user) {
                setUserId(null)
                setNotifications([])
                setUnreadCount(0)
                setIsLoading(false)
                return
            }

            setUserId(user.id)

            // Charger les notifications
            const { data, error: fetchError } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(PAGE_SIZE)

            if (!isMounted) return

            if (fetchError) {
                setError(fetchError.message)
                setNotifications([])
                setUnreadCount(0)
            } else {
                const notifs = data || []
                const enrichedNotifs = await enrichNotificationsWithSender(notifs)
                if (!isMounted) return
                
                setNotifications(enrichedNotifs)
                setHasMore(notifs.length === PAGE_SIZE)
            }

            // Charger le count total des non-lues
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false)

            if (!isMounted) return
            setUnreadCount(count || 0)

            setIsLoading(false)
        }

        void loadNotifications()

        return () => {
            isMounted = false
        }
    }, [supabase, enrichNotificationsWithSender])

    // Realtime: nouvelles notifications
    useEffect(() => {
        if (!userId) return

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
                async (payload) => {
                    const newNotif = payload.new as Notification
                    
                    // Enrichir avec les infos sender
                    const [enrichedNotif] = await enrichNotificationsWithSender([newNotif])
                    
                    setNotifications((prev) => {
                        if (prev.some((notification) => notification.id === enrichedNotif.id)) {
                            return prev
                        }
                        return [enrichedNotif, ...prev]
                    })
                    setUnreadCount((prev) => prev + (enrichedNotif.is_read ? 0 : 1))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, userId, enrichNotificationsWithSender])

    // Charger plus de notifications (pagination)
    const loadMore = useCallback(async () => {
        if (!userId || isLoadingMore || !hasMore) return

        setIsLoadingMore(true)

        const lastNotification = notifications[notifications.length - 1]
        if (!lastNotification) {
            setIsLoadingMore(false)
            return
        }

        const { data, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .lt('created_at', lastNotification.created_at)
            .order('created_at', { ascending: false })
            .limit(PAGE_SIZE)

        if (fetchError) {
            setError(fetchError.message)
            setIsLoadingMore(false)
            return
        }

        const notifs = data || []
        const enrichedNotifs = await enrichNotificationsWithSender(notifs)
        
        setNotifications(prev => [...prev, ...enrichedNotifs])
        setHasMore(notifs.length === PAGE_SIZE)
        setIsLoadingMore(false)
    }, [userId, isLoadingMore, hasMore, notifications, supabase, enrichNotificationsWithSender])

    const markAsRead = async (id: string) => {
        const { error: updateError } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        // Propager l'erreur : la page l'attrape pour afficher un toast.
        if (updateError) throw updateError

        const wasUnread = notifications.some((notification) => notification.id === id && !notification.is_read)
        setNotifications((prev) => prev.map((notification) =>
            notification.id === id ? { ...notification, is_read: true } : notification
        ))
        if (wasUnread) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
        }
    }

    const markAllAsRead = async () => {
        if (!userId) return

        const { error: updateError } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (updateError) throw updateError

        setNotifications((prev) => prev.map((notification) => ({
            ...notification,
            is_read: true
        })))
        setUnreadCount(0)
    }

    const deleteNotification = async (id: string) => {
        const toDelete = notifications.find(n => n.id === id)
        const wasUnread = toDelete ? !toDelete.is_read : false

        const { error: deleteError } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
        if (wasUnread) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
        }
    }

    return { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        isLoading,
        isLoadingMore,
        hasMore,
        loadMore,
        error,
    }
}
