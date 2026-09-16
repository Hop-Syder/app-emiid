/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte Séquestre Garanti EmiID — Protection financière client/prestataire.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Info } from "lucide-react"
import type { Mission } from "@/types/missions"

interface EscrowCardProps {
  mission: Mission
  isClient: boolean
}

export function EscrowCard({ mission, isClient }: EscrowCardProps) {
  const escrowAmount =
    mission.escrow_amount || mission.budget_max || mission.budget_min || 0

  const isFunded = mission.escrow_status === "FUNDED"
  const isReleased = mission.escrow_status === "RELEASED"
  const isRefunded = mission.escrow_status === "REFUNDED"

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#000616] via-[#021136] to-[#000616] p-6 text-white shadow-xl md:p-8">
      {/* Halos de lumière */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#03b3f8]/20 blur-3xl" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03b3f8]">
            <ShieldCheck className="h-4 w-4" />
            <span>Séquestre Garanti EmiID</span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isReleased
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : isFunded
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : isRefunded
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}
          >
            {isReleased
              ? "Fonds libérés au prestataire"
              : isFunded
              ? "Fonds consignés sous séquestre"
              : isRefunded
              ? "Fonds remboursés au client"
              : "En attente de consignation"}
          </span>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-baseline">
          <div>
            <p className="text-sm text-slate-400">Montant sous garantie financière</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-black text-white md:text-4xl">
                {escrowAmount.toLocaleString("fr-FR")}
              </span>
              <span className="text-sm font-bold text-[#03b3f8]">FCFA</span>
            </div>
          </div>

          <p className="max-w-xs text-xs md:text-sm leading-relaxed text-slate-300">
            L'argent ne transite pas directement entre les mains du client et du prestataire : il est consigné sur un compte séquestre tiers indépendant et versé uniquement après satisfaction mutuelle.
          </p>
        </div>

        {/* Détails de fonctionnement */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span><strong>100% protégé</strong> contre les abandons de chantier ou les défauts de paiement.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span><strong>Zéro commission</strong> déduite sur le montant du travail convenu.</span>
          </div>
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#03b3f8]" />
            <span><strong>Arbitrage EmiID</strong> sous 48h en cas de contestation ou litige avéré.</span>
          </div>
        </div>

        {/* Bouton FedaPay (Désactivé) */}
        {isClient && !isFunded && !isReleased && (
          <div className="pt-2">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 text-xs font-bold text-slate-300 backdrop-blur-md transition-all sm:w-auto"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Consigner les fonds (Bientôt disponible via FedaPay)</span>
            </button>
            <p className="mt-1.5 text-xs text-slate-400">
              Passerelle FedaPay (Mobile Money MTN & Moov Bénin) en cours d'activation.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
