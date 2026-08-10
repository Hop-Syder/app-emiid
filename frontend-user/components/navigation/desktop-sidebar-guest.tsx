/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation latérale pour ordinateur (Guest / Non connecté) avec icônes SVG Streamline
 * @created 2026-06-13
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
// Pas d'imports lucide-react nécessaires pour les éléments principaux
import Image from "next/image"

const publicNavItems = [
  { name: "Accueil", href: "/", svg: "/svg/Home.svg" },
  { name: "Annuaire", href: "/annuaire", svg: "/svg/Grid.svg" },
  { name: "Se connecter", href: "/login", svg: "/svg/Star-Badge--Streamline-Core-Gradient.svg" },
]

export function DesktopSidebarGuest() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[88px] hover:w-[240px] transition-all duration-300 z-50 flex-col bg-white/80 dark:bg-white/10 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 group shadow-2xl">
      {/* Logo */}
      <div className="h-24 flex items-center px-4 pt-4">
        <div className="relative w-14 h-14 min-w-[56px] flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 group-hover:bg-transparent group-hover:border-transparent transition-all">
          <Image
            src="/logo/icon.svg"
            alt="EmiID"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <span className="font-wordmark ml-4 font-black text-xl text-blue-500 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-tight">
          EmiID
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 flex flex-col gap-2 px-4 py-8">
        {publicNavItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link key={item.name} href={item.href} className="relative outline-none">
              <div
                className={`flex items-center h-12 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-active-indicator"
                    className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="w-14 flex items-center justify-center shrink-0">
                  <Image
                    src={item.svg}
                    alt={item.name}
                    width={20}
                    height={20}
                    className={cn(
                      "size-5 transition-all duration-300",
                      isActive
                        ? "opacity-100 scale-110 saturate-100 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                        : "opacity-45 scale-100 saturate-50 dark:saturate-25 group-hover:opacity-85 group-hover:scale-105 group-hover:saturate-100"
                    )}
                  />
                </div>
                <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
