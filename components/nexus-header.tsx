"use client"

import { Menu, PanelLeft, Bell, MessageSquare, Plus, Search } from "lucide-react"
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
    if (pathname.startsWith("/market")) return "market"
    if (pathname.startsWith("/messages")) return "messages"
    if (pathname.startsWith("/parametres")) return "parametres"
    return "dashboard"
  }

  const handleTabChange = (value: string) => {
    const routes: Record<string, string> = {
      dashboard: "/",
      annuaire: "/annuaire/artisans",
      portefeuille: "/portefeuille/profils",
      market: "/market/financement",
      messages: "/messages",
      parametres: "/parametres",
    }
    router.push(routes[value] || "/")
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6 border-b">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <PanelLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold">Nexus Connect</h1>
          <p className="text-xs text-muted-foreground">Afrique de l'Ouest</p>
        </div>

        <div className="flex items-center gap-2">
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

          <Avatar className="h-9 w-9 border-2 border-primary">
            <AvatarImage src="/african-user.jpg" alt="User" />
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-[700px] grid-cols-5 md:grid-cols-6 rounded-2xl p-1">
              <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:rounded-xl">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="annuaire" className="rounded-xl data-[state=active]:rounded-xl">
                Annuaire
              </TabsTrigger>
              <TabsTrigger value="portefeuille" className="rounded-xl data-[state=active]:rounded-xl">
                Portefeuille
              </TabsTrigger>
              <TabsTrigger value="market" className="rounded-xl data-[state=active]:rounded-xl">
                Market
              </TabsTrigger>
              <TabsTrigger value="messages" className="rounded-xl data-[state=active]:rounded-xl md:hidden">
                Messages
              </TabsTrigger>
              <TabsTrigger value="parametres" className="rounded-xl data-[state=active]:rounded-xl">
                Paramètres
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="hidden md:flex gap-2">
            <Button className="rounded-2xl bg-gradient-to-r from-green-600 to-amber-500 hover:from-green-700 hover:to-amber-600">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Projet
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
