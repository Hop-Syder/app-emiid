"use client"

import { Menu, PanelLeft, Bell, MessageSquare, Search, Home, Users, Wallet, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePathname, useRouter } from "next/navigation"

interface NexusHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
}

export function NexusHeader({ sidebarOpen, setSidebarOpen, setMobileMenuOpen }: NexusHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const notifications = 3

  const getActiveTab = () => {
    if (pathname === "/") return "dashboard"
    if (pathname.startsWith("/annuaire")) return "annuaire"
    if (pathname.startsWith("/portefeuille")) return "portefeuille"
    if (pathname.startsWith("/market-projets")) return "market"
    return "dashboard"
  }

  const handleTabChange = (value: string) => {
    const routes: Record<string, string> = {
      dashboard: "/",
      annuaire: "/annuaire/artisans",
      portefeuille: "/portefeuille/profils",
      market: "/market-projets/financement",
    }
    router.push(routes[value] || "/")
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6 border-b">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>

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
                <Button variant="ghost" size="icon" className="rounded-2xl">
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rechercher</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => router.push("/messages")}>
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Messages</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-2xl relative">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {notifications}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-primary">
            <AvatarImage src="/african-user.jpg" alt="User" />
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="px-4 md:px-6 py-3 overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:max-w-[500px] rounded-2xl p-1">
              <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:rounded-xl">
                <Home className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="annuaire" className="rounded-xl data-[state=active]:rounded-xl">
                <Users className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Annuaire</span>
              </TabsTrigger>
              <TabsTrigger value="portefeuille" className="rounded-xl data-[state=active]:rounded-xl">
                <Wallet className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Portefeuille</span>
              </TabsTrigger>
              <TabsTrigger value="market" className="rounded-xl data-[state=active]:rounded-xl">
                <Briefcase className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Market</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  )
}
