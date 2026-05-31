"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, MessageSquare, Wallet, Settings, User } from "lucide-react"

const navItems = [
  { name: "Hub", href: "/dashboard-user", icon: Home },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Portefeuille", href: "/portefeuille", icon: Wallet },
  { name: "Profil", href: "/dashboard-user?view=profile", icon: User },
  { name: "Paramètres", href: "/parametres", icon: Settings },
]

export function MobileDock() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <div className="relative flex items-center justify-around h-16 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-full px-2 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.5)]">
        
        {/* Lueur interne globale */}
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

        {navItems.map((item) => {
          // Simplification pour le mode demo:
          // Le bouton Profil redirige vers dashboard-user?view=profile ou similaire.
          const isActive = pathname === item.href && item.name !== "Profil"
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="relative flex flex-col items-center justify-center w-12 h-12 outline-none group"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active-indicator"
                  className="absolute inset-0 bg-blue-600/20 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              
              <item.icon 
                className={`size-5 transition-colors duration-300 z-10 ${
                  isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                }`} 
              />
              
              {/* Petit point d'activité */}
              {isActive && (
                <motion.div
                  layoutId="mobile-active-dot"
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
