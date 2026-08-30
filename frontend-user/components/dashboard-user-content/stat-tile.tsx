/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant unitaire représentant une tuile de statistique (vues, abonnés) dans le cockpit.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatTileProps {
  icon: LucideIcon
  value: number
  label: string
  growth?: number
  tone: string
}

export function StatTile({ icon: Icon, value, label, growth, tone }: StatTileProps) {
  return (
    <div className="flex-1 min-w-[92px] rounded-2xl bg-card border border-border p-3.5 shadow-[0_2px_12px_rgb(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center", tone)}>
          <Icon className="h-4 w-4" />
        </span>
        {typeof growth === "number" && growth !== 0 && (
          <span className={cn("text-[10px] font-bold flex items-center gap-0.5", growth > 0 ? "text-emerald-600" : "text-rose-500")}>
            {growth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {growth > 0 ? "+" : ""}{growth}%
          </span>
        )}
      </div>
      <p className="text-xl font-black text-foreground mt-2 leading-none tabular-nums">{value.toLocaleString("fr-FR")}</p>
      <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}
