/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Vue d'ensemble du solde de crédits — Bento Card Premium EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Coins, Sparkles, ShieldCheck, Zap, Info } from "lucide-react"

interface CreditsOverviewProps {
  balance: number
  loading?: boolean
}

export function CreditsOverview({ balance, loading = false }: CreditsOverviewProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#000616] via-[#021136] to-[#000616] p-6 text-white shadow-2xl md:p-8">
      {/* Effet de brillance de fond */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#013ff4]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#03b3f8]/20 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Colonne gauche : Solde & Statut */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-[#03b3f8] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Moteur Missions Sécurisé</span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Votre Solde Disponible
          </p>

          <div className="flex items-baseline gap-3">
            {loading ? (
              <div className="h-12 w-28 animate-pulse rounded-2xl bg-white/10" />
            ) : (
              <span className="font-heading text-5xl font-black tracking-tight text-white md:text-6xl">
                {balance}
              </span>
            )}
            <span className="text-lg font-bold text-[#03b3f8]">
              {balance <= 1 ? "crédit" : "crédits"}
            </span>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Chaque candidature de mission consomme <strong className="text-white">1 crédit</strong>. Le plafond est strictement limité à <strong className="text-white">2 prestataires par mission</strong> pour vous garantir un taux de sélection exceptionnel et éradiquer le démarchage sauvage.
          </p>
        </div>

        {/* Colonne droite : Règles d'or & Sécurité */}
        <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md md:max-w-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-[#03b3f8]" />
            <span>Règles de consommation</span>
          </div>
          
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li className="flex items-start gap-1.5">
              <Zap className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
              <span><strong>3 crédits offerts</strong> à l'activation du compte.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Zap className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
              <span><strong>Remboursement garanti</strong> si le client annule sans sélectionner de candidat.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Info className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
              <span>Engagement partagé : zéro commission sur vos revenus de mission.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
