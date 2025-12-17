"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, ChevronDown, Globe, Home, Grid, MessageSquare, Search, Settings, Wallet, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: <Home />,
    href: "/",
  },
  {
    title: "Annuaire",
    icon: <Grid />,
    items: [
      { title: "Artisans", href: "/annuaire/artisans" },
      { title: "Freelances", href: "/annuaire/freelances" },
      { title: "Entreprises", href: "/annuaire/entreprises" },
      { title: "ONG", href: "/annuaire/ong" },
    ],
  },
  {
    title: "Portefeuille",
    icon: <Wallet />,
    items: [
      { title: "Profils suivis", href: "/portefeuille/profils", badge: "12" },
      { title: "Projets suivis", href: "/portefeuille/projets", badge: "5" },
    ],
  },
  {
    title: "MarketProjets",
    icon: <Briefcase />,
    badge: "3",
    items: [
      { title: "Financement", href: "/market-projets/financement" },
      { title: "Partenaires", href: "/market-projets/partenaires" },
      { title: "À vendre", href: "/market-projets/a-vendre", badge: "3" },
    ],
  },
  {
    title: "Messages",
    icon: <MessageSquare />,
    href: "/messages",
    badge: "8",
  },
  {
    title: "Paramètres",
    icon: <Settings />,
    href: "/parametres",
  },
]

interface NexusSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function NexusSidebar({ sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen }: NexusSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Annuaire: true,
    Portefeuille: true,
    MarketProjets: true,
  })

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

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-amber-500 text-white">
            <Globe className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Nexus Connect</h2>
            <p className="text-xs text-muted-foreground">Afrique de l'Ouest</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Rechercher..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <div key={item.title} className="mb-1">
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href) ? "bg-primary/10 text-primary" : "hover:bg-muted",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ) : (
                <>
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                      isParentActive(item.items) ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                    onClick={() => toggleExpanded(item.title)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", expandedItems[item.title] ? "rotate-180" : "")}
                      />
                    </div>
                  </button>

                  {item.items && expandedItems[item.title] && (
                    <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className={cn(
                            "flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition-colors",
                            isActive(subItem.href) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.title}
                          {subItem.badge && (
                            <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                              {subItem.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <Link
          href="/parametres"
          className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/african-user.jpg" alt="User" />
              <AvatarFallback>MK</AvatarFallback>
            </Avatar>
            <span>Mon Profil</span>
          </div>
          <Badge variant="outline" className="ml-auto">
            Vérifié
          </Badge>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background border-r transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-amber-500 text-white">
              <Globe className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Nexus Connect</h2>
              <p className="text-xs text-muted-foreground">Afrique de l'Ouest</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent />
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </div>
    </>
  )
}
