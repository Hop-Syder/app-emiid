/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dock de navigation mobile épuré, symétrique et haute performance (60/120 FPS).
 *              Esthétique sobre et premium inspirée de Linear et Stripe.
 *              Accès direct aux piliers clés : Accueil, Pros, Missions, Messages et Compte.
 * @created 2026-06-13
 * @updated 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  User,
  Coins,
  HeartHandshake,
  Wallet,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { cn } from "@/lib/utils"

interface TabConfig {
  key: string
  name: string
  href: string
  icon: typeof Home
  badge?: number
}

export function MobileDockAuth() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [accountSheetOpen, setAccountSheetOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const unreadCount = useUnreadNotifications()
  const { session, currentUser } = useCurrentUserProfile()

  const displayName =
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" ") ||
    "Mon compte"
  const profileHref = session?.user?.id
    ? `/profil/${session.user.id}`
    : "/dashboard-user?view=profile"

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard-user" && pathname.startsWith(`${href}/`))

  const handleLogout = async () => {
    setAccountSheetOpen(false)
    await supabase.auth.signOut()
    sessionStorage.removeItem("emiid_pin_verified")
    router.push("/login")
  }

  // Fermer la sheet au changement de route
  useEffect(() => {
    setAccountSheetOpen(false)
  }, [pathname])

  // Fermer au clic extérieur
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setAccountSheetOpen(false)
      }
    }
    if (accountSheetOpen) {
      document.addEventListener("mousedown", onClickOutside)
    }
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [accountSheetOpen])

  const tabs: TabConfig[] = [
    {
      key: "home",
      name: "Accueil",
      href: "/dashboard-user",
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
    {
      key: "messages",
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: unreadCount,
    },
  ]

  return (
    <div className="lg:hidden">
      {/* Voile de fond pour la feuille compte */}
      <AnimatePresence>
        {accountSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setAccountSheetOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      <div
        ref={rootRef}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center px-4 pointer-events-none"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        {/* ── Feuille « Mon Compte » — Linear Minimalist Sheet ── */}
        <AnimatePresence>
          {accountSheetOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pointer-events-auto mb-3 w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/95"
            >
              {/* En-tête profil rapide */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <Link
                  href={profileHref}
                  className="flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  {currentUser?.avatar_url ? (
                    <Image
                      src={currentUser.avatar_url}
                      alt={displayName}
                      width={42}
                      height={42}
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#013ff4]/20"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#013ff4]/10 text-[#013ff4]">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      Gérer mon profil & badges
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setAccountSheetOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Raccourcis stratégiques */}
              <div className="mt-2 space-y-1">
                <AccountSheetRow
                  href="/credits"
                  icon={Coins}
                  label="Mes crédits missions"
                  desc="Solde & recharges garanties"
                  accent="text-amber-500"
                />
                <AccountSheetRow
                  href="/parrainage"
                  icon={HeartHandshake}
                  label="Parrainage & Réseau"
                  desc="Cooptation & bonus fidélité"
                  accent="text-emerald-500"
                />
                <AccountSheetRow
                  href="/portefeuille"
                  icon={Wallet}
                  label="Portefeuille & Gains"
                  desc="Paiements sécurisés MTN & Moov"
                  accent="text-[#013ff4]"
                />
                <AccountSheetRow
                  href="/parametres"
                  icon={Settings}
                  label="Paramètres du compte"
                  desc="Sécurité, mot de passe & PIN"
                />

                <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs font-bold">Se déconnecter</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Dock Flottant Symétrique Haute Performance (5 onglets équilibrés) ── */}
        <nav
          aria-label="Navigation principale"
          className="pointer-events-auto relative flex h-[62px] w-full max-w-[370px] items-center justify-between rounded-full border border-slate-200/80 bg-white/90 px-2 shadow-[0_8px_30px_rgb(0,0,0,0.07)] backdrop-blur-xl transition-all dark:border-slate-800/80 dark:bg-slate-950/90 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          style={{ willChange: "transform" }}
        >
          {/* 4 Onglets Métier Directs */}
          {tabs.map((tab) => {
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
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform",
                      active && "scale-105"
                    )}
                    strokeWidth={active ? 2.3 : 1.8}
                  />

                  {/* Badge de notifications */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-xs">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  )}
                </div>

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

                {/* Point lumineux actif subtil */}
                {active && (
                  <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[#013ff4] dark:bg-[#03b3f8]" />
                )}
              </Link>
            )
          })}

          {/* 5ème Onglet : Compte */}
          <button
            type="button"
            onClick={() => setAccountSheetOpen((prev) => !prev)}
            aria-label="Mon compte et options"
            aria-expanded={accountSheetOpen}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-1.5 outline-none transition-colors",
              accountSheetOpen
                ? "text-[#013ff4] dark:text-[#03b3f8]"
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
            )}
          >
            <div className="relative flex items-center justify-center">
              {currentUser?.avatar_url ? (
                <Image
                  src={currentUser.avatar_url}
                  alt={displayName}
                  width={20}
                  height={20}
                  className={cn(
                    "h-5 w-5 rounded-full object-cover ring-1 transition-all",
                    accountSheetOpen
                      ? "ring-2 ring-[#013ff4]"
                      : "ring-slate-200 dark:ring-slate-700"
                  )}
                />
              ) : (
                <User
                  className={cn(
                    "h-5 w-5 transition-transform",
                    accountSheetOpen && "scale-105"
                  )}
                  strokeWidth={accountSheetOpen ? 2.3 : 1.8}
                />
              )}
            </div>

            <span
              className={cn(
                "text-[10px] font-bold leading-none tracking-tight",
                accountSheetOpen
                  ? "text-[#013ff4] dark:text-[#03b3f8]"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              Compte
            </span>

            {accountSheetOpen && (
              <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[#013ff4] dark:bg-[#03b3f8]" />
            )}
          </button>
        </nav>
      </div>
    </div>
  )
}

function AccountSheetRow({
  href,
  icon: Icon,
  label,
  desc,
  accent,
}: {
  href: string
  icon: typeof Home
  label: string
  desc: string
  accent?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl p-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
            accent && "bg-slate-50 dark:bg-slate-800/80"
          )}
        >
          <Icon className={cn("h-4 w-4", accent)} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {label}
          </p>
          <p className="text-[10px] text-slate-400">{desc}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
    </Link>
  )
}
