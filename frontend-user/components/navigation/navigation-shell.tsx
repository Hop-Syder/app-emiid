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
import { useState, useEffect, useCallback, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { DesktopAppBarGuest } from "./desktop-appbar-guest"
import { DesktopAppBarAuth } from "./desktop-appbar-auth"
import {
  DesktopSidebarAuth,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_STORAGE_KEY,
} from "./desktop-sidebar-auth"
import { MobileDockGuest } from "./mobile-dock-guest"
import { MobileDockAuth } from "./mobile-dock-auth"
import { CommandPalette } from "@/components/command-palette"
import { CommandPaletteProvider } from "@/components/command-palette-context"

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
  // L'état replié vit ici plutôt que dans la barre latérale : le décalage du
  // contenu et celui de l'app bar en dépendent tout autant.
  //
  // Il démarre déplié et n'est relu qu'après montage : lire localStorage au
  // premier rendu ferait diverger le HTML du serveur de celui du client.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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

  useEffect(() => {
    try {
      setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1")
    } catch {
      /* navigation privée ou stockage bloqué : on reste déplié */
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0")
      } catch {
        /* le choix vaut alors pour cette session seulement */
      }
      return next
    })
  }, [])

  const isMessagePage = pathname === "/messages"
  // Sur le site public, aucune barre latérale : le contenu part du bord.
  const sidebarWidth = effectiveIsPublic
    ? 0
    : sidebarCollapsed
      ? SIDEBAR_WIDTH_COLLAPSED
      : SIDEBAR_WIDTH

  return (
    <CommandPaletteProvider>
    <div
      style={{ "--sidebar-w": `${sidebarWidth}px` } as React.CSSProperties}
      className={`relative bg-slate-50 w-full flex ${isMessagePage ? "h-screen max-h-screen overflow-hidden" : "min-h-screen"}`}
    >
      <Suspense fallback={null}>
        <ChatActiveWatcher pathname={pathname} onChange={setIsMessageChatActive} />
      </Suspense>

      {/* Ordinateur : app bar en haut, et barre latérale une fois connecté. */}
      {effectiveIsPublic ? (
        <DesktopAppBarGuest />
      ) : (
        <>
          <DesktopSidebarAuth collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          <DesktopAppBarAuth offset={sidebarWidth} />
        </>
      )}

      {/*
        Conteneur principal.
        - Ordinateur : décalé de la largeur de la barre latérale et de la
          hauteur de l'app bar, toutes deux en position fixe.
        - Mobile : inchangé — padding bas pour ne pas passer sous le dock
          flottant, sauf sur une conversation ou la page Messages.
      */}
      <main
        className={`flex-1 w-full min-w-0 transition-[padding] duration-300 ease-out lg:pl-[var(--sidebar-w)] ${effectiveIsPublic ? "lg:pt-20" : "lg:pt-16"} lg:pb-0 ${isMessagePage ? "pb-0 h-full max-h-full overflow-hidden flex flex-col" : "pb-24"}`}
      >
        {children}
      </main>

      {/* Dock pour Mobile (masqué si conversation active) */}
      {!isMessageChatActive && (
        effectiveIsPublic ? <MobileDockGuest /> : <MobileDockAuth />
      )}

      {/* Palette de commandes (CMD+K) */}
      <CommandPalette />
    </div>
    </CommandPaletteProvider>
  )
}
