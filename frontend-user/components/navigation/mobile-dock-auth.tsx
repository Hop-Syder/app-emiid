/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation mobile (dock) — Design Luxury Glass avec encoche concave SVG.
 *              Courbures fluides, bouton de recherche central encastré et feuille « Mon espace ».
 * @created 2026-06-13
 * @updated 2026-08-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Wallet, SquarePen, Bell, Settings, LogOut, ChevronRight, type LucideIcon,
} from "lucide-react"
import {
  HouseIcon, CompassIcon, MessageIcon, UserIcon, SearchIcon,
  type AnimatedIconHandle,
} from "@/components/icons/animated"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { cn } from "@/lib/utils"

const BRAND = "#013ff4"

/**
 * Silhouette du dock : coins arrondis et encoche centrale continue en courbes de Bézier C1.
 *
 * L'encoche est calculée selon des transitions Bézier fluides et symétriques
 * avec raccords horizontaux tangents aux bords (dx=0 aux sommets et au fond).
 * Le berceau épouse harmonieusement le bouton de recherche central (FAB)
 * pour donner l'impression qu'il émerge naturellement de la barre de navigation.
 *
 * Symétrie axiale autour de x = 180.
 */
const DOCK_PATH =
  "M 28,0 " +
  "L 134,0 " +
  "C 140,0 145,2.5 149,7 " +
  "C 154,12.5 164,35 180,35 " +
  "C 196,35 206,12.5 211,7 " +
  "C 215,2.5 220,0 226,0 " +
  "L 332,0 " +
  "C 347.5,0 360,12.5 360,28 " +
  "L 360,40 " +
  "C 360,55.5 347.5,68 332,68 " +
  "L 28,68 " +
  "C 12.5,68 0,55.5 0,40 " +
  "L 0,28 " +
  "C 0,12.5 12.5,0 28,0 " +
  "Z"

/**
 * Masque SVG de la couche de verre.
 */
const DOCK_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 68' preserveAspectRatio='none'%3E%3Cpath d='" +
  encodeURIComponent(DOCK_PATH) +
  "' fill='%23fff'/%3E%3C/svg%3E\")"

interface DockItem {
  name: string
  href: string
  icon: typeof HouseIcon
}

const NAV_ITEMS: DockItem[] = [
  { name: "Accueil", href: "/dashboard-user", icon: HouseIcon },
  { name: "Annuaire", href: "/annuaire", icon: CompassIcon },
  { name: "Messages", href: "/messages", icon: MessageIcon },
]

export function MobileDockAuth() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const unreadCount = useUnreadNotifications()
  const { session, currentUser } = useCurrentUserProfile()

  const searchRef = useRef<AnimatedIconHandle>(null)
  const userRef = useRef<AnimatedIconHandle>(null)

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
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[4px]"
          />
        )}
      </AnimatePresence>

      <div
        ref={rootRef}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 px-4 pointer-events-none"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.65rem)" }}
      >
        {/* ── Feuille « Mon espace » avec courbures ultra-douces (squircles) ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-[32px] border border-border/90 bg-card/95 p-1 pb-3 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.28)] backdrop-blur-2xl"
            >
              {/* Poignée d'entraînement (Drag handle) */}
              <div className="flex justify-center pt-2 pb-0.5">
                <span className="h-1 w-9 rounded-full bg-muted/80" />
              </div>

              {/* En-tête profil */}
              <Link
                href={profileHref}
                className="flex items-center gap-3 rounded-2xl border-b border-border p-3.5 transition-colors hover:bg-muted/80"
              >
                {currentUser?.avatar_url ? (
                  <Image
                    src={currentUser.avatar_url}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#013ff4]/20 shadow-sm"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#013ff4]/10 ring-2 ring-[#013ff4]/20">
                    <User className="h-6 w-6 text-[#013ff4]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground font-medium">Voir mon profil public</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>

              {/* Actions */}
              <nav className="p-1.5 space-y-0.5">
                <MenuRow href="/portefeuille" icon={Wallet} label="Mon portefeuille" />
                <MenuRow href="/creer-profil" icon={SquarePen} label="Modifier mon profil" />
                <MenuRow href="/notifications" icon={Bell} label="Notifications" badge={unreadCount} />
                <MenuRow href="/parametres" icon={Settings} label="Paramètres" />

                <div className="my-1.5 h-px bg-muted/80" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all hover:bg-rose-50/80 active:scale-[0.99]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 shadow-sm">
                    <LogOut className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm font-bold text-rose-600">Se déconnecter</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Dock avec découpe concave fluide (Notched SVG Curve) ──────── */}
        <div className="pointer-events-auto relative w-full max-w-sm h-[68px] filter drop-shadow-[0_16px_36px_rgba(15,23,42,0.22)]">
          {/* Couche de verre, découpée à la silhouette du dock.
              L'opacité ne descend pas plus bas : à 80 %, le texte de la page
              transparaissait et se mêlait aux libellés du dock, minuscules
              (10 px) et gris. Le flou d'arrière-plan ne peut pas rattraper
              cela, car `backdrop-filter` combiné à un masque n'est pas honoré
              par tous les moteurs mobiles — la lisibilité ne doit donc pas en
              dépendre. */}
          <div
            className="absolute inset-0 bg-card/95 backdrop-blur-2xl"
            style={{
              WebkitMaskImage: DOCK_MASK,
              maskImage: DOCK_MASK,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />

          {/* Contour net par-dessus le verre. vectorEffect évite que le trait
              soit étiré par preserveAspectRatio="none". */}
          <svg
            viewBox="0 0 360 68"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 h-full w-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <path
              d={DOCK_PATH}
              fill="none"
              stroke="rgba(226, 232, 240, 0.9)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Bouton de recherche encastré dans la courbure concave (FAB) */}
          <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-auto">
            <Link
              href="/recherche"
              aria-label="Rechercher"
              onMouseEnter={() => searchRef.current?.startAnimation()}
              onClick={() => searchRef.current?.startAnimation()}
              className="group relative flex h-13 w-13 h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-tr from-[#013ff4] to-[#1e61ff] text-white shadow-[0_8px_24px_-2px_rgba(1,63,244,0.65)] ring-[3.5px] ring-white transition-all active:scale-95 hover:scale-105"
            >
              <span className="pointer-events-none absolute -inset-1 rounded-full bg-[#03b3f8]/30 blur-md opacity-80 group-hover:opacity-100 transition-opacity" />
              <SearchIcon ref={searchRef} size={22} color="#ffffff" className="relative" />
            </Link>
          </div>

          {/* Navigation Items (4 items répartis autour de l'encoche centrale) */}
          <nav
            aria-label="Navigation principale"
            className="relative z-10 flex h-full w-full items-center justify-between px-2 pt-1"
          >
            {/* 2 items à gauche */}
            <DockTab item={NAV_ITEMS[0]} active={isActive(NAV_ITEMS[0].href)} />
            <DockTab item={NAV_ITEMS[1]} active={isActive(NAV_ITEMS[1].href)} />

            {/* Spacer central pour le FAB encastré */}
            <div className="w-14 shrink-0 pointer-events-none" />

            {/* Messages + Espace à droite */}
            <DockTab item={NAV_ITEMS[2]} active={isActive(NAV_ITEMS[2].href)} />

            <button
              onClick={() => { setMenuOpen((v) => !v); userRef.current?.startAnimation() }}
              onMouseEnter={() => userRef.current?.startAnimation()}
              aria-label="Mon espace"
              aria-expanded={menuOpen}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 outline-none group"
            >
              {menuOpen && (
                <motion.span
                  layoutId="dock-active-user"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-x-1.5 inset-y-1 -z-0 rounded-2xl bg-[#013ff4]/[0.09]"
                />
              )}
              <span className="relative flex h-6 w-6 items-center justify-center">
                <UserIcon
                  ref={userRef}
                  size={21}
                  color={menuOpen ? BRAND : "#94a3b8"}
                />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              <span className={cn("relative text-[10px] font-bold transition-colors", menuOpen ? "text-[#013ff4]" : "text-muted-foreground group-hover:text-foreground")}>
                Espace
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

// ── Onglet du dock ────────────────────────────────────────────────────
function DockTab({ item, active }: { item: DockItem; active: boolean }) {
  const Icon = item.icon
  const iconRef = useRef<AnimatedIconHandle>(null)

  useEffect(() => {
    if (active) iconRef.current?.startAnimation()
  }, [active])

  return (
    <Link
      href={item.href}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onClick={() => iconRef.current?.startAnimation()}
      className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 outline-none group"
    >
      {active && (
        <motion.span
          layoutId="dock-active"
          transition={{ type: "spring", stiffness: 450, damping: 35 }}
          className="absolute inset-x-1.5 inset-y-1 -z-0 rounded-2xl bg-[#013ff4]/[0.09]"
        />
      )}
      <Icon
        ref={iconRef}
        size={21}
        color={active ? BRAND : "#94a3b8"}
        strokeWidth={active ? 2.4 : 2}
        className="relative transition-transform group-hover:scale-105"
      />
      <span className={cn("relative text-[10px] font-bold transition-colors", active ? "text-[#013ff4]" : "text-muted-foreground group-hover:text-foreground")}>
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
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all hover:bg-muted active:scale-[0.99]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-foreground shadow-xs">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
      {badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-xs">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </Link>
  )
}

