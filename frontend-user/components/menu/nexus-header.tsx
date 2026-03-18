"use client"

import { Menu, PanelLeft, Bell, MessageSquare, Search, Home, Users, Wallet, LogOut, LogIn, User, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Drawer } from "vaul"

interface NexusHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
}

export function NexusHeader({ sidebarOpen, setSidebarOpen, setMobileMenuOpen }: NexusHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [user, setUser] = useState<{ first_name: string; last_name: string; avatar_url?: string; email?: string } | null>(null)
  const [session, setSession] = useState<any>(null)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()
  const supabase = createClient()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        loadUser()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        loadUser()
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUser = async () => {
    try {
      const response = await fetchWithAuth("/api/users/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error("Erreur chargement user header:", error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleRestrictedAction = (e: React.MouseEvent, targetRoute?: string) => {
    if (!session) {
      e.preventDefault()
      router.push("/login")
    } else if (targetRoute) {
      router.push(targetRoute)
    }
  }

  const getActiveTab = () => {
    if (pathname === "/dashboard-user" || pathname === "/" || pathname === "/dashboard-public") return "dashboard-user"
    if (pathname.startsWith("/annuaire")) return "annuaire"
    if (pathname.startsWith("/portefeuille")) return "portefeuille"
    if (pathname.startsWith("/creer-profil")) return "creer-profil"

    return "dashboard-user"
  }

  const handleTabChange = (value: string) => {
    const routes: Record<string, string> = {
      "dashboard-user": session ? "/dashboard-user" : "/dashboard-public",
      annuaire: "/annuaire",
      portefeuille: "/portefeuille",
      "creer-profil": "/creer-profil",
    }

    const restrictedTabs = ["portefeuille", "creer-profil"]
    if (restrictedTabs.includes(value) && !session) {
      router.push("/login")
    } else {
      router.push(routes[value] || "/dashboard-user")
    }
  }

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="sticky top-0 z-20 border-b border-white/20 bg-white/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60 shadow-sm"
      >
        <div className="flex h-[72px] items-center gap-4 px-4 md:px-8">

          {/* Toggle Button for Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-all hover:scale-105" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </Button>

          {/* Title Area (mostly for mobile/tablet where sidebar is hidden) */}
          <div className="flex-1 min-w-0 md:hidden flex items-center">
            <img src="/logo/logo-1.png" alt="Nexus Connect" className="h-9 w-auto object-contain" />
          </div>
          
          <div className="flex-1 hidden md:block" />

          <div className="flex items-center gap-2 md:gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-2xl h-11 w-11 bg-white hover:bg-primary/5 hover:text-primary transition-all shadow-sm border border-slate-100" 
                    onClick={(e) => handleRestrictedAction(e, "/messages")}
                  >
                    <MessageSquare className="h-5 w-5" />
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
                        className="rounded-2xl h-11 w-11 bg-white hover:bg-primary/5 hover:text-primary transition-all shadow-sm border border-slate-100"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white shadow-sm shadow-red-500/30 animate-pulse">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0 rounded-3xl overflow-hidden shadow-2xl border-white/40 bg-white/95 backdrop-blur-xl" align="end">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id)
                            if (n.link) router.push(n.link)
                          }}
                          className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer transition-all hover:bg-slate-50 ${!n.is_read ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{n.title}</h4>
                            <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-full shadow-sm">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{n.content}</p>
                        </div>
                      ))
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
                        className="rounded-2xl h-11 w-11 bg-white hover:bg-primary/5 hover:text-primary transition-all shadow-sm border border-slate-100"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white shadow-sm shadow-red-500/30">
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
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  markAsRead(n.id);
                                  if (n.link) router.push(n.link);
                                }}
                                className={`p-4 mb-3 rounded-2xl transition-all shadow-sm border ${!n.is_read ? 'bg-primary/5 border-primary/20 shadow-primary/5' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                              >
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-500">{n.content}</p>
                              </div>
                            ))
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
                <Button variant="ghost" className="relative p-0 h-11 w-11 rounded-full outline-none focus:ring-4 focus:ring-primary/20 transition-all ml-1 bg-white shadow-sm">
                  <Avatar className="h-11 w-11 border-2 border-white shadow-sm transition-transform hover:scale-105">
                    <AvatarImage src={user?.avatar_url || "/african-user.jpg"} alt="User" className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 rounded-3xl mt-2 shadow-2xl border-white/50 bg-white/95 backdrop-blur-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3 bg-slate-50 rounded-2xl mb-1">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-slate-900 line-clamp-1">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs font-medium leading-none text-slate-500 line-clamp-1">{user?.email}</p>
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
      </motion.header>

    </>
  )
}
