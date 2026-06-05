"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DesktopSidebar } from "./desktop-sidebar"
import { MobileDock } from "./mobile-dock"
import { CommandPalette } from "@/components/command-palette"

interface NavigationShellProps {
  children: React.ReactNode
  isPublic?: boolean
}

export function NavigationShell({ children, isPublic = false }: NavigationShellProps) {
  const [effectiveIsPublic, setEffectiveIsPublic] = useState(isPublic)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const isMessageChatActive = pathname === "/messages" && (searchParams.get("contact") || searchParams.get("user"))

  useEffect(() => {
    const supabase = createClient()
    
    // Vérification initiale de la session
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      setEffectiveIsPublic(!session)
    }
    
    void checkAuth()

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setEffectiveIsPublic(!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-slate-50 w-full flex">
      {/* Sidebar pour Desktop */}
      <DesktopSidebar isPublic={effectiveIsPublic} />

      {/* 
        Conteneur principal: 
        - padding-left de 88px sur lg pour ne pas passer sous la sidebar (w-[88px])
        - padding-bottom sur mobile pour ne pas être caché par le dock flottant (sauf si chat actif)
      */}
      <main className={`flex-1 w-full min-w-0 transition-all duration-300 lg:pl-[88px] lg:pb-0 ${isMessageChatActive ? "pb-0" : "pb-24"}`}>
        {children}
      </main>

      {/* Dock pour Mobile */}
      {!isMessageChatActive && <MobileDock isPublic={effectiveIsPublic} />}

      {/* Palette de commandes (CMD+K) */}
      <CommandPalette />
    </div>
  )
}
