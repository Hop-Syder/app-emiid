"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {

  ChevronDown,
  Globe,
  Home,
  Grid,
  MessageSquare,
  Search,
  Settings,
  Wallet,
  X,
  FileText,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

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
    title: "Carte de profils",
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

interface NexusSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function NexusSidebar({ sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen }: NexusSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Annuaire: true,
    Portefeuille: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNavClick = (e: React.MouseEvent, item: any) => {
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

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Logo Area */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/logo-1.png"
            alt="Nexus Connect Logo"
            width={160}
            height={45}
            className="h-auto w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* Search Area */}
      <div className="px-5 py-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            type="search" 
            placeholder="Recherche rapide..." 
            className="w-full rounded-2xl bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 pl-10 pr-4 py-2.5 h-11 text-sm font-medium transition-all duration-300" 
          />
        </div>
      </div>

      {/* Navigation Area */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1.5 px-2">
          <p className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Menu Principal</p>
          
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
                      className={cn(
                        "group flex flex-1 items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 relative overflow-hidden",
                        active 
                          ? "bg-primary text-white shadow-md shadow-primary/20" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      onClick={(e) => {
                        handleNavClick(e, item)
                        if (!item.requiresAuth || session) setMobileMenuOpen(false)
                      }}
                    >
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                      )}
                      
                      <div className="flex items-center gap-3.5 relative z-10">
                        <div className={cn(
                          "flex items-center justify-center transition-colors",
                          active ? "text-white opacity-100" : "text-slate-400 group-hover:text-primary opacity-80"
                        )}>
                          {typeof item.icon === "string" ? (
                            <img 
                              src={item.icon} 
                              alt={item.title} 
                              className={cn("h-5 w-5 object-contain transition-all duration-300", active && "brightness-0 invert")} 
                            />
                          ) : (
                            item.icon
                          )}
                        </div>
                        <span className="tracking-tight">{item.title}</span>
                      </div>
                      
                      {item.badge && (
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
                      className={cn(
                        "group flex flex-1 items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 relative",
                        parentActive ? "bg-slate-50 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      onClick={() => toggleExpanded(item.title)}
                    >
                      {parentActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full" />
                      )}
                      <div className="flex items-center gap-3.5">
                        <div className={cn(
                          "flex items-center justify-center transition-colors",
                          parentActive ? "text-primary opacity-100" : "text-slate-400 group-hover:text-primary opacity-80"
                        )}>
                          {typeof item.icon === "string" ? (
                            <img src={item.icon} alt={item.title} className="h-5 w-5 object-contain transition-all duration-300" />
                          ) : (
                            item.icon
                          )}
                        </div>
                        <span className="tracking-tight">{item.title}</span>
                      </div>
                    </button>
                  )}

                  {item.items && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpanded(item.title); }}
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

                {item.items && (
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
      <div className="p-4 mt-auto">
        <Link
          href="/parametres"
          className="flex w-full items-center justify-between rounded-[1.5rem] p-3 transition-all duration-300 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:shadow-md hover:-translate-y-0.5 group"
          onClick={(e) => handleNavClick(e, { requiresAuth: true })}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src={session?.user?.user_metadata?.avatar_url || "/african-user.jpg"} alt="User" className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">MO</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 line-clamp-1">Mon Profil</span>
              <span className="text-xs font-medium text-slate-500">Gérer mon compte</span>
            </div>
          </div>
          <Settings className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors group-hover:rotate-45 duration-500" />
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
            <Image
              src="/logo/logo-1.png"
              alt="Nexus Connect Logo"
              width={140}
              height={35}
              className="h-auto w-auto object-contain"
            />
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
