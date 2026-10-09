/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation mobile façon WhatsApp — 5 onglets pleine
 *              largeur : Accueil, Réseau, Missions, Messagerie, Vous.
 *              Refonte du 09/10 : « Vous » est désormais une page (carte
 *              digitale + QR code) et non plus une feuille ; le badge de la
 *              Messagerie compte les MESSAGES non lus (il comptait auparavant
 *              les notifications).
 * @created 2026-06-13
 * @updated 2026-10-09
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, Users, Briefcase, MessageSquare, User } from "lucide-react"
import { useUnreadMessages } from "@/hooks/use-unread-messages"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { cn } from "@/lib/utils"

interface TabConfig {
  key: string
  name: string
  href: string
  icon: typeof Home
  badge?: number
}

export function MobileDockAuth() {
  const pathname = usePathname()
  const unreadMessages = useUnreadMessages()
  const { currentUser } = useCurrentUserProfile()

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard-user" && pathname.startsWith(`${href}/`))

  const tabs: TabConfig[] = [
    { key: "home", name: "Accueil", href: "/dashboard-user", icon: Home },
    { key: "network", name: "Réseau", href: "/reseau", icon: Users },
    { key: "missions", name: "Missions", href: "/missions", icon: Briefcase },
    { key: "messages", name: "Messagerie", href: "/messages", icon: MessageSquare, badge: unreadMessages },
    { key: "me", name: "Vous", href: "/vous", icon: User },
  ]

  return (
    <nav
      aria-label="Navigation principale"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 w-full border-t border-border bg-background/95 backdrop-blur-md"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "calc(58px + env(safe-area-inset-bottom))",
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.href)
        const Icon = tab.icon
        const showAvatar = tab.key === "me" && currentUser?.avatar_url

        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            aria-label={tab.badge ? `${tab.name}, ${tab.badge} non lu${tab.badge > 1 ? "s" : ""}` : undefined}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 select-none transition-colors",
              active ? "text-[#013ff4] dark:text-[#4d7bff]" : "text-muted-foreground",
            )}
          >
            {/* Pas de pastille derrière l'icône : c'est l'icône elle-même qui
                change d'état — pleine (remplie) et bleue sur l'onglet actif,
                simple trait gris sinon. */}
            <span className="relative flex h-7 w-14 items-center justify-center">
              {showAvatar ? (
                <Image
                  src={currentUser!.avatar_url!}
                  alt=""
                  width={24}
                  height={24}
                  className={cn(
                    "h-[23px] w-[23px] rounded-full object-cover",
                    active ? "ring-2 ring-[#013ff4] dark:ring-[#4d7bff]" : "ring-1 ring-border",
                  )}
                />
              ) : (
                <Icon
                  className="h-[23px] w-[23px] transition-colors"
                  // L'icône se remplit de la couleur courante : silhouette pleine
                  // à l'état actif, contour seul au repos.
                  fill={active ? "currentColor" : "none"}
                  strokeWidth={active ? 1.5 : 1.8}
                />
              )}

              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-0.5 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-contact-strong px-1 text-[10px] font-bold text-white ring-2 ring-background">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </span>
            <span className={cn("text-[11px] leading-none", active ? "font-bold" : "font-medium")}>{tab.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
