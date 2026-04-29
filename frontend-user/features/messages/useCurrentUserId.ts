"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useCurrentUserId() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) setUserId(user.id)
    })
  }, [])

  return userId
}

