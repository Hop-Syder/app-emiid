/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation mobile native (Dock style LinkedIn) — Pleine largeur, 
 *              zéro arrondi flottant, symétrique à 5 onglets, haute performance (60/120 FPS).
 *              Structure : Accueil, Réseau, Missions, Messages, Vous.
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
  X,
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
  const sheetRef = useRef<HTMLDivElement>(null)

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

  // Fermer la sheet au changement d'URL
  useEffect(() => {
    setAccountSheetOpen(false)
  }, [pathname])

  // Fermer au clic extérieur
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
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
      {/* Voile de fond pour la feuille de profil */}
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

      {/* ── Feuille profil « Vous » — Style Bottom Sheet LinkedIn ── */}
      <AnimatePresence>
        {accountSheetOpen && (
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-slate-200 bg-white pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            {/* Barre de glissement LinkedIn */}
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* En-tête profil LinkedIn */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                {currentUser?.avatar_url ? (
                  <Image
                    src={currentUser.avatar_url}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#013ff4]/10 text-[#013ff4]">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {displayName}
                  </p>
                  <Link
                    href={profileHref}
                    className="inline-block text-xs font-semibold text-[#013ff4] hover:underline dark:text-[#03b3f8]"
                  >
                    Voir le profil
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAccountSheetOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu des options EmiID */}
            <div className="space-y-0.5 px-2 py-2">
              <SheetItem
                href="/credits"
                icon={Coins}
                label="Mes abonnements"
                desc="Crédits missions & offre Pro"
              />
              <SheetItem
                href="/parrainage"
                icon={HeartHandshake}
                label="Parrainage & Réseau"
                desc="Cooptez l'excellence"
              />
              <SheetItem
                href="/portefeuille"
                icon={Wallet}
                label="Portefeuille & Gains"
                desc="Historique & retraits"
              />
              <SheetItem
                href="/parametres"
                icon={Settings}
                label="Préférences & Paramètres"
                desc="Sécurité, PIN & compte"
              />

              <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-bold">Se déconnecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Barre de Navigation Basse Style LinkedIn (Pleine largeur, sans arrondis) ── */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 h-[54px] w-full border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          height: "calc(54px + env(safe-area-inset-bottom))",
        }}
      >
        {/* 4 Onglets Principaux */}
        {tabs.map((tab) => {
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
              {/* Ligne indicatrice active supérieure façon LinkedIn */}
              {active && (
                <span className="absolute top-0 inset-x-3 h-[2px] bg-slate-900 dark:bg-white" />
              )}

              <div className="relative">
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.4 : 1.8}
                />

                {/* Badge de notification */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "mt-0.5 text-[10px] tracking-tight",
                  active ? "font-bold text-slate-900 dark:text-white" : "font-normal text-slate-500 dark:text-slate-400"
                )}
              >
                {tab.name}
              </span>
            </Link>
          )
        })}

        {/* 5ème Onglet : Vous (Me) */}
        <button
          type="button"
          onClick={() => setAccountSheetOpen((prev) => !prev)}
          aria-label="Mon profil et options"
          aria-expanded={accountSheetOpen}
          className={cn(
            "relative flex flex-col items-center justify-center pt-1 pb-1.5 transition-colors select-none",
            accountSheetOpen
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          {/* Ligne indicatrice active supérieure façon LinkedIn */}
          {accountSheetOpen && (
            <span className="absolute top-0 inset-x-3 h-[2px] bg-slate-900 dark:bg-white" />
          )}

          <div className="relative">
            {currentUser?.avatar_url ? (
              <Image
                src={currentUser.avatar_url}
                alt={displayName}
                width={20}
                height={20}
                className={cn(
                  "h-5 w-5 rounded-full object-cover ring-1",
                  accountSheetOpen
                    ? "ring-2 ring-slate-900 dark:ring-white"
                    : "ring-slate-300 dark:ring-slate-700"
                )}
              />
            ) : (
              <User
                className="h-5 w-5"
                strokeWidth={accountSheetOpen ? 2.4 : 1.8}
              />
            )}
          </div>

          <span
            className={cn(
              "mt-0.5 text-[10px] tracking-tight",
              accountSheetOpen
                ? "font-bold text-slate-900 dark:text-white"
                : "font-normal text-slate-500 dark:text-slate-400"
            )}
          >
            Vous
          </span>
        </button>
      </nav>
    </div>
  )
}

function SheetItem({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string
  icon: typeof Home
  label: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        <div>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            {label}
          </p>
          <p className="text-[10px] text-slate-400">{desc}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
    </Link>
  )
}
