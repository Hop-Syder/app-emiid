/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de forfait de crédits EmiID — Achat sécurisé via FedaPay (Bientôt disponible).
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Lock, Sparkles, Check } from "lucide-react"
import type { CreditPack } from "@/types/missions"

interface CreditPackCardProps {
  pack: CreditPack
}

export function CreditPackCard({ pack }: CreditPackCardProps) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${
        pack.popular
          ? "border-[#013ff4] bg-gradient-to-b from-blue-500/[0.07] via-card to-card shadow-xl shadow-blue-500/10 ring-2 ring-[#013ff4]/30"
          : "border-border bg-card shadow-sm"
      }`}
    >
      {pack.popular && (
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#013ff4] to-[#03b3f8] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            <Sparkles className="h-3 w-3" /> Recommandé
          </span>
        </div>
      )}

      <div>
        <h3 className="text-base font-bold text-foreground">
          {pack.label}
        </h3>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-heading text-3xl font-extrabold text-[#013ff4] dark:text-[#03b3f8]">
            {pack.credits}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">
            crédits de candidature
          </span>
        </div>

        <div className="mt-2 text-2xl font-black tracking-tight text-foreground">
          {pack.priceFcfa.toLocaleString("fr-FR")} <span className="text-sm font-bold text-muted-foreground">FCFA</span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Soit {pack.unitPriceFcfa} FCFA par opportunité ciblée
        </p>

        <div className="my-6 h-px bg-border" />

        <ul className="space-y-2.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Accès prioritaire aux missions publiées</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Plafond strict de 2 candidats concurrents</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Remboursement automatique en cas d'annulation</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Valable sans limite de durée</span>
          </li>
        </ul>
      </div>

      {/* Bouton désactivé avec mention explicite FedaPay */}
      <div className="mt-6 pt-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-4 text-xs font-bold text-muted-foreground shadow-xs transition-all"
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Bientôt disponible via FedaPay</span>
        </button>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Recharge Mobile Money (MTN & Moov Bénin) en cours de déploiement
        </p>
      </div>
    </div>
  )
}
