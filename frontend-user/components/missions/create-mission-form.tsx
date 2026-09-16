/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Formulaire de création et de publication d'une mission courte EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MissionBriefAiCard } from "./mission-brief-ai-card"
import type { MissionBriefResult } from "@/lib/mission-brief-assistant"
import {
  ShieldCheck,
  Users2,
  Lock,
  ArrowRight,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

export function CreateMissionForm() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [budgetMin, setBudgetMin] = useState<number | "">("")
  const [budgetMax, setBudgetMax] = useState<number | "">("")
  const [deadline, setDeadline] = useState("")

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleApplyBrief = (brief: MissionBriefResult) => {
    setTitle(brief.title || "")
    setDescription(brief.description || "")
    setCategory(brief.category || "")
    if (brief.budgetMinXof !== null) setBudgetMin(brief.budgetMinXof)
    if (brief.budgetMaxXof !== null) setBudgetMax(brief.budgetMaxXof)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!title.trim()) {
      setErrorMessage("Veuillez indiquer un titre précis pour votre mission.")
      return
    }

    if (!description.trim() || description.trim().length < 20) {
      setErrorMessage("La description doit comporter au moins 20 caractères pour être exploitable.")
      return
    }

    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setErrorMessage("Vous devez être connecté pour publier une mission.")
        setLoading(false)
        return
      }

      const { data, error } = await (supabase as any)
        .from("missions")
        .insert({
          client_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category: category.trim() || null,
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
          currency: "XOF",
          deadline: deadline ? new Date(deadline).toISOString() : null,
          // "OPEN" n'existe pas dans l'enum public.mission_status (valeurs
          // réelles : DRAFT/PUBLISHED/APPLICATIONS_OPEN/... — voir
          // sql/migrations/20260915_missions_engine_phase1.sql:64-66).
          // PUBLISHED = état initial correct pour une mission publiée
          // directement (la policy RLS d'INSERT n'autorise que DRAFT ou
          // PUBLISHED à la création de toute façon).
          status: "PUBLISHED",
        })
        .select()
        .single()

      if (error) {
        console.error("[CreateMission] Erreur insertion:", error)
        setErrorMessage(error.message || "Impossible de publier la mission.")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/missions/${data.id}`)
      }, 1500)
    } catch (err: any) {
      console.error("[CreateMission] Exception:", err)
      setErrorMessage(err?.message || "Une erreur inattendue est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Assistant IA de cadrage */}
      <MissionBriefAiCard onApplyBrief={handleApplyBrief} />

      {/* 2. Formulaire principal */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-8"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Détails de la mission
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vérifiez et ajustez les informations avant la mise en ligne.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
              <p>{errorMessage}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <p>Mission publiée avec succès ! Redirection vers la fiche mission...</p>
            </div>
          )}

          {/* Titre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Titre de la mission <span className="text-[#013ff4]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Conception et pose de 2 portes en teck massif"
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-base md:text-sm text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
            />
          </div>

          {/* Catégorie indicative */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Corps de métier ou Domaine
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex : Menuiserie, Électricité, Graphisme, Développement..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-base md:text-sm text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
            />
          </div>

          {/* Cahier des charges / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Cahier des charges & Exigences détaillées <span className="text-[#013ff4]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détaillez le travail attendu, les matériaux, les contraintes de délai et le lieu d'intervention..."
              rows={5}
              required
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-base md:text-sm text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
            />
          </div>

          {/* Fourchette budgétaire et Échéance */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Budget indicatif Min (FCFA)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ex : 50000"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-base md:text-sm text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Budget indicatif Max (FCFA)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ex : 80000"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-base md:text-sm text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Échéance souhaitée
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-base md:text-sm text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Règles d'or EmiID */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-xs font-bold text-[#013ff4] dark:text-[#03b3f8]">
              <ShieldCheck className="h-4 w-4" />
              <span>Garanties du Réseau EmiID</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <Users2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#013ff4]" />
                <span><strong>2 candidats maximum</strong> pour vous épargner des heures de tri inutile.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span><strong>Séquestre garanti</strong> : paiement consigné jusqu'à votre validation finale.</span>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#013ff4] px-6 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-[#0135d0] active:scale-98 disabled:opacity-50 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <span>Publier la mission gratuitement</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
