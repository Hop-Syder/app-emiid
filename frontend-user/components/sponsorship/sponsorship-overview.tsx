/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Vue d'ensemble du parrainage — Lien d'invitation & Jauge de strikes 0/2.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import {
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Users,
  Coins,
  Sparkles,
  Lock,
} from "lucide-react"

interface SponsorshipOverviewProps {
  referralLink: string
  sponsorStrikes: number
  isSuspended: boolean
  refereesCount: number
}

export function SponsorshipOverview({
  referralLink,
  sponsorStrikes,
  isSuspended,
  refereesCount,
}: SponsorshipOverviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erreur copie lien:", err)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#000616] via-[#021136] to-[#000616] p-6 text-white shadow-xl md:p-8">
      {/* Halos lumineux */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#013ff4]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#03b3f8]/20 blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* En-tête statut */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-[#03b3f8] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Parrainage à Engagement Partagé</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isSuspended
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : sponsorStrikes === 1
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {isSuspended ? (
              <>
                <Lock className="h-3.5 w-3.5 text-rose-400" />
                <span>Parrainage Suspendu (2/2 strikes)</span>
              </>
            ) : sponsorStrikes === 1 ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Vigilance (1/2 strike)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Statut Optimal (0/2 strike)</span>
              </>
            )}
          </div>
        </div>

        {/* Titre & Description */}
        <div>
          <h2 className="font-heading text-xl font-black text-white md:text-2xl">
            Cooptez l'excellence professionnelle
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-300">
            Invitez des professionnels dont vous garantissez personnellement le sérieux. Votre filleul reçoit 3 crédits offerts à l'inscription et vous gagnez 2 crédits dès sa première mission réussie.
          </p>
        </div>

        {/* Lien d'invitation */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Votre lien d'invitation personnel
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex-1 truncate rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-slate-200 backdrop-blur-md">
              {referralLink || "Chargement de votre lien unique..."}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={isSuspended || !referralLink}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#013ff4] to-[#03b3f8] px-5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  <span>Lien copié !</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copier le lien</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistiques clés Bento */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Users className="h-4 w-4 text-[#03b3f8]" />
              <span>Filleuls parrainés</span>
            </div>
            <p className="mt-2 font-heading text-2xl font-black text-white">
              {refereesCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Coins className="h-4 w-4 text-[#013ff4]" />
              <span>Crédits bonus gagnés</span>
            </div>
            <p className="mt-2 font-heading text-2xl font-black text-white">
              +{refereesCount * 2}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Jauge de manquements</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`font-heading text-2xl font-black ${sponsorStrikes > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {sponsorStrikes}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 2 strikes max</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
