/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation mobile (Guest / non connecté) — design pro clair,
 *              aligné sur le dock connecté. Accueil, Annuaire + CTA « Se connecter ».
 * @created 2026-06-13
 * @updated 2026-08-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { House, Compass, LogIn, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const BRAND = "#013ff4"

export function MobileDockGuest() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`))

  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <nav
        aria-label="Navigation principale"
        className="pointer-events-auto flex w-full max-w-sm items-center gap-1 rounded-[26px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_12px_40px_-10px_rgba(15,23,42,0.28)] backdrop-blur-xl"
      >
        <GuestTab href="/" label="Accueil" icon={House} active={isActive("/")} />
        <GuestTab href="/annuaire" label="Annuaire" icon={Compass} active={isActive("/annuaire")} />

        <Link
          href="/login"
          className="ml-auto flex h-11 items-center gap-2 rounded-2xl bg-[#013ff4] px-5 text-sm font-bold text-white shadow-[0_8px_20px_-4px_rgba(1,63,244,0.5)] transition-transform active:scale-95"
        >
          <LogIn className="h-[18px] w-[18px]" />
          Se connecter
        </Link>
      </nav>
    </div>
  )
}

function GuestTab({ href, label, icon: Icon, active }: { href: string; label: string; icon: LucideIcon; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2 outline-none"
    >
      {active && (
        <motion.span
          layoutId="guest-dock-active"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="absolute inset-x-2 inset-y-1 -z-0 rounded-2xl bg-[#013ff4]/[0.08]"
        />
      )}
      <Icon
        className="relative h-[22px] w-[22px] transition-colors"
        color={active ? BRAND : "#94a3b8"}
        strokeWidth={active ? 2.4 : 2}
      />
      <span className={cn("relative text-[10px] font-semibold transition-colors", active ? "text-[#013ff4]" : "text-slate-400")}>
        {label}
      </span>
    </Link>
  )
}
