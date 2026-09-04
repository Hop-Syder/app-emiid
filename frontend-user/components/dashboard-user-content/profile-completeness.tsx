/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Complétude du profil — carte repliable.
 *
 *              Refonte du 04/09 : la carte se plie et se déplie. Repliée, elle
 *              tient sur une ligne (anneau + pourcentage + titre) ; dépliée, elle
 *              montre l'explication et l'action suivante. L'utilisateur qui a
 *              déjà compris le message peut ainsi la refermer, au lieu de la
 *              subir à chaque visite du tableau de bord.
 *
 *              Le pli par défaut suit l'état du profil : ouverte tant qu'il
 *              reste quelque chose à compléter (il y a une action à proposer),
 *              fermée une fois à 100 % — où la carte n'est même plus repliable,
 *              faute de contenu à révéler.
 * @created 2026-07-13
 * @updated 2026-09-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Bell, ChevronDown } from "lucide-react"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"

interface ProfileCompletenessProps {
  completion: number
  loading: boolean
  nextAction: { label: string; href: string } | null
}

export function ProfileCompleteness({ completion, loading, nextAction }: ProfileCompletenessProps) {
  const unreadCount = useUnreadNotifications()
  const isComplete = completion >= 100

  // Un profil complet n'a plus rien à révéler : ni explication, ni action.
  // La carte cesse alors d'être repliable — un chevron qui ouvre sur du vide
  // serait une promesse non tenue.
  const hasDetails = !isComplete

  const [open, setOpen] = useState(true)

  // `completion` vaut 0 au premier rendu (données non chargées) : figer le pli
  // à ce moment laisserait un profil déjà complet affiché déplié. On applique
  // donc le défaut une fois le chargement terminé — et plus jamais ensuite, pour
  // ne pas refermer sous les doigts de quelqu'un qui vient d'ouvrir la carte.
  const userToggled = useRef(false)
  useEffect(() => {
    if (loading || userToggled.current) return
    setOpen(!isComplete)
  }, [loading, isComplete])

  const toggle = () => {
    userToggled.current = true
    setOpen((v) => !v)
  }

  // Anneau de progression. Le rayon est réduit (22 au lieu de 26) pour que la
  // carte tienne sur une ligne une fois repliée.
  const R = 22
  const C = 2 * Math.PI * R
  const dash = C - (completion / 100) * C

  // Contenu de l'en-tête, identique qu'il soit cliquable ou non.
  const headerContent = (
    <>
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
            stroke={isComplete ? "#10b981" : "#013ff4"}
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
          {isComplete ? "Profil complet 🎉" : "Complétez votre profil"}
        </span>
      </span>

      {hasDetails && (
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      )}
    </>
  )

  return (
    <div className="rounded-2xl border border-border bg-muted/30 lg:w-[300px] shrink-0 overflow-hidden">
      {/* ── En-tête ───────────────────────────────────────────────────────
          Cliquable seulement quand il y a quelque chose à déplier. À 100 %,
          c'est une simple ligne de statut, sans interaction inutile. */}
      <div className="flex items-center gap-3 p-3">
        {hasDetails ? (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="profile-completeness-details"
            className="flex flex-1 items-center gap-3 min-w-0 text-left rounded-xl transition-colors hover:bg-muted/60 -m-1 p-1"
          >
            {headerContent}
          </button>
        ) : (
          <div className="flex flex-1 items-center gap-3 min-w-0">{headerContent}</div>
        )}

        {/* Accès aux notifications — mobile uniquement, à droite de l'en-tête.
            Il occupe l'espace laissé libre par le titre, et double
            volontairement le compteur du dock : ici, il est à portée de pouce
            au moment où l'utilisateur consulte l'état de son profil. */}
        <Link
          href="/notifications"
          aria-label={
            unreadCount > 0
              ? `Voir mes notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
              : "Voir mes notifications"
          }
          className="lg:hidden shrink-0 p-2.5 rounded-2xl bg-card border border-border/70 text-foreground hover:text-[#013ff4] hover:bg-[#013ff4]/10 active:scale-90 transition-all shadow-sm"
        >
          <span className="relative flex items-center justify-center">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                aria-hidden
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-sm"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
        </Link>
      </div>

      {/* ── Détail : explication + action suivante ────────────────────────── */}
      <AnimatePresence initial={false}>
        {hasDetails && open && (
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
