/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation mobile (Guest / non connecté) — design Luxury Glass,
 *              courbures fluides (squircles rounded-[32px]), Accueil, Annuaire + CTA « Se connecter ».
 * @created 2026-06-13
 * @updated 2026-08-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LogIn } from "lucide-react"
import { HouseIcon, CompassIcon, type AnimatedIconHandle } from "@/components/icons/animated"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const BRAND = "#013ff4"

export function MobileDockGuest() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`))

  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.65rem)" }}
    >
      <nav
        aria-label="Navigation principale"
        className="pointer-events-auto flex w-full max-w-sm items-center gap-1 rounded-[32px] border border-slate-200/90 bg-white/95 p-2 shadow-[0_16px_36px_rgba(15,23,42,0.22)] backdrop-blur-2xl"
      >
        <GuestTab href="/" label="Accueil" icon={HouseIcon} active={isActive("/")} />
        <GuestTab href="/annuaire" label="Annuaire" icon={CompassIcon} active={isActive("/annuaire")} />

        <Link
          href="/login"
          className="ml-auto flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#013ff4] to-[#1e61ff] px-5 text-xs font-bold text-white shadow-[0_8px_20px_-4px_rgba(1,63,244,0.5)] transition-all active:scale-95 hover:shadow-[0_10px_24px_-4px_rgba(1,63,244,0.65)]"
        >
          <LogIn className="h-[17px] w-[17px]" />
          Se connecter
        </Link>
      </nav>
    </div>
  )
}

function GuestTab({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof HouseIcon; active: boolean }) {
  const iconRef = useRef<AnimatedIconHandle>(null)

  useEffect(() => {
    if (active) iconRef.current?.startAnimation()
  }, [active])

  return (
    <Link
      href={href}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onClick={() => iconRef.current?.startAnimation()}
      className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 outline-none group"
    >
      {active && (
        <motion.span
          layoutId="guest-dock-active"
          transition={{ type: "spring", stiffness: 450, damping: 35 }}
          className="absolute inset-x-1 inset-y-0.5 -z-0 rounded-2xl bg-[#013ff4]/[0.09]"
        />
      )}
      <Icon
        ref={iconRef}
        size={21}
        color={active ? BRAND : "#94a3b8"}
        strokeWidth={active ? 2.4 : 2}
        className="relative transition-transform group-hover:scale-105"
      />
      <span className={cn("relative text-[10px] font-bold transition-colors", active ? "text-[#013ff4]" : "text-slate-600 group-hover:text-slate-900")}>
        {label}
      </span>
    </Link>
  )
}

