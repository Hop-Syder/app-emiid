/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de mission courte — Bento Grid EmiID avec jauge de sélection 2/2.
 * @created 2026-09-15
 * @updated 2026-10-09 — style « canal WhatsApp » : budget en badge vert, besoin ·
 *              lieu, description sur 2 lignes, bouton Postuler pleine largeur.
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Users2 } from "lucide-react"
import { OPEN_MISSION_STATUSES, type Mission, type MissionStatus } from "@/types/missions"

/** Libellés lisibles des statuts non ouverts (l'enum brut n'est pas pour l'utilisateur). */
const STATUS_LABEL: Partial<Record<MissionStatus, string>> = {
  DRAFT: "Brouillon",
  APPLICATIONS_CLOSED: "Candidatures closes",
  ASSIGNED: "Attribuée",
  IN_PROGRESS: "En cours",
  DELIVERED: "Livrée",
  COMPLETED: "Terminée",
  DISPUTED: "En litige",
  CANCELLED: "Annulée",
  EXPIRED: "Expirée",
}

interface MissionCardProps {
  mission: Mission
  /** Utilisateur connecté — distingue « Postuler » de « Voir les candidatures ». */
  currentUserId?: string | null
}

export function MissionCard({ mission, currentUserId }: MissionCardProps) {
  const router = useRouter()
  const isOwner = !!currentUserId && currentUserId === mission.client_id
  const hasApplied = !!mission.has_applied
  const appCount = mission.applications_count || 0
  const isFull = appCount >= 2
  const isOpen = OPEN_MISSION_STATUSES.includes(mission.status)

  // Comparaisons à `!= null` plutôt que des valeurs "truthy" : un budget à 0
  // FCFA (mission gracieuse) est légitime en base et ne doit pas être traité
  // comme "non renseigné".
  const formattedBudget =
    mission.budget_min != null && mission.budget_max != null
      ? `${mission.budget_min.toLocaleString("fr-FR")} - ${mission.budget_max.toLocaleString("fr-FR")} FCFA`
      : mission.budget_min != null
      ? `À partir de ${mission.budget_min.toLocaleString("fr-FR")} FCFA`
      : mission.budget_max != null
      ? `Jusqu'à ${mission.budget_max.toLocaleString("fr-FR")} FCFA`
      : "Budget à convenir"

  const createdDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(mission.created_at))

  const location = mission.location?.split(",")[0]?.trim()
  // Un badge court et lisible en 2 secondes : la borne haute si elle existe,
  // sinon la borne basse (« 50 000 FCFA » plutôt qu'une fourchette sur 2 lignes).
  const budgetBadge =
    mission.budget_max != null
      ? `${mission.budget_max.toLocaleString("fr-FR")} FCFA`
      : mission.budget_min != null
      ? `${mission.budget_min.toLocaleString("fr-FR")} FCFA`
      : null
  const canApply = isOpen && !isFull && !isOwner && !hasApplied

  return (
    <Link
      href={`/missions/${mission.id}`}
      className="group relative flex flex-col gap-3 bg-card p-4 transition-colors active:bg-muted/60 sm:rounded-2xl sm:border sm:border-border sm:p-6 sm:shadow-sm sm:hover:border-[#013ff4]/40 sm:hover:shadow-xl sm:hover:shadow-blue-500/5"
    >
      {/* Budget en évidence + statut */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-extrabold ${
            budgetBadge ? "bg-contact-strong text-white" : "bg-muted text-muted-foreground"
          }`}
          title={formattedBudget}
        >
          {budgetBadge ?? "Budget à convenir"}
        </span>

        {isOpen ? (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
              isFull ? "text-muted-foreground" : appCount === 1 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <Users2 className="h-3.5 w-3.5" />
            {isFull ? "Complet" : appCount === 1 ? "Dernière place" : "Ouverte"}
          </span>
        ) : (
          <span className="text-[11px] font-bold text-muted-foreground">
            {STATUS_LABEL[mission.status] ?? mission.status}
          </span>
        )}
      </div>

      {/* Besoin · lieu */}
      <h3 className="font-heading text-base font-bold leading-snug text-foreground group-hover:text-[#013ff4] dark:group-hover:text-[#03b3f8]">
        {mission.title}
        {location && <span className="font-semibold text-muted-foreground"> · {location}</span>}
      </h3>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{mission.description}</p>

      <span className="text-[11px] font-semibold text-muted-foreground">Publiée le {createdDate}</span>

      {/* Action pleine largeur — toute la carte reste cliquable. */}
      <span
        className={`mt-1 flex h-11 items-center justify-center rounded-xl border text-sm font-bold ${
          canApply
            ? "border-[#013ff4] text-[#013ff4] dark:border-[#03b3f8] dark:text-[#03b3f8]"
            : "border-border text-foreground"
        }`}
        onClick={(e) => {
          if (!canApply) return
          // Ouvre la mission avec la candidature déjà ouverte.
          e.preventDefault()
          router.push(`/missions/${mission.id}?postuler=1`)
        }}
      >
        {canApply ? (
          "Postuler"
        ) : hasApplied ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Check className="h-4 w-4 text-contact-fg" /> Candidature envoyée
          </span>
        ) : isOwner ? (
          "Voir les candidatures"
        ) : (
          "Consulter"
        )}
      </span>
    </Link>
  )
}
