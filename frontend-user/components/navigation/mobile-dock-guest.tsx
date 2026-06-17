/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation mobile flottante (Guest / Non connecté) avec icônes SVG Streamline
 * @created 2026-06-13
 * @updated 2026-06-17
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const publicNavItems = [
  { name: "Accueil", href: "/", svg: "/svg/Home.svg" },
  { name: "Annuaire", href: "/annuaire", svg: "/svg/Grid.svg" },
  { name: "Se connecter", href: "/login", svg: "/svg/Star-Badge--Streamline-Core-Gradient.svg" },
]

export function MobileDockGuest() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm flex flex-col gap-3">
      {/* DOCK PRINCIPAL DE NAVIGATION */}
      <div className="relative flex items-center justify-around h-16 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-full px-2 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.5)] w-full">
        {/* Lueur interne globale */}
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

        {publicNavItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="relative flex flex-col items-center justify-center w-12 h-12 outline-none group animate-in fade-in duration-300"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-guest-active-indicator"
                  className="absolute inset-0 bg-blue-600/20 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              
              <img
                src={item.svg}
                alt={item.name}
                className={cn(
                  "size-5 transition-all duration-300 z-10",
                  isActive
                    ? "opacity-100 scale-110 saturate-100 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                    : "opacity-45 scale-100 saturate-50 dark:saturate-25 group-hover:opacity-85 group-hover:scale-105 group-hover:saturate-100"
                )}
              />

              {isActive && (
                <motion.div
                  layoutId="mobile-guest-active-dot"
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
