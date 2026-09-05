/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Complétude du profil — carte repliable, qui s'efface une fois
 *              le profil complet.
 *
 *              Refonte du 04/09 : la carte se plie et se déplie. Repliée, elle
 *              tient sur une ligne (anneau + pourcentage + titre) ; dépliée, elle
 *              montre l'explication et l'action suivante. L'utilisateur qui a
 *              déjà compris le message peut ainsi la refermer, au lieu de la
 *              subir à chaque visite du tableau de bord.
 *
 *              Refonte du 05/09 : à 100 %, la carte ne s'affiche plus du tout —
 *              ni sur mobile, ni sur desktop. Une félicitation permanente n'est
 *              pas une information : elle occupe, à chaque visite, la place des
 *              signaux qui appellent une action. Le composant ne rend donc rien
 *              et laisse le reste du cockpit s'étendre.
 * @created 2026-07-13
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"

interface ProfileCompletenessProps {
  completion: number
  loading: boolean
  nextAction: { label: string; href: string } | null
}

/** Seuil à partir duquel il n'y a plus rien à compléter — ni à afficher. */
export const COMPLETE_THRESHOLD = 100

export function ProfileCompleteness({ completion, loading, nextAction }: ProfileCompletenessProps) {
  const [open, setOpen] = useState(true)

  // Profil complet : plus de carte. La condition exige `!loading` car
  // `completion` vaut 0 tant que les données ne sont pas là — sans ce garde-fou,
  // le test serait faux au premier rendu de tout le monde.
  if (!loading && completion >= COMPLETE_THRESHOLD) return null

  // Anneau de progression. Le rayon est réduit (22 au lieu de 26) pour que la
  // carte tienne sur une ligne une fois repliée.
  const R = 22
  const C = 2 * Math.PI * R
  const dash = C - (completion / 100) * C

  return (
    <div className="rounded-2xl border border-border bg-muted/30 lg:w-[300px] shrink-0 overflow-hidden">
      {/* ── En-tête : toujours cliquable, il y a toujours quelque chose à
          déplier — une carte visible est, par construction, incomplète. */}
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="profile-completeness-details"
          className="flex flex-1 items-center gap-3 min-w-0 text-left rounded-xl transition-colors hover:bg-muted/60 -m-1 p-1"
        >
          <span className="relative shrink-0" aria-hidden>
            <svg width="52" height="52" className="-rotate-90">
              <circle
                cx="26"
                cy="26"
                r={R}
                fill="none"
                strokeWidth="5"
                // currentColor + classe : l'anneau de fond suivait une couleur
                // figée (#e2e8f0), invisible en thème sombre.
                stroke="currentColor"
                className="text-border"
              />
              <circle
                cx="26"
                cy="26"
                r={R}
                fill="none"
                stroke="#013ff4"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={loading ? C : dash}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-foreground">
              {loading ? "…" : `${completion}%`}
            </span>
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-foreground truncate">
              Complétez votre profil
            </span>
          </span>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
      </div>

      {/* ── Détail : explication + action suivante ────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="profile-completeness-details"
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0">
              <p className="text-xs text-muted-foreground">
                Un profil complet apparaît bien plus haut dans l&apos;annuaire.
              </p>

              {nextAction && (
                <Link
                  href={nextAction.href}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#013ff4] hover:gap-2 transition-all"
                >
                  {nextAction.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
