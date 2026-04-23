/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Mise en page principale (Layout) du Dashboard Admin
 * @created 2026-03-12
 * @updated 2026-03-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import {
    Users,
    LayoutDashboard,
    Image as ImageIcon,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    MessageSquare
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { AdminSessionProfile } from "@/lib/supabase/server"

interface AdminLayoutProps {
    children: React.ReactNode
    adminProfile: AdminSessionProfile
}

export function AdminLayout({ children, adminProfile }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const adminName = [adminProfile.firstName, adminProfile.lastName].filter(Boolean).join(" ") || "Admin EmiID"
    const adminInitials = adminName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("") || "AD"

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const menuItems = [
        { title: "Dashboard", icon: LayoutDashboard, href: "/" },
        { title: "Utilisateurs", icon: Users, href: "/users" },
        { title: "Messagerie & Litiges", icon: MessageSquare, href: "/messages" },
        { title: "Modération Galeries", icon: ImageIcon, href: "/moderation/galerie" },
        { title: "Paramètres", icon: Settings, href: "/settings" },
    ]

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-900">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                className="relative z-30 flex flex-col bg-white border-r border-slate-200 shadow-sm"
            >
                <div className="flex items-center gap-3 p-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                        N
                    </div>
                    {sidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent"
                        >
                            EmiID Admin
                        </motion.span>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-medium text-sm"
                                    >
                                        {item.title}
                                    </motion.span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-medium text-sm" onClick={() => void handleLogout()}>
                        <LogOut className="h-5 w-5" />
                        {sidebarOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                            <Menu className="h-5 w-5 text-slate-500" />
                        </button>
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher des données..."
                                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2.5 hover:bg-slate-50 rounded-xl transition-all group">
                            <Bell className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-1"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold">{adminName}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{adminProfile.role || "Administrateur"}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm">
                                {adminInitials}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    )
}
