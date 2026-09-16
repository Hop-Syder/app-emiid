/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dock de navigation mobile Visiteur — épuré, symétrique, haute performance (60/120 FPS).
 *              Style sobre inspiré de Linear et Stripe.
 *              Accès direct : Accueil, Pros, Missions et Connexion.
 * @created 2026-06-13
 * @updated 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Briefcase, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileDockGuest() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  const guestTabs = [
    {
      key: "home",
      name: "Accueil",
      href: "/",
      icon: Home,
    },
    {
      key: "pros",
      name: "Pros",
      href: "/annuaire",
      icon: Users,
    },
    {
      key: "missions",
      name: "Missions",
      href: "/missions",
      icon: Briefcase,
    },
  ]

  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <nav
        aria-label="Navigation principale"
        className="pointer-events-auto relative flex h-[62px] w-full max-w-[370px] items-center justify-between rounded-full border border-slate-200/80 bg-white/90 px-3 shadow-[0_8px_30px_rgb(0,0,0,0.07)] backdrop-blur-xl transition-all dark:border-slate-800/80 dark:bg-slate-950/90 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
        style={{ willChange: "transform" }}
      >
        {/* 3 Onglets Métier */}
        {guestTabs.map((tab) => {
          const active = isActive(tab.href)
          const Icon = tab.icon

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-1.5 outline-none transition-colors",
                active
                  ? "text-[#013ff4] dark:text-[#03b3f8]"
                  : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active && "scale-105"
                )}
                strokeWidth={active ? 2.3 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px] font-bold leading-none tracking-tight",
                  active
                    ? "text-[#013ff4] dark:text-[#03b3f8]"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                {tab.name}
              </span>

              {active && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[#013ff4] dark:bg-[#03b3f8]" />
              )}
            </Link>
          )
        })}

        {/* Bouton Connexion Sobre & Net */}
        <Link
          href="/login"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#013ff4] to-[#03b3f8] px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:opacity-95 active:scale-95"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Connexion</span>
        </Link>
      </nav>
    </div>
  )
}
