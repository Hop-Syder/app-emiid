/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre supérieure de l'espace connecté (ordinateur uniquement).
 *
 *              La barre latérale dit *où l'on peut aller* ; celle-ci dit *où
 *              l'on est* et affiche les notifications. Séparer les deux évite
 *              la capsule unique qui devait tout porter à la fois.
 *
 *              Elle commence après la barre latérale plutôt que de la
 *              surplomber : les deux se partagent l'écran, aucune ne flotte
 *              par-dessus le contenu qui défile.
 *
 *              Aucun rendu en dessous de `lg` : le mobile garde son dock.
 * @created 2026-08-29
 * @updated 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
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
  const unreadCount = useUnreadNotifications()
  const title = pageTitle(pathname)

  return (
    <header
      className="hidden lg:flex fixed inset-x-0 left-[var(--sidebar-w)] top-0 z-40 h-16 items-center justify-between border-b border-border bg-card/85 px-6 2xl:px-8 backdrop-blur-xl transition-[left] duration-300 ease-out dark:border-slate-800 dark:bg-slate-950/85"
    >
      <h1 className="shrink-0 text-base font-black tracking-tight text-foreground dark:text-white">
        {title}
      </h1>

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
