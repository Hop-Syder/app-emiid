"use client"

import { DesktopSidebar } from "./desktop-sidebar"
import { MobileDock } from "./mobile-dock"

interface NavigationShellProps {
  children: React.ReactNode
  isPublic?: boolean
}

export function NavigationShell({ children, isPublic = false }: NavigationShellProps) {
  return (
    <div className="relative min-h-screen bg-slate-50 w-full flex">
      {/* Sidebar pour Desktop */}
      <DesktopSidebar isPublic={isPublic} />

      {/* 
        Conteneur principal: 
        - padding-left de 88px sur lg pour ne pas passer sous la sidebar (w-[88px])
        - padding-bottom sur mobile pour ne pas être caché par le dock flottant
      */}
      <main className="flex-1 w-full min-w-0 transition-all duration-300 lg:pl-[88px] pb-24 lg:pb-0">
        {children}
      </main>

      {/* Dock pour Mobile */}
      <MobileDock isPublic={isPublic} />
    </div>
  )
}
