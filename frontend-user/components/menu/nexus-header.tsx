"use client"

import { Menu, PanelLeft, Bell, MessageSquare, Search, Home, Users, Wallet, LogOut, User, PlusCircle } from "lucide-react"
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
        className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">

          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <PanelLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <img src="/logo/logo.png" alt="Nexus Connect" className="h-8 w-auto" />
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-2xl" onClick={(e) => handleRestrictedAction(e, "/messages")}>
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Messages</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications - Desktop & Mobile */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative">
                    <Button variant="ghost" size="icon" className="rounded-2xl">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-background">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0 rounded-3xl overflow-hidden shadow-2xl border-muted/20" align="end">
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <h3 className="font-semibold text-sm">Notifications</h3>
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
                          className={`p-4 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50 ${!n.is_read ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-semibold">{n.title}</h4>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-muted-foreground">
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
                    <Button variant="ghost" size="icon" className="rounded-2xl">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-background">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
                  <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] h-[70vh] fixed bottom-0 left-0 right-0 z-50 outline-none">
                    <div className="p-4 bg-white rounded-t-[32px] flex-1">
                      <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
                      <div className="max-w-md mx-auto">
                        <Drawer.Title className="font-bold text-xl mb-4 px-4">Notifications</Drawer.Title>
                        <ScrollArea className="h-[55vh] px-2">
                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  markAsRead(n.id);
                                  if (n.link) router.push(n.link);
                                }}
                                className={`p-4 mb-2 rounded-2xl transition-colors ${!n.is_read ? 'bg-primary/5 border border-primary/10' : 'bg-slate-50'}`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-sm font-bold">{n.title}</h4>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{n.content}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-20 text-muted-foreground">Rien de nouveau ici.</div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-primary cursor-pointer transition-transform hover:scale-105">
                    <AvatarImage src={user?.avatar_url || "/african-user.jpg"} alt="User" />
                    <AvatarFallback>{user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => handleRestrictedAction(e, "/parametres")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Parametre</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>

    </>
  )
}
