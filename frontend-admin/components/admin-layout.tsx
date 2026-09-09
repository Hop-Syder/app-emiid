/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Mise en page principale (Layout) du Dashboard Admin avec nouveau logo
 * @created 2026-03-12
 * @updated 2026-09-09
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
    Bell,
    Search,
    X,
    MessageSquare,
    ShieldAlert,
    Flag,
    ScrollText,
    Megaphone,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { AdminSessionProfile } from "@/lib/supabase/server"
import type { ModerationCounts } from "@/lib/actions/admin"

interface AdminLayoutProps {
    children: React.ReactNode
    adminProfile: AdminSessionProfile
    moderationCounts?: ModerationCounts
}

type MenuItem = { title: string; icon: typeof Users; href: string; badge?: number; testId?: string }

export function AdminLayout({ children, adminProfile, moderationCounts }: AdminLayoutProps) {
    const [desktopCollapsed, setDesktopCollapsed] = useState(false)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
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

    const toggleNav = () => {
        const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
        if (isDesktop) {
            setDesktopCollapsed((v) => !v)
        } else {
            setMobileNavOpen((v) => !v)
        }
    }

    const counts = moderationCounts ?? { galleryPending: 0, reportsOpen: 0, reportsByType: { gallery: 0, message: 0, profile: 0 }, totalPending: 0 }

    const menuItems: MenuItem[] = [
        { title: "Dashboard", icon: LayoutDashboard, href: "/", testId: "nav-dashboard" },
        { title: "Utilisateurs", icon: Users, href: "/users", testId: "nav-users" },
        { title: "Messagerie & Litiges", icon: MessageSquare, href: "/messages", testId: "nav-messages" },
        { title: "Modération", icon: ShieldAlert, href: "/moderation", badge: counts.totalPending, testId: "nav-moderation-hub" },
        { title: "— Galeries", icon: ImageIcon, href: "/moderation/galerie", badge: counts.galleryPending, testId: "nav-moderation-gallery" },
        { title: "— Signalements", icon: Flag, href: "/moderation/signalements", badge: counts.reportsOpen, testId: "nav-moderation-reports" },
        { title: "Annonces", icon: Megaphone, href: "/annonces", testId: "nav-annonces" },
        { title: "Journal d'audit", icon: ScrollText, href: "/audit", testId: "nav-audit" },
        { title: "Paramètres", icon: Settings, href: "/settings", testId: "nav-settings" },
    ]

    const renderSidebarContent = (collapsed: boolean, onNavigate?: () => void) => (
        <>
            <div className={cn("flex items-center gap-3 p-4 h-20 shrink-0", collapsed ? "justify-center" : "px-6")}>
                <div className="w-10 h-10 bg-gradient-to-tr from-[#013ff4] to-[#03b3f8] rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-[#013ff4]/20 overflow-hidden shrink-0">
                    <Image
                        src="/logo/icon.svg"
                        alt="EmiID"
                        width={28}
                        height={28}
                        className="object-contain animate-pulse-slow"
                    />
                </div>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                    >
                        EmiID Admin
                    </motion.span>
                )}
            </div>

            <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    const isSubItem = item.title.startsWith("—")
                    const label = isSubItem ? item.title.replace(/^—\s*/, "") : item.title
                    const hasBadge = !!item.badge && item.badge > 0
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            data-testid={item.testId}
                            title={collapsed ? label : undefined}
                            onClick={onNavigate}
                            className={cn(
                                "relative flex items-center min-h-11 rounded-2xl transition-all duration-300 group",
                                collapsed ? "justify-center px-0" : "gap-3 px-3",
                                !collapsed && isSubItem && "ml-4",
                                isActive
                                    ? "bg-[#013ff4] text-white shadow-lg shadow-[#013ff4]/20"
                                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            )}
                        >
                            {/* Icône (+ pastille de compteur quand la sidebar est repliée) */}
                            <span className="relative shrink-0 flex items-center justify-center">
                                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                                {collapsed && hasBadge && (
                                    <span
                                        data-testid={`${item.testId}-badge`}
                                        className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold leading-none ring-2 ring-[#000616]"
                                    >
                                        {item.badge! > 9 ? "9+" : item.badge}
                                    </span>
                                )}
                            </span>

                            {!collapsed && (
                                <>
                                    <span className="font-medium text-sm flex-1 truncate">{label}</span>
                                    {hasBadge && (
                                        <span
                                            data-testid={`${item.testId}-badge`}
                                            className={cn(
                                                "inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold",
                                                isActive ? "bg-white text-[#013ff4]" : "bg-rose-500/20 text-rose-400",
                                            )}
                                        >
                                            {item.badge! > 99 ? "99+" : item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/[0.06] shrink-0">
                <button
                    data-testid="admin-logout-btn"
                    title={collapsed ? "Déconnexion" : undefined}
                    className={cn(
                        "flex items-center min-h-11 w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-2xl transition-colors font-medium text-sm",
                        collapsed ? "justify-center px-0" : "gap-3 px-4"
                    )}
                    onClick={() => void handleLogout()}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Déconnexion</span>}
                </button>
            </div>
        </>
    )

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground">
            {/* Backdrop du tiroir mobile */}
            <AnimatePresence>
                {mobileNavOpen && (
                    <motion.div
                        key="mobile-nav-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setMobileNavOpen(false)}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar — rail rétractable desktop (≥lg) */}
            <motion.aside
                initial={false}
                animate={{ width: desktopCollapsed ? 80 : 280 }}
                className="relative z-30 hidden lg:flex flex-col glass-sidebar border-r border-white/[0.06]"
            >
                {renderSidebarContent(desktopCollapsed)}
            </motion.aside>

            {/* Sidebar — tiroir off-canvas mobile (<lg) */}
            <AnimatePresence>
                {mobileNavOpen && (
                    <motion.aside
                        key="mobile-nav"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                        className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col glass-sidebar border-r border-white/[0.06] lg:hidden"
                    >
                        {renderSidebarContent(false, () => setMobileNavOpen(false))}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 glass-header border-b border-white/[0.06] px-3 sm:px-4 lg:px-6 flex items-center justify-between z-20 shrink-0">
                    {mobileSearchOpen ? (
                        <div className="flex items-center gap-2 w-full">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Rechercher des données..."
                                    className="w-full pl-10 pr-4 py-2 bg-white/[0.06] border-none rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[#013ff4]/30 focus:bg-white/10 transition-all outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setMobileSearchOpen(false)}
                                className="flex items-center justify-center min-h-11 min-w-11 hover:bg-white/[0.06] rounded-xl transition-colors shrink-0"
                                aria-label="Fermer la recherche"
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                <button
                                    onClick={toggleNav}
                                    className="flex items-center justify-center min-h-11 min-w-11 hover:bg-white/[0.06] rounded-xl transition-colors shrink-0"
                                    aria-label="Basculer la navigation"
                                    data-testid="admin-nav-toggle"
                                >
                                    <Menu className="h-5 w-5 text-slate-400" />
                                </button>
                                <div className="relative hidden lg:block">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher des données..."
                                        className="pl-10 pr-4 py-2 bg-white/[0.06] border-none rounded-xl text-sm w-64 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[#013ff4]/30 focus:bg-white/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                                <button
                                    onClick={() => setMobileSearchOpen(true)}
                                    className="flex items-center justify-center min-h-11 min-w-11 hover:bg-white/[0.06] rounded-xl transition-colors lg:hidden"
                                    aria-label="Rechercher"
                                >
                                    <Search className="h-5 w-5 text-slate-400" />
                                </button>
                                <Link href="/moderation" data-testid="header-moderation-link" className="relative flex items-center justify-center min-h-11 min-w-11 hover:bg-white/[0.06] rounded-xl transition-all group" title="Modération">
                                    <Bell className="h-5 w-5 text-slate-400 group-hover:text-white" />
                                    {counts.totalPending > 0 && (
                                        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full border-2 border-[#000616] bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                                            {counts.totalPending > 99 ? "99+" : counts.totalPending}
                                        </span>
                                    )}
                                </Link>
                                <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block"></div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-white">{adminName}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{adminProfile.role || "Administrateur"}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-gradient-to-tr from-[#013ff4] to-[#03b3f8] rounded-xl border border-white/10 flex items-center justify-center font-bold text-white shadow-md shadow-[#013ff4]/20 shrink-0">
                                        {adminInitials}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </header>

                {/* Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    )
}
