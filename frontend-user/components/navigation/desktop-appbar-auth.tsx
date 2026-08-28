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

interface DesktopAppBarAuthProps {
  /** Largeur occupée par la barre latérale, pour que la barre démarre après. */
  offset: number
}

export function DesktopAppBarAuth({ offset }: DesktopAppBarAuthProps) {
  const pathname = usePathname()
  const { setOpen } = useCommandPalette()
  const unreadCount = useUnreadNotifications()
  const title = pageTitle(pathname)

  return (
    <header
      style={{ left: offset }}
      className="hidden lg:flex fixed inset-x-0 top-0 z-40 h-16 items-center gap-4 border-b border-slate-200 bg-white/85 px-6 backdrop-blur-xl transition-[left] duration-300 ease-out dark:border-slate-800 dark:bg-slate-950/85"
    >
      <h1 className="shrink-0 text-base font-black tracking-tight text-slate-900 dark:text-white">
        {title}
      </h1>

      {/* Déclencheur de la palette de commandes. Un bouton et non un champ :
          la saisie a lieu dans la palette, un vrai champ ici laisserait croire
          qu'on peut taper sans qu'il se passe rien. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group ml-auto flex h-10 w-full max-w-md items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 text-left outline-none transition-colors hover:border-slate-300 hover:bg-white focus-visible:ring-2 focus-visible:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
      >
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="flex-1 truncate text-xs font-semibold text-slate-400">
          Rechercher un métier, une personne, une ville…
        </span>
        <kbd className="hidden shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 xl:flex dark:border-slate-700 dark:bg-slate-950">
          ⌘K
        </kbd>
      </button>

      <Link
        href="/notifications"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non lues` : "Notifications"}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[#013ff4] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
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
