/* eslint-disable @next/next/no-img-element */
"use client"

import { Menu, PanelLeft, Bell, MessageSquare, LogOut, LogIn, Settings, AlertCircle, Shield, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/hooks/use-notifications"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { useScroll, useMotionValueEvent } from "framer-motion"
import { Drawer } from "vaul"

interface NukunHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
}

export function NukunHeader({ sidebarOpen, setSidebarOpen, setMobileMenuOpen }: NukunHeaderProps) {
  const messagingDevBypassEnabled = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true"
  const router = useRouter()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const { scrollY } = useScroll()
  const supabase = createClient()
  const { session, currentUser } = useCurrentUserProfile()

  const userDisplayName = `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() || currentUser?.email || "Visiteur"
  const userInitials = `${currentUser?.first_name?.[0] || "U"}${currentUser?.last_name?.[0] || ""}`
  const userEmail = currentUser?.email || session?.user?.email || "Compte non connecté"

  useMotionValueEvent(scrollY, "change", () => {
    // Logic to hide header on scroll disabled to satisfy user request for persistent navigation
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleRestrictedAction = (e: React.MouseEvent, targetRoute?: string) => {
    if (!session && !(messagingDevBypassEnabled && targetRoute?.startsWith("/messages"))) {
      e.preventDefault()
      router.push("/login")
    } else if (targetRoute) {
      router.push(targetRoute)
    }
  }

  return (
    <>
      <header
        className="sticky top-0 md:top-6 z-50 md:mx-6 mb-4 md:mb-6 md:rounded-2xl border-b md:border border-white/20 bg-white/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/80 shadow-md md:shadow-lg transition-all duration-300"
      >
        <div className="flex h-16 md:h-[72px] items-center justify-between gap-2 md:gap-4 px-3 md:px-8">

          <div className="flex items-center gap-2.5 min-w-0">
            {/* Toggle Button for Desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex shrink-0 rounded-xl bg-white shadow-sm border border-slate-100 active:bg-slate-50 transition-all h-10 w-10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Réduire le sidebar" : "Ouvrir le sidebar"}
            >
              <PanelLeft className="h-5 w-5 text-slate-700" />
            </Button>

            {/* Toggle Button for Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0 rounded-xl bg-white shadow-sm border border-slate-100 active:bg-slate-50 transition-all h-10 w-10"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu mobile"
            >
              <Menu className="h-5 w-5 text-slate-700" />
            </Button>

            {/* Title Area (mostly for mobile/tablet where sidebar is hidden) */}
            <div className="min-w-0 md:hidden flex items-center">
              <img src="/logo/logo-1.png" alt="Nukun" className="h-7 w-auto max-w-[130px] object-contain" />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl md:rounded-xl h-10 w-10 md:h-11 md:w-11 bg-white hover:bg-primary/5 hover:text-primary transition-all shadow-sm border border-slate-100 hidden sm:flex"
                    onClick={(e) => handleRestrictedAction(e, "/messages")}
                  >
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-xl px-3 py-1.5 font-semibold">Messages</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications - Desktop & Mobile */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl md:rounded-xl h-10 w-10 md:h-11 md:w-11 bg-white hover:bg-primary/5 hover:text-primary transition-all shadow-sm border border-slate-100"
                    >
                      <Bell className="h-4 w-4 md:h-5 md:w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-red-500 text-[9px] md:text-[10px] text-white font-bold ring-2 ring-white shadow-sm shadow-red-500/30 animate-pulse">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0 rounded-xl overflow-hidden shadow-2xl border-white/40 bg-white/95 backdrop-blur-xl" align="end">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => {
                        const isBug = n.type === 'bug' || n.type === 'error'
                        const isSecurity = n.type === 'security'
                        
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id)
                              if (n.link) router.push(n.link)
                            }}
                            className={cn(
                              "p-4 border-b border-slate-50 last:border-0 cursor-pointer transition-all hover:bg-slate-50",
                              !n.is_read ? 'bg-primary/5 hover:bg-primary/10' : '',
                              isBug && !n.is_read ? 'bg-red-50 hover:bg-red-100/50' : ''
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-2 rounded-lg shrink-0",
                                isBug ? "bg-red-100 text-red-600" : 
                                isSecurity ? "bg-amber-100 text-amber-600" : 
                                "bg-blue-100 text-blue-600"
                              )}>
                                {isBug ? <AlertCircle className="h-4 w-4" /> : 
                                 isSecurity ? <Shield className="h-4 w-4" /> : 
                                 <MessageSquare className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className={cn(
                                    "text-sm font-bold line-clamp-1",
                                    isBug ? "text-red-900" : "text-slate-900"
                                  )}>{n.title}</h4>
                                  <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-full shadow-sm">
                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-8 text-center text-sm font-medium text-slate-400">
                        Aucune notification
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Notifications - Mobile (Drawer) */}
            <div className="md:hidden">
              <Drawer.Root>
                <Drawer.Trigger asChild>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl md:rounded-xl h-10 w-10 md:h-11 md:w-11 bg-white hover:bg-primary/5 hover:text-primary transition-all shadow-sm border border-slate-100"
                    >
                      <Bell className="h-4 w-4 md:h-5 md:w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-red-500 text-[9px] md:text-[10px] text-white font-bold ring-2 ring-white shadow-sm shadow-red-500/30">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
                  <Drawer.Content className="bg-white flex flex-col rounded-t-[2rem] h-[70vh] fixed bottom-0 left-0 right-0 z-50 outline-none">
                    <div className="p-4 bg-white rounded-t-[2rem] flex-1">
                      <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-6" />
                      <div className="max-w-md mx-auto">
                        <Drawer.Title className="font-bold text-2xl mb-6 px-4 text-slate-900">Notifications</Drawer.Title>
                        <ScrollArea className="h-[55vh] px-2">
                          {notifications.length > 0 ? (
                            notifications.map((n) => {
                              const isBug = n.type === 'bug' || n.type === 'error'
                              const isSecurity = n.type === 'security'
                              
                              return (
                                <div
                                  key={n.id}
                                  onClick={() => {
                                    markAsRead(n.id);
                                    if (n.link) router.push(n.link);
                                  }}
                                  className={cn(
                                    "p-4 mb-3 rounded-2xl transition-all shadow-sm border flex items-start gap-4",
                                    !n.is_read ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-100',
                                    isBug && !n.is_read ? 'bg-red-50 border-red-200' : ''
                                  )}
                                >
                                  <div className={cn(
                                    "p-3 rounded-xl shrink-0",
                                    isBug ? "bg-red-100 text-red-600" : 
                                    isSecurity ? "bg-amber-100 text-amber-600" : 
                                    "bg-blue-100 text-blue-600"
                                  )}>
                                    {isBug ? <AlertCircle className="h-5 w-5" /> : 
                                     isSecurity ? <Shield className="h-5 w-5" /> : 
                                     <MessageSquare className="h-5 w-5" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                      <h4 className={cn(
                                        "text-sm font-bold",
                                        isBug ? "text-red-900" : "text-slate-900"
                                      )}>{n.title}</h4>
                                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">{n.content}</p>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="text-center py-20 text-slate-400 font-medium">Rien de nouveau ici.</div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-0 h-10 w-10 md:h-11 md:w-11 rounded-full outline-none focus:ring-4 focus:ring-primary/20 transition-all sm:ml-1 bg-white shadow-sm shrink-0">
                  <Avatar className="h-10 w-10 md:h-11 md:w-11 border-2 border-white shadow-sm transition-transform hover:scale-105">
                    <AvatarImage src={currentUser?.avatar_url || "/profil/avatar.jpg"} alt="User" className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-500 border-2 border-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 rounded-xl mt-2 shadow-2xl border-white/50 bg-white/95 backdrop-blur-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3 bg-slate-50 rounded-xl mb-1">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-slate-900 line-clamp-1">{userDisplayName}</p>
                    <p className="text-xs font-medium leading-none text-slate-500 line-clamp-1">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuItem className="rounded-xl mt-1 h-10 px-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors font-medium text-slate-700" onClick={(e) => handleRestrictedAction(e, "/parametres")}>
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Settings className="h-4 w-4 text-slate-500" />
                    </div>
                    <span>Paramètres du compte</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5" />

                <DropdownMenuItem
                  className={cn(
                    "rounded-xl h-10 px-3 cursor-pointer transition-colors font-bold",
                    session
                      ? "text-red-600 hover:bg-red-50 focus:bg-red-50"
                      : "text-primary hover:bg-primary/10 focus:bg-primary/10"
                  )}
                  onClick={session ? handleLogout : () => router.push("/login")}
                >
                  <div className="flex items-center gap-3 w-full">
                    {session ? (
                      <>
                        <div className="p-1.5 bg-red-100/50 rounded-lg">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <span>Déconnexion</span>
                      </>
                    ) : (
                      <>
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <LogIn className="h-4 w-4 text-primary" />
                        </div>
                        <span>Connexion sécurisée</span>
                      </>
                    )}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

    </>
  )
}
