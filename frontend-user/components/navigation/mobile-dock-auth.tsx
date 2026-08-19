/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation mobile (dock) — design pro clair, aligné charte.
 *              4 destinations + bouton de recherche central (FAB) + feuille « Mon espace ».
 * @created 2026-06-13
 * @updated 2026-08-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  House, Compass, MessageCircle, User, Search,
  Wallet, SquarePen, Bell, Settings, LogOut, ChevronRight, type LucideIcon,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { cn } from "@/lib/utils"

const BRAND = "#013ff4"

interface DockItem {
  name: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: DockItem[] = [
  { name: "Accueil", href: "/dashboard-user", icon: House },
  { name: "Annuaire", href: "/annuaire", icon: Compass },
  { name: "Messages", href: "/messages", icon: MessageCircle },
]

export function MobileDockAuth() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const unreadCount = useUnreadNotifications()
  const { session, currentUser } = useCurrentUserProfile()

  const displayName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" ") || "Mon compte"
  const profileHref = session?.user?.id ? `/profil/${session.user.id}` : "/dashboard-user?view=profile"

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("emiid_pin_verified")
    router.push("/login")
  }

  // Fermeture au clic extérieur
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  // Fermeture au changement de route
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <div className="lg:hidden">
      {/* Voile de fond */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>

      <div
        ref={rootRef}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 px-4 pointer-events-none"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        {/* ── Feuille « Mon espace » ─────────────────────────────────── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_60px_-15px_rgba(15,23,42,0.35)]"
            >
              {/* En-tête profil */}
              <Link
                href={profileHref}
                className="flex items-center gap-3 border-b border-slate-100 p-4 transition-colors hover:bg-slate-50"
              >
                {currentUser?.avatar_url ? (
                  <Image
                    src={currentUser.avatar_url}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#013ff4]/10 ring-2 ring-slate-100">
                    <User className="h-6 w-6 text-[#013ff4]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">Voir mon profil public</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>

              {/* Actions */}
              <nav className="p-2">
                <MenuRow href="/portefeuille" icon={Wallet} label="Mon portefeuille" />
                <MenuRow href="/creer-profil" icon={SquarePen} label="Modifier mon profil" />
                <MenuRow href="/notifications" icon={Bell} label="Notifications" badge={unreadCount} />
                <MenuRow href="/parametres" icon={Settings} label="Paramètres" />

                <div className="my-1.5 h-px bg-slate-100" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-rose-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <LogOut className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm font-semibold text-rose-600">Se déconnecter</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Dock ───────────────────────────────────────────────────── */}
        <nav
          aria-label="Navigation principale"
          className="pointer-events-auto flex w-full max-w-sm items-stretch justify-between rounded-[26px] border border-slate-200/80 bg-white/95 px-2 shadow-[0_12px_40px_-10px_rgba(15,23,42,0.28)] backdrop-blur-xl"
        >
          {/* 2 items à gauche */}
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <DockTab key={item.href} item={item} active={isActive(item.href)} />
          ))}

          {/* FAB recherche (centre) */}
          <div className="relative flex w-16 shrink-0 items-start justify-center">
            <Link
              href="/recherche"
              aria-label="Rechercher"
              className="group absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#013ff4] text-white shadow-[0_10px_24px_-4px_rgba(1,63,244,0.6)] ring-[5px] ring-white transition-transform active:scale-95"
            >
              <span className="pointer-events-none absolute -inset-1 rounded-full bg-[#03b3f8]/30 blur-md" />
              <Search className="relative h-6 w-6" />
            </Link>
          </div>

          {/* Messages + Espace à droite */}
          <DockTab item={NAV_ITEMS[2]} active={isActive(NAV_ITEMS[2].href)} />

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Mon espace"
            aria-expanded={menuOpen}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 outline-none"
          >
            <span className="relative flex h-6 w-6 items-center justify-center">
              <User
                className="h-[22px] w-[22px] transition-colors"
                color={menuOpen ? BRAND : "#94a3b8"}
              />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className={cn("text-[10px] font-semibold transition-colors", menuOpen ? "text-[#013ff4]" : "text-slate-400")}>
              Espace
            </span>
          </button>
        </nav>
      </div>
    </div>
  )
}

// ── Onglet du dock ────────────────────────────────────────────────────
function DockTab({ item, active }: { item: DockItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 outline-none"
    >
      {active && (
        <motion.span
          layoutId="dock-active"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="absolute inset-x-2 inset-y-1.5 -z-0 rounded-2xl bg-[#013ff4]/[0.08]"
        />
      )}
      <Icon
        className="relative h-[22px] w-[22px] transition-colors"
        color={active ? BRAND : "#94a3b8"}
        strokeWidth={active ? 2.4 : 2}
      />
      <span className={cn("relative text-[10px] font-semibold transition-colors", active ? "text-[#013ff4]" : "text-slate-400")}>
        {item.name}
      </span>
    </Link>
  )
}

// ── Ligne du menu « Mon espace » ──────────────────────────────────────
function MenuRow({ href, icon: Icon, label, badge = 0 }: { href: string; icon: LucideIcon; label: string; badge?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-slate-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1 text-sm font-semibold text-slate-800">{label}</span>
      {badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </Link>
  )
}
