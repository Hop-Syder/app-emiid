/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dock de navigation mobile Visiteur (Style LinkedIn) — Pleine largeur, 
 *              zéro arrondi, 4 onglets symétriques et rapides.
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
      name: "Réseau",
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
    <nav
      aria-label="Navigation principale"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 h-[54px] w-full border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "calc(54px + env(safe-area-inset-bottom))",
      }}
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
              "relative flex flex-col items-center justify-center pt-1 pb-1.5 transition-colors select-none",
              active
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            {active && (
              <span className="absolute top-0 inset-x-3 h-[2px] bg-slate-900 dark:bg-white" />
            )}

            <Icon
              className="h-5 w-5"
              strokeWidth={active ? 2.4 : 1.8}
            />

            <span
              className={cn(
                "mt-0.5 text-[10px] tracking-tight",
                active
                  ? "font-bold text-slate-900 dark:text-white"
                  : "font-normal text-slate-500 dark:text-slate-400"
              )}
            >
              {tab.name}
            </span>
          </Link>
        )
      })}

      {/* 4ème Onglet : S'identifier */}
      <Link
        href="/login"
        className={cn(
          "relative flex flex-col items-center justify-center pt-1 pb-1.5 text-slate-500 hover:text-slate-900 transition-colors select-none dark:text-slate-400 dark:hover:text-white",
          isActive("/login") && "text-slate-900 dark:text-white"
        )}
      >
        {isActive("/login") && (
          <span className="absolute top-0 inset-x-3 h-[2px] bg-slate-900 dark:bg-white" />
        )}

        <LogIn className="h-5 w-5" strokeWidth={isActive("/login") ? 2.4 : 1.8} />

        <span
          className={cn(
            "mt-0.5 text-[10px] tracking-tight",
            isActive("/login")
              ? "font-bold text-slate-900 dark:text-white"
              : "font-normal text-slate-500 dark:text-slate-400"
          )}
        >
          Connexion
        </span>
      </Link>
    </nav>
  )
}
