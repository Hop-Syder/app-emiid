/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook React pour la synchronisation en temps réel des messages et de la présence
 * @created 2026-05-11
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { Message } from "@/components/messages/types"

interface RealtimeHandlers {
  onNewMessage: (message: Message) => void
  onPresenceChange: (onlineUserIds: Set<string>) => void
  onUpdateMessage?: (message: Message) => void
  onDeleteMessage?: (messageId: string) => void
}

export function useMessagesRealtime(currentUserId: string | null, handlers: RealtimeHandlers) {
  const supabase = useMemo(() => createClient(), [])
  const [connected, setConnected] = useState(false)
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  const handlePresenceSync = useCallback(
    (channel: RealtimeChannel) => {
      const state = channel.presenceState()
      const onlineIds = new Set<string>()

      Object.values(state).forEach((presences) => {
        (presences as { user_id?: string }[]).forEach((p) => {
          if (p.user_id) onlineIds.add(p.user_id)
        })
      })

      handlersRef.current.onPresenceChange(onlineIds)
    },
    [],
  )

  useEffect(() => {
    if (!currentUserId) return

    const globalChannel = supabase.channel("user-presence-global", {
      config: {
        presence: { key: currentUserId },
      },
    })

    globalChannel
      .on("presence", { event: "sync" }, () => handlePresenceSync(globalChannel))
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          handlersRef.current.onNewMessage(payload.new as Message)
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          handlersRef.current.onUpdateMessage?.(payload.new as Message)
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          if (payload.old && payload.old.id) {
            handlersRef.current.onDeleteMessage?.(payload.old.id)
          }
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED")
      })

    globalChannel.track({ user_id: currentUserId }).catch(() => {
      // ignore
    })

    return () => {
      supabase.removeChannel(globalChannel)
    }
  }, [currentUserId, handlePresenceSync, supabase])

  return { realtimeConnected: connected }
}
