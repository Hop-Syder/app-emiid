/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section verrouillée du hub public — même place, même titre que
 *              dans l'espace connecté, mais le contenu est hors de portée tant
 *              qu'on n'a pas de compte.
 *
 *              Le principe : montrer la forme sans livrer le fond. Un aperçu
 *              flouté derrière une invitation vaut mieux qu'une section
 *              absente — le visiteur voit ce qu'il gagnerait, au lieu de
 *              découvrir après inscription des rubriques qu'il ne soupçonnait
 *              pas.
 *
 *              L'aperçu ne contient aucune donnée réelle : ce sont des formes
 *              vides. Flouter de vraies informations n'est pas les protéger,
 *              elles resteraient lisibles dans le HTML.
 * @created 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import Link from "next/link"
import { Lock, ArrowRight, type LucideIcon } from "lucide-react"

interface LockedSectionProps {
  title: string
  icon: LucideIcon
  /** Teinte de la pastille du titre, pour rester accordé à l'espace connecté. */
  iconClassName?: string
  /** Ce que l'inscription débloque, dit en une phrase. */
  pitch: string
  /** Aperçu inerte affiché flouté derrière l'invitation. */
  children: React.ReactNode
}

export function LockedSection({
  title,
  icon: Icon,
  iconClassName = "bg-[#013ff4]/10 text-[#013ff4]",
  pitch,
  children,
}: LockedSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-row items-center justify-between gap-2 px-1 sm:px-2">
        <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800 sm:gap-3 sm:text-2xl">
          <span className={`shrink-0 rounded-xl p-1.5 sm:p-2 ${iconClassName}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span className="truncate">{title}</span>
        </h3>
      </div>

      <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white p-6 shadow-md sm:p-8">
        {/* Aperçu inerte. `aria-hidden` autant que `pointer-events-none` : un
            lecteur d'écran ne doit pas énoncer des formes vides, et rien ici ne
            doit pouvoir être cliqué ni sélectionné. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 select-none p-8 opacity-40 blur-[5px]"
        >
          {children}
        </div>

        <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-slate-200/40 bg-white/70 px-6 py-8 text-center shadow-2xl backdrop-blur-xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900">
            <Lock className="h-6 w-6 text-amber-400" />
          </span>

          <div className="space-y-1.5">
            <p className="text-lg font-black tracking-tight text-slate-900">Réservé aux membres</p>
            <p className="text-sm font-medium leading-relaxed text-slate-600">{pitch}</p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Link
              href="/creer-profil"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#013ff4] px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#013ff4]/25 transition-all hover:bg-[#0135d0] active:scale-95"
            >
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Silhouette du cockpit personnel : compteurs et barre de complétude. */
export function CockpitPreview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="h-8 w-8 rounded-xl bg-slate-200" />
            <div className="h-5 w-14 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-5">
        <div className="h-3 w-40 rounded bg-slate-200" />
        <div className="h-2.5 w-full rounded-full bg-slate-200">
          <div className="h-full w-2/3 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  )
}

/** Silhouette du fil d'activité : une pastille, deux lignes, répétées. */
export function ActivityPreview() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 rounded bg-slate-200" style={{ width: `${70 - i * 8}%` }} />
            <div className="h-2.5 w-24 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
