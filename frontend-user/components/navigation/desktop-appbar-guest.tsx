/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre supérieure du site public (ordinateur uniquement).
 *
 *              Pas de barre latérale ici, contrairement à l'espace connecté :
 *              les pages publiques sont des pages de présentation, construites
 *              pleine largeur — hero, mosaïque des métiers. Une colonne fixe à
 *              gauche leur prendrait 260 px sans rien offrir en échange, un
 *              visiteur non connecté n'ayant que trois destinations. Elle
 *              donnerait aussi l'impression d'une application à qui vient
 *              seulement découvrir le service.
 *
 *              La barre reprend en revanche les mêmes hauteur, teintes et
 *              rayons que celle de l'espace connecté : le passage de l'un à
 *              l'autre ne doit pas donner le sentiment de changer de produit.
 *
 *              Aucun rendu en dessous de `lg` : le mobile garde son dock.
 * @created 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, LayoutGrid, Search, LogIn, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Annuaire", href: "/annuaire", icon: LayoutGrid },
  { name: "Recherche", href: "/recherche", icon: Search },
]

export function DesktopAppBarGuest() {
  const pathname = usePathname()
  // L'accueil doit être comparé strictement : tout chemin commence par « / ».
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="hidden lg:flex fixed inset-x-0 top-0 z-50 h-16 items-center gap-6 border-b border-slate-200 bg-white/85 px-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <Link href="/" className="group flex shrink-0 items-center gap-2.5 outline-none">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#013ff4] to-[#1e61ff] shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
          <Image src="/logo/icon.svg" alt="" width={20} height={20} className="object-contain brightness-0 invert" />
        </span>
        <span className="font-wordmark text-lg font-black tracking-tight text-slate-900 dark:text-white">
          Emi<span className="text-[#013ff4]">ID</span>
        </span>
      </Link>

      <nav aria-label="Navigation publique" className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-10 items-center gap-2 rounded-2xl px-3.5 text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#013ff4]",
                active
                  ? "text-[#013ff4]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="appbar-guest-active"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 -z-0 rounded-2xl bg-[#013ff4]/[0.09]"
                />
              )}
              <Icon className="relative h-4 w-4" strokeWidth={active ? 2.4 : 2} />
              <span className="relative">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Link
          href="/login"
          className="flex h-10 items-center gap-1.5 rounded-2xl px-4 text-xs font-bold text-slate-700 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#013ff4] dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Se connecter</span>
        </Link>
        <Link
          href="/creer-profil"
          className="flex h-10 items-center gap-1.5 rounded-2xl bg-[#013ff4] px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 outline-none transition-all hover:bg-[#0135d0] focus-visible:ring-2 focus-visible:ring-[#013ff4] active:scale-95"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Créer mon profil</span>
        </Link>
      </div>
    </header>
  )
}
