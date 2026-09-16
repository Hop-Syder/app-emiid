/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Vue détaillée complète d'une mission : brief, séquestre, timeline et candidatures.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useMissionDetail } from "@/hooks/use-missions"
import { ApplyMissionModal } from "./apply-mission-modal"
import { MissionStatusTimeline } from "./mission-status-timeline"
import { EscrowCard } from "./escrow-card"
import { MissionApplicationsSection } from "./mission-applications-section"
import {
  ArrowLeft,
  Calendar,
  Banknote,
  Users2,
  ShieldCheck,
  User,
  Zap,
  Lock,
  RotateCw,
  AlertCircle,
} from "lucide-react"

interface MissionDetailContentProps {
  missionId: string
}

export function MissionDetailContent({ missionId }: MissionDetailContentProps) {
  const {
    mission,
    applications,
    hasApplied,
    loading,
    error,
    currentUserId,
    isClient,
    refetch,
  } = useMissionDetail(missionId)

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-8">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-44 w-full animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/50" />
        <div className="h-64 w-full animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/50" />
      </div>
    )
  }

  if (error || !mission) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 mx-auto dark:bg-rose-950/40">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
          Mission introuvable
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {error || "Cette opportunité n'existe plus ou a été retirée."}
        </p>
        <Link
          href="/missions"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#013ff4] px-5 py-2.5 text-xs font-bold text-white shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux missions</span>
        </Link>
      </div>
    )
  }

  const appCount = applications.length
  const isFull = appCount >= 2
  const isOpen = mission.status === "OPEN"
  const canApply = !isClient && isOpen && !isFull && !hasApplied
  const isAssignedFreelancer = currentUserId ? mission.assigned_to === currentUserId : false

  const formattedBudget =
    mission.budget_min && mission.budget_max
      ? `${mission.budget_min.toLocaleString("fr-FR")} - ${mission.budget_max.toLocaleString("fr-FR")} FCFA`
      : mission.budget_min
      ? `À partir de ${mission.budget_min.toLocaleString("fr-FR")} FCFA`
      : mission.budget_max
      ? `Jusqu'à ${mission.budget_max.toLocaleString("fr-FR")} FCFA`
      : "Budget à convenir"

  const createdDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(mission.created_at))

  const deadlineDate = mission.deadline
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(mission.deadline))
    : null

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      {/* Barre supérieure : retour & statut */}
      <div className="flex items-center justify-between">
        <Link
          href="/missions"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Toutes les missions</span>
        </Link>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Carte principale de la mission */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">
                Publiée le {createdDate}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#013ff4] dark:bg-blue-950/40 dark:text-[#03b3f8]">
                {mission.status}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isFull
                    ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    : appCount === 1
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <Users2 className="h-3 w-3" />
                <span>{appCount}/2 candidats</span>
              </span>
            </div>

            <h1 className="font-heading text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
              {mission.title}
            </h1>
          </div>

          {/* Bouton d'action Candidature */}
          {canApply && (
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#013ff4] to-[#03b3f8] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-95 active:scale-95"
            >
              <Zap className="h-4 w-4" />
              <span>Postuler (1 crédit)</span>
            </button>
          )}

          {hasApplied && (
            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Vous avez postulé</span>
            </span>
          )}
        </div>

        {/* Métadonnées : Budget, Échéance, Client */}
        <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40 sm:grid-cols-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Budget indicatif
            </span>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {formattedBudget}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Échéance souhaitée
            </span>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {deadlineDate || "Non précisée"}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Donneur d'ordre
            </span>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {mission.client?.full_name || "Membre EmiID"}
              </span>
              {mission.client?.identity_verified && (
                <ShieldCheck className="h-3.5 w-3.5 text-[#013ff4] dark:text-[#03b3f8]" />
              )}
            </div>
          </div>
        </div>

        {/* Cahier des charges complet */}
        <div className="mt-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cahier des charges & Description
          </h3>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            <p className="whitespace-pre-line">{mission.description}</p>
          </div>
        </div>
      </div>

      {/* 2. Suivi et Timeline */}
      <MissionStatusTimeline
        mission={mission}
        isClient={isClient}
        isAssignedFreelancer={isAssignedFreelancer}
        onActionSuccess={refetch}
      />

      {/* 3. Séquestre Garanti */}
      <EscrowCard mission={mission} isClient={isClient} />

      {/* 4. Candidatures */}
      <MissionApplicationsSection
        missionId={mission.id}
        applications={applications}
        isClient={isClient}
        canSelect={isOpen}
        onSelectSuccess={refetch}
      />

      {/* Modal de candidature */}
      <ApplyMissionModal
        missionId={mission.id}
        missionTitle={mission.title}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}
