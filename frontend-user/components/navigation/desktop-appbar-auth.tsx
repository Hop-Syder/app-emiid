/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre supérieure de l'espace connecté (ordinateur uniquement).
 *
 *              La barre latérale dit *où l'on peut aller* ; celle-ci dit *où
 *              l'on est* et donne les gestes courants — chercher, voir ses
 *              notifications. Séparer les deux évite la capsule unique qui
 *              devait tout porter à la fois.
 *
 *              Elle commence après la barre latérale plutôt que de la
 *              surplomber : les deux se partagent l'écran, aucune ne flotte
 *              par-dessus le contenu qui défile.
 *
 *              Aucun rendu en dessous de `lg` : le mobile garde son dock.
 * @created 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"
import { useCommandPalette } from "@/components/command-palette-context"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"

/**
 * Intitulé de la page courante. Les chemins sont ceux de la barre latérale ;
 * un chemin inconnu ne casse rien, il n'affiche simplement pas de titre.
 */
const PAGE_TITLES: Record<string, string> = {
  "/dashboard-user": "Hub",
  "/annuaire": "Annuaire",
  "/messages": "Messages",
  "/notifications": "Notifications",
  "/portefeuille": "Portefeuille",
  "/parametres": "Paramètres",
  "/profil": "Mon profil",
  "/recherche": "Recherche",
  "/creer-profil": "Créer mon profil",
}

function pageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Sous-page : on remonte à la rubrique parente plutôt que d'afficher un
  // segment d'URL brut, souvent un identifiant.
  const parent = Object.keys(PAGE_TITLES).find((href) => pathname.startsWith(`${href}/`))
  return parent ? PAGE_TITLES[parent] : ""
}

export function DesktopAppBarAuth() {
  const pathname = usePathname()
  const { setOpen } = useCommandPalette()
  const unreadCount = useUnreadNotifications()
  const title = pageTitle(pathname)

  return (
    <header
      className="hidden lg:flex fixed inset-x-0 left-[var(--sidebar-w)] top-0 z-40 h-16 items-center gap-4 border-b border-border bg-card/85 px-6 2xl:px-8 backdrop-blur-xl transition-[left] duration-300 ease-out dark:border-slate-800 dark:bg-slate-950/85"
    >
      <h1 className="shrink-0 text-base font-black tracking-tight text-foreground dark:text-white">
        {title}
      </h1>

      {/* Déclencheur de la palette de commandes (Cmd + K) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mx-auto relative flex h-10 w-full max-w-md 2xl:max-w-xl items-center gap-2.5 rounded-2xl border border-border/80 bg-slate-100/70 hover:bg-card px-3.5 text-left outline-none transition-all duration-200 hover:border-[#013ff4]/50 hover:shadow-[0_0_20px_-5px_rgba(1,63,244,0.15)] focus-visible:ring-2 focus-visible:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-900/90 dark:hover:bg-slate-900 dark:hover:border-[#03b3f8]/50 dark:hover:shadow-[0_0_20px_-5px_rgba(3,179,248,0.2)]"
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-slate-200/50 group-hover:bg-[#013ff4]/10 group-hover:text-[#013ff4] text-slate-400 transition-colors dark:bg-slate-800 dark:group-hover:bg-[#013ff4]/20 dark:group-hover:text-[#03b3f8]">
          <Search className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110" />
        </div>
        <span className="flex-1 truncate text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors dark:text-slate-400 dark:group-hover:text-slate-200">
          Rechercher un profil, un métier, une page…
        </span>
        <kbd className="hidden shrink-0 items-center gap-0.5 rounded-lg border border-border bg-card px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 shadow-xs transition-all group-hover:border-[#013ff4]/40 group-hover:text-[#013ff4] xl:flex dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:group-hover:border-[#03b3f8]/40 dark:group-hover:text-[#03b3f8]">
          ⌘K
        </kbd>
      </button>

      <Link
        href="/notifications"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non lues` : "Notifications"}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#013ff4] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
      >
        <Bell className="h-[19px] w-[19px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </header>
  )
}
