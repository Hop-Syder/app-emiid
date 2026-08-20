/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation pour ordinateur (Guest / Non connecté) — Concept Floating Island Navbar.
 *              Capsule flottante supérieure centrée avec logo, liens publics et CTAs d'inscription.
 * @created 2026-06-13
 * @updated 2026-08-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LogIn, UserPlus, Home, LayoutGrid, Search } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const publicNavItems = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Annuaire", href: "/annuaire", icon: LayoutGrid },
  { name: "Recherche", href: "/recherche", icon: Search },
]

export function DesktopSidebarGuest() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`))

  return (
    <div className="hidden lg:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 items-center justify-between w-[calc(100%-2rem)] max-w-5xl px-3 py-2 rounded-full border border-slate-200/90 dark:border-white/15 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-[0_16px_40px_rgba(15,23,42,0.18)] pointer-events-auto">
      {/* ── GAUCHE : Logo & Identité Brand ────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2.5 pl-2 pr-3 group outline-none shrink-0">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#013ff4] to-[#1e61ff] shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
          <Image
            src="/logo/icon.svg"
            alt="EmiID"
            width={24}
            height={24}
            className="object-contain brightness-0 invert"
          />
        </div>
        <span className="font-wordmark text-lg font-black tracking-tight text-slate-900 dark:text-white">
          Emi<span className="text-[#013ff4]">ID</span>
        </span>
      </Link>

      {/* ── CENTRE : Navigation publique ───────────────────────────────── */}
      <nav aria-label="Navigation Publique Desktop" className="flex items-center gap-1">
        {publicNavItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all outline-none group"
            >
              {active && (
                <motion.span
                  layoutId="desktop-guest-island-active"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-[#013ff4]/10 dark:bg-[#013ff4]/20 border border-[#013ff4]/20"
                />
              )}
              <Icon className={cn("h-4 w-4 transition-colors", active ? "text-[#013ff4]" : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white")} />
              <span className={cn("relative transition-colors", active ? "text-[#013ff4] font-black" : "text-slate-600 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white")}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── DROITE : Actions d'Onboarding & Login ──────────────────────── */}
      <div className="flex items-center gap-2 pr-1 shrink-0">
        <Link
          href="/creer-profil"
          className="flex h-9 items-center gap-1.5 px-4 rounded-full bg-[#013ff4] hover:bg-[#0135d0] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Créer mon profil</span>
        </Link>
        <Link
          href="/login"
          className="flex h-9 items-center gap-1.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition-all active:scale-95"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Se connecter</span>
        </Link>
      </div>
    </div>
  )
}

