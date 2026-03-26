"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Globe,
  Grid,
  HandshakeIcon,
  Heart,
  Home,
  LayoutGrid,
  MapPin,
  Menu,
  MessageSquare,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Share2,
  Shield,
  Users,
  Wallet,
  X,
  BadgeDollarSign,
  Camera,
  ImageIcon,
  Brush,
  Video,
  Sparkles,
  Layers,
  Code,
  CuboidIcon,
  Type,
  Palette,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Sample data for apps
const apps = [
  {
    name: "PixelMaster",
    icon: <ImageIcon className="text-violet-500" />,
    description: "Advanced image editing and composition",
    category: "Creative",
    recent: true,
    new: false,
    progress: 100,
  },
  {
    name: "VectorPro",
    icon: <Brush className="text-orange-500" />,
    description: "Professional vector graphics creation",
    category: "Creative",
    recent: true,
    new: false,
    progress: 100,
  },
  {
    name: "VideoStudio",
    icon: <Video className="text-pink-500" />,
    description: "Cinematic video editing and production",
    category: "Video",
    recent: true,
    new: false,
    progress: 100,
  },
  {
    name: "MotionFX",
    icon: <Sparkles className="text-blue-500" />,
    description: "Stunning visual effects and animations",
    category: "Video",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "PageCraft",
    icon: <Layers className="text-red-500" />,
    description: "Professional page design and layout",
    category: "Creative",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "UXFlow",
    icon: <LayoutGrid className="text-fuchsia-500" />,
    description: "Intuitive user experience design",
    category: "Design",
    recent: false,
    new: true,
    progress: 85,
  },
  {
    name: "PhotoLab",
    icon: <Camera className="text-teal-500" />,
    description: "Advanced photo editing and organization",
    category: "Photography",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "DocMaster",
    icon: <FileText className="text-red-600" />,
    description: "Document editing and management",
    category: "Document",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "WebCanvas",
    icon: <Code className="text-emerald-500" />,
    description: "Web design and development",
    category: "Web",
    recent: false,
    new: true,
    progress: 70,
  },
  {
    name: "3DStudio",
    icon: <CuboidIcon className="text-indigo-500" />,
    description: "3D modeling and rendering",
    category: "3D",
    recent: false,
    new: true,
    progress: 60,
  },
  {
    name: "FontForge",
    icon: <Type className="text-amber-500" />,
    description: "Typography and font creation",
    category: "Typography",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "ColorPalette",
    icon: <Palette className="text-purple-500" />,
    description: "Color scheme creation and management",
    category: "Design",
    recent: false,
    new: false,
    progress: 100,
  },
]

// Sample data for recent files
const recentFiles = [
  {
    name: "Brand Redesign.pxm",
    app: "PixelMaster",
    modified: "2 hours ago",
    icon: <ImageIcon className="text-violet-500" />,
    shared: true,
    size: "24.5 MB",
    collaborators: 3,
  },
  {
    name: "Company Logo.vec",
    app: "VectorPro",
    modified: "Yesterday",
    icon: <Brush className="text-orange-500" />,
    shared: true,
    size: "8.2 MB",
    collaborators: 2,
  },
  {
    name: "Product Launch Video.vid",
    app: "VideoStudio",
    modified: "3 days ago",
    icon: <Video className="text-pink-500" />,
    shared: false,
    size: "1.2 GB",
    collaborators: 0,
  },
  {
    name: "UI Animation.mfx",
    app: "MotionFX",
    modified: "Last week",
    icon: <Sparkles className="text-blue-500" />,
    shared: true,
    size: "345 MB",
    collaborators: 4,
  },
  {
    name: "Magazine Layout.pgc",
    app: "PageCraft",
    modified: "2 weeks ago",
    icon: <Layers className="text-red-500" />,
    shared: false,
    size: "42.8 MB",
    collaborators: 0,
  },
  {
    name: "Mobile App Design.uxf",
    app: "UXFlow",
    modified: "3 weeks ago",
    icon: <LayoutGrid className="text-fuchsia-500" />,
    shared: true,
    size: "18.3 MB",
    collaborators: 5,
  },
  {
    name: "Product Photography.phl",
    app: "PhotoLab",
    modified: "Last month",
    icon: <Camera className="text-teal-500" />,
    shared: false,
    size: "156 MB",
    collaborators: 0,
  },
]

// Sample data for projects
const projects = [
  {
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    progress: 75,
    dueDate: "June 15, 2025",
    members: 4,
    files: 23,
  },
  {
    name: "Mobile App Launch",
    description: "Design and assets for new mobile application",
    progress: 60,
    dueDate: "July 30, 2025",
    members: 6,
    files: 42,
  },
  {
    name: "Brand Identity",
    description: "New brand guidelines and assets",
    progress: 90,
    dueDate: "May 25, 2025",
    members: 3,
    files: 18,
  },
  {
    name: "Marketing Campaign",
    description: "Summer promotion materials",
    progress: 40,
    dueDate: "August 10, 2025",
    members: 5,
    files: 31,
  },
]

// Sample data for tutorials
const tutorials = [
  {
    title: "Mastering Digital Illustration",
    description: "Learn advanced techniques for creating stunning digital art",
    duration: "1h 45m",
    level: "Advanced",
    instructor: "Sarah Chen",
    category: "Illustration",
    views: "24K",
  },
  {
    title: "UI/UX Design Fundamentals",
    description: "Essential principles for creating intuitive user interfaces",
    duration: "2h 20m",
    level: "Intermediate",
    instructor: "Michael Rodriguez",
    category: "Design",
    views: "56K",
  },
  {
    title: "Video Editing Masterclass",
    description: "Professional techniques for cinematic video editing",
    duration: "3h 10m",
    level: "Advanced",
    instructor: "James Wilson",
    category: "Video",
    views: "32K",
  },
  {
    title: "Typography Essentials",
    description: "Create beautiful and effective typography for any project",
    duration: "1h 30m",
    level: "Beginner",
    instructor: "Emma Thompson",
    category: "Typography",
    views: "18K",
  },
  {
    title: "Color Theory for Designers",
    description: "Understanding color relationships and psychology",
    duration: "2h 05m",
    level: "Intermediate",
    instructor: "David Kim",
    category: "Design",
    views: "41K",
  },
]

// Sample data for community posts
const communityPosts = [
  {
    title: "Minimalist Logo Design",
    author: "Alex Morgan",
    likes: 342,
    comments: 28,
    image: "/placeholder.svg?height=300&width=400",
    time: "2 days ago",
  },
  {
    title: "3D Character Concept",
    author: "Priya Sharma",
    likes: 518,
    comments: 47,
    image: "/placeholder.svg?height=300&width=400",
    time: "1 week ago",
  },
  {
    title: "UI dashboard-user-user Redesign",
    author: "Thomas Wright",
    likes: 276,
    comments: 32,
    image: "/placeholder.svg?height=300&width=400",
    time: "3 days ago",
  },
  {
    title: "Product Photography Setup",
    author: "Olivia Chen",
    likes: 189,
    comments: 15,
    image: "/placeholder.svg?height=300&width=400",
    time: "5 days ago",
  },
]

const sidebarItems = [
  {
    title: "dashboard-user-user",
    icon: <Home />,
    isActive: true,
  },
  {
    title: "Annuaire",
    icon: <Grid />,
    items: [
      { title: "Artisans", url: "#" },
      { title: "Freelances", url: "#" },
      { title: "Entreprises", url: "#" },
      { title: "Agences", url: "#" },
      { title: "Startup", url: "#" },
      { title: "ONG", url: "#" },
    ],
  },
  {
    title: "Portefeuille",
    icon: <Wallet />,
    items: [
      { title: "Profils suivis", url: "#", badge: "12" },
      { title: "Projets suivis", url: "#", badge: "5" },
    ],
  },
  {
    title: "MarketProjets",
    icon: <Briefcase />,
    badge: "3",
    items: [
      { title: "Financement", url: "#" },
      { title: "Partenaires", url: "#" },
      { title: "À vendre", url: "#", badge: "3" },
    ],
  },
  {
    title: "Notifications",
    icon: <Bell />,
    badge: "8",
  },
  {
    title: "Paramètres",
    icon: <Settings />,
    items: [
      { title: "Profil", url: "#" },
      { title: "Sécurité", url: "#" },
      { title: "Notifications", url: "#" },
      { title: "Préférences", url: "#" },
    ],
  },
]

const entrepreneurs = [
  {
    name: "Awa Diallo",
    role: "Artisan Textile",
    location: "Dakar, Sénégal",
    avatar: "/african-woman-entrepreneur.jpg",
    specialty: "Tissage traditionnel",
    verified: true,
    followers: 234,
    projects: 12,
  },
  {
    name: "Kofi Mensah",
    role: "Designer Graphique",
    location: "Accra, Ghana",
    avatar: "/african-man-designer.jpg",
    specialty: "Identité visuelle",
    verified: true,
    followers: 489,
    projects: 28,
  },
  {
    name: "Aminata Touré",
    role: "Fondatrice Startup",
    location: "Abidjan, Côte d'Ivoire",
    avatar: "/african-woman-ceo.jpg",
    specialty: "Fintech",
    verified: true,
    followers: 1203,
    projects: 8,
  },
  {
    name: "Ibrahim Keita",
    role: "Menuisier",
    location: "Bamako, Mali",
    avatar: "/african-carpenter.jpg",
    specialty: "Mobilier sur mesure",
    verified: false,
    followers: 156,
    projects: 45,
  },
  {
    name: "Nadia Koné",
    role: "Agence Marketing",
    location: "Dakar, Sénégal",
    avatar: "/african-woman-entrepreneur.jpg",
    specialty: "Communication digitale",
    verified: true,
    followers: 512,
    projects: 22,
  },
]

const marketProjects = [
  {
    title: "Expansion Atelier Textile",
    type: "Financement",
    amount: "15,000 €",
    goal: "25,000 €",
    progress: 60,
    creator: "Awa Diallo",
    location: "Dakar, Sénégal",
    dueDate: "30j",
    backers: 45,
  },
  {
    title: "Partenariat Distribution Artisanat",
    type: "Partenaires",
    creator: "Kofi Mensah",
    location: "Accra, Ghana",
    seeks: "Distributeur Europe",
    responses: 12,
  },
  {
    title: "Startup Fintech - Parts Sociales",
    type: "À vendre",
    amount: "50,000 €",
    shares: "20%",
    creator: "Aminata Touré",
    location: "Abidjan",
    interested: 8,
  },
]

const followedProfiles = [
  {
    name: "Fatou Sow",
    role: "Couturière",
    location: "Lomé, Togo",
    lastActive: "Il y a 2h",
    newUpdates: 3,
  },
  {
    name: "Youssef El Mansouri",
    role: "Développeur Web",
    location: "Casablanca, Maroc",
    lastActive: "Il y a 1j",
    newUpdates: 0,
  },
]

export function DesignaliCreative() {
  const [progress, setProgress] = useState(0)
  // Updated notifications count
  const [notifications, setNotifications] = useState(8)
  // Updated active tab state
  const [activeTab, setActiveTab] = useState("dashboard-user-user")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Simulate progress loading
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 1000)
    return () => clearTimeout(timer)
  }, [])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(255, 183, 3, 0.4) 0%, rgba(0, 114, 41, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(206, 17, 38, 0.4) 0%, rgba(0, 114, 41, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(0, 114, 41, 0.4) 0%, rgba(255, 183, 3, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 50% 50%, rgba(255, 183, 3, 0.4) 0%, rgba(0, 114, 41, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-amber-500 text-white">
                <Globe className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">Nexus Connect</h2>
                <p className="text-xs text-muted-foreground"> Afrique de l'Ouest</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher..." className="w-full rounded-xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="mb-1">
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium",
                      item.isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                    onClick={() => item.items && toggleExpanded(item.title)}
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
                    {item.items && (
                      <ChevronDown
                        className={cn(
                          "ml-2 h-4 w-4 transition-transform",
                          expandedItems[item.title] ? "rotate-180" : "",
                        )}
                      />
                    )}
                  </button>

                  {item.items && expandedItems[item.title] && (
                    <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                      {item.items.map((subItem) => (
                        <a
                          key={subItem.title}
                          href={subItem.url}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          {subItem.title}
                          {'badge' in subItem && subItem.badge && (
                            <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                              {subItem.badge}
                            </Badge>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">
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
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-amber-500 text-white">
                <Globe className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">Nexus Connect</h2>
                <p className="text-xs text-muted-foreground"> Afrique de l'Ouest</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher..." className="w-full rounded-xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="mb-1">
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium",
                      item.isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                    onClick={() => item.items && toggleExpanded(item.title)}
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
                    {item.items && (
                      <ChevronDown
                        className={cn(
                          "ml-2 h-4 w-4 transition-transform",
                          expandedItems[item.title] ? "rotate-180" : "",
                        )}
                      />
                    )}
                  </button>

                  {item.items && expandedItems[item.title] && (
                    <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                      {item.items.map((subItem) => (
                        <a
                          key={subItem.title}
                          href={subItem.url}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          {subItem.title}
                          {'badge' in subItem && subItem.badge && (
                            <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                              {subItem.badge}
                            </Badge>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">
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
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("min-h-screen transition-all duration-300 ease-in-out", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">Nexus Connect</h1>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Messages</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl relative">
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
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="dashboard-user-user" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="grid w-full max-w-[700px] grid-cols-2 md:grid-cols-5 rounded-xl p-1 h-auto">
                <TabsTrigger value="dashboard-user-user" className="rounded-xl data-[state=active]:rounded-xl">
                  dashboard-user-user
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
                <TabsTrigger value="parametres" className="rounded-xl data-[state=active]:rounded-xl">
                  Paramètres
                </TabsTrigger>
              </TabsList>
              <div className="hidden md:flex gap-2">
                <Button className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un Profil
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="dashboard-user-user" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-xl bg-gradient-to-r from-green-600 via-amber-500 to-red-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-4">
                          <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">
                            Réseau Pan-Africain
                          </Badge>
                          <h2 className="text-3xl font-bold">Bienvenue sur Nexus Connect</h2>
                          <p className="max-w-[600px] text-white/80">
                            Cartographier et propulser 100 000 acteurs économiques ouest-africains d'ici 2027.
                            Connectez-vous avec des entrepreneurs, artisans et institutions à travers l'Afrique de
                            l'Ouest.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Button className="rounded-xl bg-white text-green-700 hover:bg-white/90">
                              Explorer le Réseau
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-xl bg-transparent border-white text-white hover:bg-white/10"
                            >
                              Créer mon Profil
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {/* Stats Section */}
                  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardDescription>Entrepreneurs Connectés</CardDescription>
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">12,458</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="text-green-600">+12%</span> ce mois
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardDescription>Projets Actifs</CardDescription>
                          <Briefcase className="h-5 w-5 text-amber-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">3,847</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="text-green-600">+8%</span> ce mois
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardDescription>Connexions Créées</CardDescription>
                          <HandshakeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">28,392</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="text-green-600">+25%</span> ce mois
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardDescription>Pays Couverts</CardDescription>
                          <MapPin className="h-5 w-5 text-red-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">15</div>
                        <p className="text-xs text-muted-foreground mt-1"> Afrique de l'Ouest</p>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Recent Entrepreneurs */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Entrepreneurs Récemment Inscrits</h2>
                      <Button variant="ghost" className="rounded-xl">
                        Voir Tous
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {entrepreneurs.map((person) => (
                        <motion.div key={person.name} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                          <Card className="overflow-hidden rounded-xl border-2 hover:border-primary/50 transition-all duration-300">
                            <CardHeader className="pb-2">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                                  <AvatarFallback>
                                    {person.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-1">
                                    <CardTitle className="text-base">{person.name}</CardTitle>
                                    {person.verified && <Shield className="h-4 w-4 text-blue-500" />}
                                  </div>
                                  <CardDescription className="text-xs">{person.role}</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2 space-y-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {person.location}
                              </div>
                              <Badge variant="outline" className="rounded-xl text-xs">
                                {person.specialty}
                              </Badge>
                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {person.followers}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {person.projects}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button variant="secondary" className="w-full rounded-xl text-sm">
                                Voir Profil
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Recent Projects */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Projets en Tendance</h2>
                      <Button variant="ghost" className="rounded-xl">
                        Voir Tous
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {marketProjects.slice(0, 2).map((project) => (
                        <motion.div key={project.title} whileHover={{ scale: 1.02, y: -5 }}>
                          <Card className="rounded-xl hover:border-primary/50 transition-all duration-300">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="rounded-xl">
                                  {project.type}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {project.location}
                                </div>
                              </div>
                              <CardTitle className="mt-2">{project.title}</CardTitle>
                              <CardDescription>Par {project.creator}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {project.type === "Financement" && (
                                <>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-2xl font-bold text-green-600">{project.amount}</span>
                                    <span className="text-muted-foreground">sur {project.goal}</span>
                                  </div>
                                  <Progress value={project.progress} className="h-2 rounded-xl" />
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{project.backers} contributeurs</span>
                                    <span>{project.dueDate} restants</span>
                                  </div>
                                </>
                              )}
                            </CardContent>
                            <CardFooter>
                              <Button variant="secondary" className="w-full rounded-xl">
                                En Savoir Plus
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="annuaire" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Annuaire des Acteurs Économiques</h2>
                          <p className="max-w-[600px] text-white/80">
                            Découvrez des artisans, freelances, entreprises, agences, startup et ONG à travers l'Afrique de l'Ouest.
                          </p>
                        </div>
                        <div className="relative w-full md:w-auto mt-3 md:mt-0">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Rechercher..."
                            className="w-full rounded-xl pl-9 md:w-[250px]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {/* Sub-tabs for Annuaire */}
                  <Tabs defaultValue="artisans" className="w-full">
                    <TabsList className="grid w-full max-w-[750px] grid-cols-6 rounded-xl p-1">
                      <TabsTrigger value="artisans" className="rounded-xl">
                        Artisans
                      </TabsTrigger>
                      <TabsTrigger value="freelances" className="rounded-xl">
                        Freelances
                      </TabsTrigger>
                      <TabsTrigger value="entreprises" className="rounded-xl">
                        Entreprises
                      </TabsTrigger>
                      <TabsTrigger value="agence" className="rounded-xl">
                        Agences
                      </TabsTrigger>
                      <TabsTrigger value="startup" className="rounded-xl">
                        Startup
                      </TabsTrigger>
                      <TabsTrigger value="ong" className="rounded-xl">
                        ONG
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="artisans" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {entrepreneurs
                          .filter((p) => p.role.includes("Artisan") || p.role.includes("Menuisier"))
                          .map((person) => (
                            <motion.div
                              key={person.name}
                              whileHover={{ scale: 1.02, y: -5 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card className="overflow-hidden rounded-xl border hover:border-primary/50 transition-all duration-300">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                                      <AvatarFallback>
                                        {person.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1">
                                        <CardTitle className="text-base">{person.name}</CardTitle>
                                        {person.verified && <Shield className="h-4 w-4 text-blue-500" />}
                                      </div>
                                      <CardDescription className="text-xs">{person.role}</CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-2 space-y-2">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {person.location}
                                  </div>
                                  <Badge variant="outline" className="rounded-xl text-xs">
                                    {person.specialty}
                                  </Badge>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {person.followers}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Briefcase className="h-3 w-3" />
                                      {person.projects}
                                    </div>
                                  </div>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                  <Button variant="secondary" className="flex-1 rounded-xl text-sm">
                                    Voir
                                  </Button>
                                  <Button variant="outline" size="icon" className="rounded-xl bg-transparent">
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="freelances" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {entrepreneurs
                          .filter((p) => p.role.includes("Designer") || p.role.includes("Développeur"))
                          .map((person) => (
                            <motion.div
                              key={person.name}
                              whileHover={{ scale: 1.02, y: -5 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card className="overflow-hidden rounded-xl border hover:border-primary/50 transition-all duration-300">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                                      <AvatarFallback>
                                        {person.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1">
                                        <CardTitle className="text-base">{person.name}</CardTitle>
                                        {person.verified && <Shield className="h-4 w-4 text-blue-500" />}
                                      </div>
                                      <CardDescription className="text-xs">{person.role}</CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-2 space-y-2">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {person.location}
                                  </div>
                                  <Badge variant="outline" className="rounded-xl text-xs">
                                    {person.specialty}
                                  </Badge>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {person.followers}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Briefcase className="h-3 w-3" />
                                      {person.projects}
                                    </div>
                                  </div>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                  <Button variant="secondary" className="flex-1 rounded-xl text-sm">
                                    Voir
                                  </Button>
                                  <Button variant="outline" size="icon" className="rounded-xl bg-transparent">
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="entreprises" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {entrepreneurs
                          .filter((p) => p.role.includes("Fondatrice") || p.role.includes("Startup"))
                          .map((person) => (
                            <Card key={person.name} className="rounded-xl">
                              <CardHeader>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    <Building2 className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-base">{person.specialty}</CardTitle>
                                    <CardDescription className="text-xs">Par {person.name}</CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {person.location}
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <Badge variant="outline" className="rounded-xl">
                                    Startup
                                  </Badge>
                                  {person.verified && (
                                    <Badge variant="outline" className="rounded-xl text-blue-600">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Vérifiée
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button variant="secondary" className="w-full rounded-xl text-sm">
                                  Voir Entreprise
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="agence" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {entrepreneurs
                          .filter((p) => p.role.includes("Agence"))
                          .map((person) => (
                            <Card key={person.name} className="rounded-xl">
                              <CardHeader>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                                    <Building2 className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-base">{person.specialty}</CardTitle>
                                    <CardDescription className="text-xs">Par {person.name}</CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {person.location}
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <Badge variant="outline" className="rounded-xl">
                                    Agence
                                  </Badge>
                                  {person.verified && (
                                    <Badge variant="outline" className="rounded-xl text-blue-600">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Vérifiée
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button variant="secondary" className="w-full rounded-xl text-sm">
                                  Voir Agence
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="startup" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {entrepreneurs
                          .filter((p) => p.role.includes("Startup") || p.role.includes("Fondatrice"))
                          .map((person) => (
                            <Card key={person.name} className="rounded-xl">
                              <CardHeader>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                                    <Building2 className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-base">{person.specialty}</CardTitle>
                                    <CardDescription className="text-xs">Par {person.name}</CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {person.location}
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <Badge variant="outline" className="rounded-xl">
                                    Startup
                                  </Badge>
                                  {person.verified && (
                                    <Badge variant="outline" className="rounded-xl text-blue-600">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Vérifiée
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button variant="secondary" className="w-full rounded-xl text-sm">
                                  Voir Startup
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="ong" className="space-y-4 mt-6">
                      <div className="flex items-center justify-center py-12">
                        <Card className="max-w-md rounded-xl border-dashed">
                          <CardHeader>
                            <CardTitle>Bientôt Disponible</CardTitle>
                            <CardDescription>
                              La section ONG sera bientôt disponible. Nous travaillons à cartographier les organisations
                              à travers l'Afrique de l'Ouest.
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="portefeuille" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Mon Portefeuille</h2>
                          <p className="max-w-[600px] text-white/80">
                            Suivez vos profils et projets favoris en un seul endroit.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  <Tabs defaultValue="profils" className="w-full">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2 rounded-xl p-1">
                      <TabsTrigger value="profils" className="rounded-xl">
                        Profils suivis
                      </TabsTrigger>
                      <TabsTrigger value="projets" className="rounded-xl">
                        Projets suivis
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profils" className="space-y-4 mt-6">
                      <div className="rounded-xl border overflow-hidden">
                        <div className="divide-y">
                          {followedProfiles.map((profile) => (
                            <motion.div
                              key={profile.name}
                              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                              className="p-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage
                                      src={`/.jpg?key=84glt&key=bi1gz&height=48&width=48&query=${profile.name}`}
                                      alt={profile.name}
                                    />
                                    <AvatarFallback>
                                      {profile.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{profile.name}</p>
                                    <p className="text-sm text-muted-foreground">{profile.role}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {profile.location}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {profile.newUpdates > 0 && (
                                    <Badge variant="outline" className="rounded-xl">
                                      {profile.newUpdates} nouveau
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">{profile.lastActive}</span>
                                  <Button variant="ghost" size="sm" className="rounded-xl">
                                    Voir Profil
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="projets" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {marketProjects.slice(0, 2).map((project) => (
                          <Card key={project.title} className="rounded-xl">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="rounded-xl">
                                  {project.type}
                                </Badge>
                                <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                </Button>
                              </div>
                              <CardTitle className="mt-2">{project.title}</CardTitle>
                              <CardDescription>Par {project.creator}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {project.type === "Financement" && (
                                <>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-2xl font-bold text-green-600">{project.amount}</span>
                                    <span className="text-muted-foreground">sur {project.goal}</span>
                                  </div>
                                  <Progress value={project.progress} className="h-2 rounded-xl" />
                                </>
                              )}
                            </CardContent>
                            <CardFooter>
                              <Button variant="secondary" className="w-full rounded-xl">
                                Voir Projet
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="market" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Market Projets</h2>
                          <p className="max-w-[600px] text-white/80">
                            Découvrez des opportunités de financement, partenariats et acquisitions.
                          </p>
                        </div>
                        <Button className="w-fit rounded-xl bg-white text-purple-700 hover:bg-white/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Publier un Projet
                        </Button>
                      </div>
                    </motion.div>
                  </section>

                  <Tabs defaultValue="financement" className="w-full">
                    <TabsList className="grid w-full max-w-[450px] grid-cols-3 rounded-xl p-1">
                      <TabsTrigger value="financement" className="rounded-xl">
                        Financement
                      </TabsTrigger>
                      <TabsTrigger value="partenaires" className="rounded-xl">
                        Partenaires
                      </TabsTrigger>
                      <TabsTrigger value="vente" className="rounded-xl">
                        À vendre
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="financement" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {marketProjects
                          .filter((p) => p.type === "Financement")
                          .map((project) => (
                            <motion.div key={project.title} whileHover={{ scale: 1.02, y: -5 }}>
                              <Card className="rounded-xl hover:border-primary/50 transition-all duration-300">
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <Badge className="rounded-xl bg-green-500">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      Financement
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {project.dueDate}
                                    </div>
                                  </div>
                                  <CardTitle className="mt-2">{project.title}</CardTitle>
                                  <CardDescription>Par {project.creator}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {project.location}
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-2xl font-bold text-green-600">{project.amount}</span>
                                    <span className="text-muted-foreground">sur {project.goal}</span>
                                  </div>
                                  <Progress value={project.progress} className="h-2 rounded-xl" />
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{project.backers} contributeurs</span>
                                    <span>{project.progress}% atteint</span>
                                  </div>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                  <Button variant="secondary" className="flex-1 rounded-xl">
                                    Contribuer
                                  </Button>
                                  <Button variant="outline" size="icon" className="rounded-xl bg-transparent">
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="partenaires" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {marketProjects
                          .filter((p) => p.type === "Partenaires")
                          .map((project) => (
                            <Card key={project.title} className="rounded-xl">
                              <CardHeader>
                                <Badge className="rounded-xl bg-blue-500">
                                  <HandshakeIcon className="h-3 w-3 mr-1" />
                                  Partenariat
                                </Badge>
                                <CardTitle className="mt-2">{project.title}</CardTitle>
                                <CardDescription>Par {project.creator}</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {project.location}
                                </div>
                                <div className="rounded-xl bg-muted p-3">
                                  <p className="text-sm font-medium">Recherche:</p>
                                  <p className="text-sm text-muted-foreground">{project.seeks}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {project.responses} réponses
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button variant="secondary" className="w-full rounded-xl">
                                  Proposer Partenariat
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="vente" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {marketProjects
                          .filter((p) => p.type === "À vendre")
                          .map((project) => (
                            <Card key={project.title} className="rounded-xl">
                              <CardHeader>
                                <Badge className="rounded-xl bg-amber-500">
                                  <BadgeDollarSign className="h-3 w-3 mr-1" />À vendre
                                </Badge>
                                <CardTitle className="mt-2">{project.title}</CardTitle>
                                <CardDescription>Par {project.creator}</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {project.location}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-2xl font-bold text-amber-600">{project.amount}</p>
                                    <p className="text-xs text-muted-foreground">{project.shares} de l'entreprise</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Eye className="h-3 w-3" />
                                  {project.interested} personnes intéressées
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button variant="secondary" className="w-full rounded-xl">
                                  Manifester Intérêt
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="parametres" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-xl bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3">
                        <h2 className="text-3xl font-bold">Paramètres du Compte</h2>
                        <p className="max-w-[600px] text-white/80">Gérez votre profil, sécurité et préférences.</p>
                      </div>
                    </motion.div>
                  </section>

                  <Tabs defaultValue="profil" className="w-full">
                    <TabsList className="grid w-full max-w-[600px] grid-cols-4 rounded-xl p-1">
                      <TabsTrigger value="profil" className="rounded-xl">
                        Profil
                      </TabsTrigger>
                      <TabsTrigger value="securite" className="rounded-xl">
                        Sécurité
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="rounded-xl">
                        Notifications
                      </TabsTrigger>
                      <TabsTrigger value="preferences" className="rounded-xl">
                        Préférences
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profil" className="space-y-4 mt-6">
                      <Card className="rounded-xl max-w-2xl">
                        <CardHeader>
                          <CardTitle>Informations du Profil</CardTitle>
                          <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src="/african-user.jpg" />
                              <AvatarFallback>MK</AvatarFallback>
                            </Avatar>
                            <Button variant="outline" className="rounded-xl bg-transparent">
                              Changer Photo
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nom complet</label>
                            <Input placeholder="Votre nom" className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Profession</label>
                            <Input placeholder="Artisan, Designer, etc." className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Localisation</label>
                            <Input placeholder="Ville, Pays" className="rounded-xl" />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="rounded-xl">Enregistrer les Modifications</Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>

                    <TabsContent value="securite" className="space-y-4 mt-6">
                      <Card className="rounded-xl max-w-2xl">
                        <CardHeader>
                          <CardTitle>Sécurité du Compte</CardTitle>
                          <CardDescription>Gérez votre mot de passe et paramètres de sécurité</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Mot de passe actuel</label>
                            <Input type="password" className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nouveau mot de passe</label>
                            <Input type="password" className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Confirmer mot de passe</label>
                            <Input type="password" className="rounded-xl" />
                          </div>
                          <div className="flex items-center justify-between rounded-xl border p-4">
                            <div className="flex items-center gap-3">
                              <Shield className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">Authentification à deux facteurs</p>
                                <p className="text-sm text-muted-foreground">Sécurité supplémentaire</p>
                              </div>
                            </div>
                            <Button variant="outline" className="rounded-xl bg-transparent">
                              Activer
                            </Button>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="rounded-xl">Mettre à Jour Sécurité</Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-4 mt-6">
                      <Card className="rounded-xl max-w-2xl">
                        <CardHeader>
                          <CardTitle>Préférences de Notifications</CardTitle>
                          <CardDescription>Choisissez comment vous voulez être notifié</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { title: "Nouveaux profils", desc: "Quand quelqu'un crée un profil dans votre région" },
                            { title: "Messages", desc: "Quand vous recevez un nouveau message" },
                            { title: "Projets", desc: "Mises à jour sur les projets que vous suivez" },
                            { title: "Newsletter", desc: "Actualités hebdomadaires de Nexus Connect" },
                          ].map((notif) => (
                            <div key={notif.title} className="flex items-center justify-between rounded-xl border p-4">
                              <div>
                                <p className="font-medium">{notif.title}</p>
                                <p className="text-sm text-muted-foreground">{notif.desc}</p>
                              </div>
                              <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                                Activé
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="preferences" className="space-y-4 mt-6">
                      <Card className="rounded-xl max-w-2xl">
                        <CardHeader>
                          <CardTitle>Préférences Générales</CardTitle>
                          <CardDescription>Personnalisez votre expérience</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Langue</label>
                            <select className="w-full rounded-xl border p-2">
                              <option>Français</option>
                              <option>English</option>
                              <option>Português</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Fuseau horaire</label>
                            <select className="w-full rounded-xl border p-2">
                              <option>GMT (Afrique de l'Ouest)</option>
                              <option>GMT+1 (Afrique Centrale)</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between rounded-xl border p-4">
                            <div>
                              <p className="font-medium">Visibilité du profil</p>
                              <p className="text-sm text-muted-foreground">Qui peut voir votre profil</p>
                            </div>
                            <select className="rounded-xl border p-2">
                              <option>Public</option>
                              <option>Réseau</option>
                              <option>Privé</option>
                            </select>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="rounded-xl">Enregistrer Préférences</Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
