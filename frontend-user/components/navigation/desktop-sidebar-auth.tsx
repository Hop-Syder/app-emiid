/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre latérale de l'espace connecté (ordinateur uniquement).
 *
 *              Remplace la capsule flottante horizontale. Six rubriques tenaient
 *              à l'horizontale au prix d'étiquettes minuscules, et la barre
 *              flottait par-dessus le contenu qui défilait dessous. À la
 *              verticale, chaque rubrique dispose de sa ligne : les étiquettes
 *              redeviennent lisibles et l'ordre du produit se lit d'un coup.
 *
 *              Repliable, parce que les pages larges — annuaire, messages —
 *              ont besoin de la place. Le choix est mémorisé : c'est une
 *              préférence d'espace de travail, pas un réglage à refaire à
 *              chaque visite.
 *
 *              Rien ici ne s'affiche en dessous de `lg` : le mobile garde son
 *              dock.
 * @created 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  Home, LayoutGrid, MessageSquare, Bell, Wallet, Settings,
  LogOut, User, Plus, PanelLeftClose, PanelLeftOpen,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const SIDEBAR_STORAGE_KEY = "emiid:sidebar-collapsed"

const NAV_ITEMS = [
  { name: "Hub", href: "/dashboard-user", icon: Home },
  { name: "Annuaire", href: "/annuaire", icon: LayoutGrid },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Portefeuille", href: "/portefeuille", icon: Wallet },
  { name: "Paramètres", href: "/parametres", icon: Settings },
]

interface DesktopSidebarAuthProps {
  collapsed: boolean
  onToggle: () => void
}

export function DesktopSidebarAuth({ collapsed, onToggle }: DesktopSidebarAuthProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const unreadCount = useUnreadNotifications()

  const [profile, setProfile] = useState<{ avatar_url?: string | null; full_name?: string | null } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const metadata = session.user.user_metadata
      setProfile({
        avatar_url: metadata?.avatar_url || null,
        full_name: metadata?.full_name || session.user.email?.split("@")[0] || "Mon compte",
      })
    }
    void loadProfile()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("emiid_pin_verified")
    router.push("/login")
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <aside
      aria-label="Navigation principale"
      // La largeur vient de `--sidebar-w`, posée par NavigationShell : c'est
      // elle qui décale aussi l'app bar et le contenu. Un nombre en dur ici
      // les ferait diverger dès que la variable change de valeur.
      style={{ width: "var(--sidebar-w)" }}
      className="hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col border-r border-border bg-card transition-[width] duration-300 ease-out dark:border-slate-800 dark:bg-slate-950"
    >
      {/* ── Marque ─────────────────────────────────────────────────────── */}
      <div className={cn("flex h-16 shrink-0 items-center border-b border-border dark:border-slate-900", collapsed ? "justify-center px-0" : "px-4")}>
        <Link href="/dashboard-user" className="flex items-center gap-2.5 outline-none group">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#013ff4] to-[#1e61ff] shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
            <Image src="/logo/icon.svg" alt="" width={20} height={20} className="object-contain brightness-0 invert" />
          </span>
          {!collapsed && (
            <span className="font-wordmark text-lg font-black tracking-tight text-foreground dark:text-white">
              Emi<span className="text-[#013ff4]">ID</span>
            </span>
          )}
        </Link>
      </div>

      {/* ── Rubriques ──────────────────────────────────────────────────── */}
      <nav className="flex-1 space-y-1 2xl:space-y-1.5 overflow-y-auto px-3 2xl:px-4 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          const badge = item.href === "/notifications" ? unreadCount : 0

          return (
            <Link
              key={item.href}
              href={item.href}
              // `title` seulement une fois replié : autrement l'infobulle
              // redirait une étiquette déjà visible.
              title={collapsed ? item.name : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                // Les hauteurs et l'espacement suivent la place disponible :
                // sur un écran large, 44 px de haut et 12 px de gouttière
                // tassent une liste qui a de quoi s'étendre.
                "group relative flex h-11 2xl:h-12 items-center rounded-2xl text-[13.5px] 2xl:text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#013ff4]",
                collapsed ? "justify-center px-0" : "gap-3 2xl:gap-3.5 px-3 2xl:px-3.5",
                active
                  ? "text-[#013ff4]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 -z-0 rounded-2xl bg-[#013ff4]/[0.09]"
                />
              )}
              <span className="relative flex shrink-0 items-center justify-center">
                <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.4 : 2} />
                {badge > 0 && collapsed && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              {!collapsed && (
                <>
                  <span className="relative truncate">{item.name}</span>
                  {badge > 0 && (
                    <span className="relative ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Action principale ──────────────────────────────────────────── */}
      <div className="px-3 pb-2">
        <Link
          href="/creer-profil"
          title={collapsed ? "Créer mon profil" : undefined}
          className={cn(
            "flex h-11 items-center rounded-2xl bg-[#013ff4] text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-[#0135d0] active:scale-[0.98]",
            collapsed ? "justify-center px-0" : "gap-2 px-3",
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Créer mon profil</span>}
        </Link>
      </div>

      {/* ── Compte ─────────────────────────────────────────────────────── */}
      <div className="border-t border-border p-3 dark:border-slate-900">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center rounded-2xl outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-[#013ff4] dark:hover:bg-slate-900",
              collapsed ? "justify-center p-1" : "gap-2.5 p-2",
            )}
          >
            <Avatar className="h-9 w-9 shrink-0 rounded-full ring-2 ring-slate-200 dark:ring-slate-800">
              <AvatarImage src={profile?.avatar_url || "/profil/avatar.jpg"} />
              <AvatarFallback className="rounded-full bg-slate-900 text-xs font-bold text-white">
                {profile?.full_name?.substring(0, 2).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-xs font-bold text-foreground dark:text-white">
                  {profile?.full_name || "Mon compte"}
                </span>
                <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-[#013ff4]">
                  Membre certifié
                </span>
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" sideOffset={12} className="z-50 w-60 rounded-3xl border-slate-800 bg-slate-950/95 p-2 text-slate-100 shadow-2xl backdrop-blur-2xl">
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl text-xs font-semibold hover:bg-slate-900 focus:bg-slate-900">
              <Link href="/profil" className="flex items-center gap-2 py-2">
                <User className="h-4 w-4 text-blue-400" /> Voir mon profil public
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl text-xs font-semibold hover:bg-slate-900 focus:bg-slate-900">
              <Link href="/parametres" className="flex items-center gap-2 py-2">
                <Settings className="h-4 w-4 text-slate-400" /> Réglages du compte
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-slate-800/80" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-xl py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 focus:bg-rose-500/10">
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
          className={cn(
            "mt-2 flex h-9 w-full items-center rounded-xl text-xs font-bold text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#013ff4] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
            collapsed ? "justify-center px-0" : "gap-2 px-3",
          )}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && <span>Replier</span>}
        </button>
      </div>
    </aside>
  )
}
