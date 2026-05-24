"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Message } from "@/components/messages/types"

interface RealtimeHandlers {
  onNewMessage: (message: Message) => void
  onPresenceChange: (onlineUserIds: Set<string>) => void
}

export function useMessagesRealtime(currentUserId: string | null, handlers: RealtimeHandlers) {
  const supabase = useMemo(() => createClient(), [])
  const [connected, setConnected] = useState(false)
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  const handlePresenceSync = useCallback(
    (channel: any) => {
      const state = channel.presenceState()
      const onlineIds = new Set<string>()

      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
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
