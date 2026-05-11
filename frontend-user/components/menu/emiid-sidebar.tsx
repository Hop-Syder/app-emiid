"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  Search,
  Settings,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"

interface SidebarItem {
  title: string
  icon: React.ReactNode
  href?: string
  badge?: string
  requiresAuth?: boolean
  items?: { title: string; href: string; badge?: string; requiresAuth?: boolean }[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: "/svg/Home.svg",
    href: "/dashboard-user",
  },
  {
    title: "Annuaire",
    icon: "/svg/Grid.svg",
    href: "/annuaire",
  },
  {
    title: "Portefeuille",
    icon: "/svg/Wallet.svg",
    href: "/portefeuille",
    requiresAuth: true,
  },
  {
    title: "Ma Carte EmiID",
    icon: "/svg/FileText.svg",
    href: "/creer-profil",
    requiresAuth: true,
  },
  {
    title: "Messages",
    icon: "/svg/MessageSquare.svg",
    href: "/messages",
    requiresAuth: true,
  },
  {
    title: "Paramètres",
    icon: "/svg/setting.svg",
    href: "/parametres",
    requiresAuth: true,
  },
]

interface EmiIDSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function EmiIDSidebar({ sidebarOpen, setSidebarOpen: _setSidebarOpen, mobileMenuOpen, setMobileMenuOpen }: EmiIDSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, currentUser } = useCurrentUserProfile()

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Annuaire: true,
    Portefeuille: true,
  })

  const userDisplayName = `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() || "Mon Profil"
  const userSubtitle = currentUser?.email || "Gérer mon compte"
  const userInitials = `${currentUser?.first_name?.[0] || "U"}${currentUser?.last_name?.[0] || ""}`

  const handleNavClick = (e: React.MouseEvent, item: { requiresAuth?: boolean, href?: string }) => {
    if (item.requiresAuth && !session) {
      e.preventDefault()
      router.push("/login")
      setMobileMenuOpen(false)
    }
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const isParentActive = (items?: { href: string }[]) => {
    if (!items) return false
    return items.some((item) => pathname.startsWith(item.href))
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCompactDesktop = !isMobile && !sidebarOpen

    return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo Area */}
      <div
        className={cn(
          "flex items-center justify-between",
          isMobile
            ? "p-6 pb-4"
            : isCompactDesktop
              ? "mx-3 mt-4 rounded-2xl bg-white/80 border border-white/60 shadow-sm px-3 py-3 justify-center"
              : "mx-4 mt-4 rounded-2xl bg-white/80 border border-white/60 shadow-sm px-4 py-3"
        )}
      >
        <div className={cn("flex items-center gap-3", isCompactDesktop && "justify-center") }>
          <Image
            src="/logo/logo-1.png"
            alt="EmiID Logo"
            width={160}
            height={45}
            className={cn(
              "h-auto w-auto object-contain transition-transform duration-300 hover:scale-105",
              isCompactDesktop && "max-w-[42px]"
            )}
          />
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" aria-label="Fermer le menu" className="md:hidden rounded-full hover:bg-slate-100 text-slate-500 shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Search Area */}
      <div className={cn("py-3", isMobile ? "px-5" : isCompactDesktop ? "px-3" : "px-4")}>
        {isCompactDesktop ? (
          <button
            type="button"
            title="Recherche rapide"
            aria-label="Recherche rapide"
            className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-inner transition-all duration-300 hover:bg-slate-50 hover:text-primary"
          >
            <Search className="h-4 w-4" />
          </button>
        ) : (
          <div className="relative group rounded-xl bg-white border border-slate-100 shadow-inner">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Recherche rapide..."
              className="w-full rounded-xl bg-transparent border-transparent hover:bg-slate-50 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 pl-10 pr-4 py-2.5 h-11 text-sm font-medium transition-all duration-300"
            />
          </div>
        )}
      </div>

      {/* Navigation Area */}
      <ScrollArea className={cn("flex-1 py-2", isCompactDesktop ? "px-2" : "px-3")}>
        <div className={cn("space-y-1.5", isCompactDesktop ? "px-1" : "px-2")}>
          {!isCompactDesktop && (
            <p className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Menu Principal</p>
          )}

          {sidebarItems.map((item) => {
            const active = isActive(item.href || "");
            const parentActive = isParentActive(item.items);
            const isExpanded = expandedItems[item.title];

            return (
              <div key={item.title} className="mb-0.5">
                <div className="flex items-center">
                  {item.href ? (
                    <Link
                      href={item.href}
                      title={isCompactDesktop ? item.title : undefined}
                      className={cn(
                        "group flex flex-1 items-center rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden",
                        isCompactDesktop ? "justify-center px-0 py-3.5" : "justify-between px-4 py-3",
                        active
                          ? "bg-primary/90 text-white shadow-md shadow-primary/25"
                          : "text-slate-600 hover:bg-white hover:text-slate-900"
                      )}
                      onClick={(e) => {
                        handleNavClick(e, item)
                        if (!item.requiresAuth || session) setMobileMenuOpen(false)
                      }}
                    >
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/90 rounded-r-full" />
                      )}

                      <div className={cn("flex items-center relative z-10", isCompactDesktop ? "justify-center" : "gap-3.5")}>
                        <div className={cn(
                          "flex items-center justify-center transition-colors",
                          active ? "text-white opacity-100" : "text-slate-400 group-hover:text-primary opacity-80"
                        )}>
                          {typeof item.icon === "string" ? (
                            <Image
                              src={item.icon}
                              alt={item.title}
                              width={20}
                              height={20}
                              className={cn(
                                "h-5 w-5 object-contain transition-all duration-300 opacity-70 group-hover:opacity-100",
                                active && "brightness-0 invert opacity-100",
                              )}
                            />
                          ) : (
                            item.icon
                          )}
                        </div>
                        {!isCompactDesktop && <span className="tracking-tight">{item.title}</span>}
                      </div>

                      {!isCompactDesktop && item.badge && (
                        <Badge variant="outline" className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider z-10",
                          active ? "border-white/30 bg-white/10 text-white" : "border-primary/20 bg-primary/5 text-primary"
                        )}>
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ) : (
                    <button
                      title={isCompactDesktop ? item.title : undefined}
                      className={cn(
                        "group flex flex-1 items-center rounded-xl text-sm font-semibold transition-all duration-300 relative",
                        isCompactDesktop ? "justify-center px-0 py-3.5" : "justify-between px-4 py-3",
                        parentActive ? "bg-slate-50 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      onClick={() => toggleExpanded(item.title)}
                    >
                      {parentActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full" />
                      )}
                      <div className={cn("flex items-center", isCompactDesktop ? "justify-center" : "gap-3.5")}>
                        <div className={cn(
                          "flex items-center justify-center transition-colors",
                          parentActive ? "text-primary opacity-100" : "text-slate-400 group-hover:text-primary opacity-80"
                        )}>
                          {typeof item.icon === "string" ? (
                            <Image
                              src={item.icon}
                              alt={item.title}
                              width={20}
                              height={20}
                              className="h-5 w-5 object-contain transition-all duration-300"
                            />
                          ) : (
                            item.icon
                          )}
                        </div>
                        {!isCompactDesktop && <span className="tracking-tight">{item.title}</span>}
                      </div>
                    </button>
                  )}

                  {item.items && !isCompactDesktop && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpanded(item.title); }}
                      aria-label={isExpanded ? `Réduire ${item.title}` : `Développer ${item.title}`}
                      className={cn(
                        "p-2 hover:bg-slate-100 rounded-xl ml-1 transition-colors",
                        isExpanded ? "text-primary" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform duration-300", isExpanded ? "rotate-180" : "")}
                      />
                    </button>
                  )}
                </div>

                {item.items && !isCompactDesktop && (
                  <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <div className="ml-6 space-y-1 border-l-2 border-slate-100 pl-4 py-1">
                        {item.items.map((subItem) => {
                          const subActive = isActive(subItem.href);
                          return (
                            <Link
                              key={subItem.title}
                              href={subItem.href}
                              className={cn(
                                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 relative",
                                subActive
                                  ? "text-primary font-bold bg-primary/5"
                                  : "text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50"
                              )}
                              onClick={(e) => {
                                handleNavClick(e, subItem)
                                if (!subItem.requiresAuth || session) setMobileMenuOpen(false)
                              }}
                            >
                              {subActive && <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
                              {subItem.title}
                              {subItem.badge && (
                                <Badge variant="outline" className="ml-auto rounded-full px-2 py-0 text-[10px]">
                                  {subItem.badge}
                                </Badge>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* User Profile Footer */}
      <div className={cn("mt-auto", isCompactDesktop ? "p-3" : "p-4")}>
        <Link
          href="/parametres"
          title={isCompactDesktop ? "Mon Profil" : undefined}
          className={cn(
            "flex w-full items-center rounded-xl transition-all duration-300 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:shadow-md hover:-translate-y-0.5 group",
            isCompactDesktop ? "justify-center p-3" : "justify-between p-3"
          )}
          onClick={(e) => handleNavClick(e, { requiresAuth: true })}
        >
          <div className={cn("flex items-center", isCompactDesktop ? "justify-center" : "gap-3")}>
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src={currentUser?.avatar_url || "/profil/avatar.jpg"} alt="User" className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            </div>
            {!isCompactDesktop && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 line-clamp-1">{userDisplayName}</span>
                <span className="text-xs font-medium text-slate-500 line-clamp-1">{userSubtitle}</span>
              </div>
            )}
          </div>
          {!isCompactDesktop && <Settings className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors group-hover:rotate-45 duration-500" />}
        </Link>
      </div>
    </div>
    )
  }

  return (
    <>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Responsive Pro Max */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] transform bg-white shadow-2xl transition-transform duration-500 ease-out md:hidden rounded-r-[2.5rem] overflow-hidden flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent isMobile={true} />
      </div>

  <div
    className={cn(
      "fixed inset-y-0 left-0 z-30 hidden border-r border-slate-100 bg-white shadow-sm transition-all duration-300 ease-in-out md:block",
      sidebarOpen ? "w-[240px] translate-x-0" : "w-20 translate-x-0",
    )}
  >
        <SidebarContent />
      </div>
    </>
  )
}
