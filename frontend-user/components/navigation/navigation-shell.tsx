/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Conteneur de navigation principal avec gestion responsive et Suspense pour useSearchParams
 * @created 2026-06-03
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { DesktopSidebar } from "./desktop-sidebar"
import { MobileDock } from "./mobile-dock"
import { CommandPalette } from "@/components/command-palette"

interface NavigationShellProps {
  children: React.ReactNode
  isPublic?: boolean
}

interface ChatActiveWatcherProps {
  pathname: string
  onChange: (active: boolean) => void
}

function ChatActiveWatcher({ pathname, onChange }: ChatActiveWatcherProps) {
  const searchParams = useSearchParams()
  const isActive = pathname === "/messages" && !!(searchParams.get("contact") || searchParams.get("user"))

  useEffect(() => {
    onChange(isActive)
  }, [isActive, onChange])

  return null
}

export function NavigationShell({ children, isPublic = false }: NavigationShellProps) {
  const [effectiveIsPublic, setEffectiveIsPublic] = useState(isPublic)
  const [isMessageChatActive, setIsMessageChatActive] = useState(false)
  const pathname = usePathname()

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

  const isMessagePage = pathname === "/messages"

  return (
    <div className={`relative bg-slate-50 w-full flex ${isMessagePage ? "h-screen max-h-screen overflow-hidden" : "min-h-screen"}`}>
      <Suspense fallback={null}>
        <ChatActiveWatcher pathname={pathname} onChange={setIsMessageChatActive} />
      </Suspense>

      {/* Sidebar pour Desktop (toujours visible sur grand écran) */}
      <DesktopSidebar isPublic={effectiveIsPublic} />

      {/* 
        Conteneur principal: 
        - padding-left de 88px sur lg pour ne pas passer sous la sidebar (w-[88px])
        - padding-bottom sur mobile pour ne pas être caché par le dock flottant (sauf si chat actif ou page messages)
      */}
      <main className={`flex-1 w-full min-w-0 transition-all duration-300 lg:pl-[88px] lg:pb-0 ${isMessagePage ? "pb-0 h-full max-h-full overflow-hidden flex flex-col" : "pb-24"}`}>
        {children}
      </main>

      {/* Dock pour Mobile (masqué si conversation active) */}
      {!isMessageChatActive && <MobileDock isPublic={effectiveIsPublic} />}

      {/* Palette de commandes (CMD+K) */}
      <CommandPalette />
    </div>
  )
}
