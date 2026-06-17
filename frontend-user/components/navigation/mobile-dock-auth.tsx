/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation mobile flottante (Auth / Connecté)
 * @created 2026-06-13
 * @updated 2026-06-17
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Home, MessageSquare, Settings, User, Users, UserPlus, LogOut, Bell, Wallet } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"

const privateNavItems = [
  { name: "Hub", href: "/dashboard-user", icon: Home },
  { name: "Annuaire", href: "/annuaire", icon: Users },
  { name: "Créer mon profil", href: "/creer-profil", icon: UserPlus },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profil", href: "/dashboard-user?view=profile", icon: User },
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
    <div 
      ref={dockRef}
      className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm flex flex-col gap-3"
    >
      {/* SOUS-MENU INTERACTIF FLOTTANT AU-DESSUS */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="flex items-center justify-around h-16 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-full px-4 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.6)] w-full"
          >
            {/* Lien Mon Profil Public */}
            <Link 
              href="/profil"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all outline-none"
            >
              <User className="size-3.5 text-blue-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">Profil</span>
            </Link>

            {/* Séparateur minimaliste */}
            <div className="h-5 w-px bg-white/10" />

            {/* Lien Portefeuille */}
            <Link 
              href="/portefeuille"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all outline-none"
            >
              <Wallet className="size-3.5 text-amber-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">Portefeuille</span>
            </Link>

            {/* Séparateur minimaliste */}
            <div className="h-5 w-px bg-white/10" />

            {/* Lien Paramètres */}
            <Link 
              href="/parametres"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all outline-none"
            >
              <Settings className="size-3.5 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">Paramètres</span>
            </Link>

            {/* Séparateur minimaliste */}
            <div className="h-5 w-px bg-white/10" />

            {/* Déconnexion */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all outline-none cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span className="text-[9px] font-black uppercase tracking-wider">Quitter</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DOCK PRINCIPAL DE NAVIGATION */}
      <div className="relative flex items-center justify-around h-16 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-full px-2 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.5)] w-full">
        {/* Lueur interne globale */}
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

        {privateNavItems.map((item) => {
          const isProfilButton = item.name === "Profil"
          const isActive = pathname === item.href && !isProfilButton
          
          // Rendu du bouton d'action pour le Profil (connecté)
          if (isProfilButton) {
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
                
                <item.icon 
                  className={`size-5 transition-colors duration-300 z-10 ${
                    showUserMenu ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                  }`} 
                />
                
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
              
              <item.icon
                className={`size-5 transition-colors duration-300 z-10 ${
                  isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />

              {item.href === "/notifications" && unreadCount > 0 && (
                <span
                  aria-label={`${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`}
                  className="absolute top-1.5 right-1.5 z-20 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-black text-white bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.7)] ring-2 ring-slate-900"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}

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
  )
}
