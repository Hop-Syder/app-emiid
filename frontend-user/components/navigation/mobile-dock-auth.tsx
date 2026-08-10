/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation mobile flottante épurée à 4 icônes avec menu "Mon Espace" vertical.
 * @created 2026-06-13
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { User, LogOut, LucideIcon, Wallet, FileText, Bell, Settings } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  href: string
  svg?: string
  icon?: LucideIcon
}

const privateNavItems: NavItem[] = [
  { name: "Hub", href: "/dashboard-user", svg: "/svg/Home.svg" },
  { name: "Annuaire", href: "/annuaire", svg: "/svg/Grid.svg" },
  { name: "Messages", href: "/messages", svg: "/svg/MessageSquare.svg" },
  { name: "Espace", href: "/dashboard-user?view=profile", icon: User },
]

export function MobileDockAuth() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)

  const unreadCount = useUnreadNotifications()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("emiid_pin_verified")
    router.push("/login")
  }

  // Fermer le menu lors d'un clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fermer le menu lors du changement de route
  useEffect(() => {
    setShowUserMenu(false)
  }, [pathname])

  return (
    <>
      {/* Overlay de flou d'arrière-plan pour focaliser le menu */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[4px]"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </AnimatePresence>

      <div 
        ref={dockRef}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm flex flex-col gap-3"
      >
        {/* SOUS-MENU INTERACTIF FLOTTANT AU-DESSUS (VERTICAL & ERGONOMIQUE) */}
        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col gap-1 p-2 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[28px] shadow-[0_16px_32px_-8px_rgba(0,0,0,0.6)] w-full"
            >
              {/* Mon Portefeuille */}
              <Link 
                href="/portefeuille"
                className="flex items-center gap-3 text-slate-300 hover:text-white px-4 py-3 rounded-2xl hover:bg-white/5 transition-all outline-none"
              >
                <div className="flex items-center justify-center size-8 rounded-xl bg-white/5 text-blue-400">
                  <Wallet className="size-4" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">Mon Portefeuille</span>
              </Link>

              {/* Modifier mon Profil */}
              <Link 
                href="/creer-profil"
                className="flex items-center gap-3 text-slate-300 hover:text-white px-4 py-3 rounded-2xl hover:bg-white/5 transition-all outline-none"
              >
                <div className="flex items-center justify-center size-8 rounded-xl bg-white/5 text-emerald-400">
                  <FileText className="size-4" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">Modifier mon profil</span>
              </Link>

              {/* Notifications */}
              <Link 
                href="/notifications"
                className="flex items-center justify-between text-slate-300 hover:text-white px-4 py-3 rounded-2xl hover:bg-white/5 transition-all outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-xl bg-white/5 text-amber-400">
                    <Bell className="size-4" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[9px] font-black text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Paramètres */}
              <Link 
                href="/parametres"
                className="flex items-center gap-3 text-slate-300 hover:text-white px-4 py-3 rounded-2xl hover:bg-white/5 transition-all outline-none"
              >
                <div className="flex items-center justify-center size-8 rounded-xl bg-white/5 text-slate-400">
                  <Settings className="size-4" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">Paramètres</span>
              </Link>

              {/* Séparateur minimaliste */}
              <div className="h-px bg-white/5 my-1 mx-2" />

              {/* Déconnexion */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-400 hover:text-red-300 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all outline-none cursor-pointer"
              >
                <div className="flex items-center justify-center size-8 rounded-xl bg-red-500/10 text-red-400">
                  <LogOut className="size-4" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">Se déconnecter</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DOCK PRINCIPAL DE NAVIGATION (4 ICÔNES) */}
        <div className="relative flex items-center justify-around h-16 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-full px-2 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.5)] w-full">
          {/* Lueur interne globale */}
          <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

          {privateNavItems.map((item) => {
            const isProfilButton = item.name === "Espace"
            const isActive = pathname === item.href && !isProfilButton
            
            // Rendu du bouton d'action pour "Mon Espace"
            if (isProfilButton && item.icon) {
              const IconComponent = item.icon
              return (
                <button 
                  key={item.name} 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="relative flex flex-col items-center justify-center w-12 h-12 outline-none group"
                  aria-expanded={showUserMenu}
                  aria-label="Menu profil et paramètres"
                >
                  {showUserMenu && (
                    <motion.div
                      layoutId="mobile-auth-active-indicator"
                      className="absolute inset-0 bg-blue-600/20 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                  
                  <IconComponent 
                    className={`size-6 transition-colors duration-300 z-10 ${
                      showUserMenu ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                    }`} 
                  />
                  
                  {unreadCount > 0 && (
                    <span
                      aria-label={`${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`}
                      className="absolute top-1.5 right-1.5 z-20 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-black text-white bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.7)] ring-2 ring-slate-900"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  
                  {showUserMenu && (
                    <motion.div
                      layoutId="mobile-auth-active-dot"
                      className="absolute -bottom-1 size-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                </button>
              )
            }

            // Rendu des liens de navigation classiques
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className="relative flex flex-col items-center justify-center w-12 h-12 outline-none group animate-in fade-in duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-auth-active-indicator"
                    className="absolute inset-0 bg-blue-600/20 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                
                <Image
                  src={item.svg || ""}
                  alt={item.name}
                  width={26}
                  height={26}
                  className={cn(
                    "size-[25px] transition-all duration-300 z-10",
                    isActive
                      ? "opacity-100 scale-110 saturate-100 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                      : "opacity-60 scale-100 saturate-75 dark:saturate-50 group-hover:opacity-95 group-hover:scale-105 group-hover:saturate-100"
                  )}
                />

                {isActive && (
                  <motion.div
                    layoutId="mobile-auth-active-dot"
                    className="absolute -bottom-1 size-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
