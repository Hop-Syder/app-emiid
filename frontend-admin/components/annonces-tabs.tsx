/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Annonces : bascule entre l'annonce In-App (BroadcastClient — segments,
 *              programmation, taux de lecture) et la campagne Mailing (CampaignClient — SMTP).
 * @created 2026-07-12
 */

"use client"

import { useState } from "react"
import { Megaphone, Mail } from "lucide-react"
import { BroadcastClient } from "./broadcast-client"
import { CampaignClient } from "./campaign-client"

type Tab = "inapp" | "email"

export function AnnoncesTabs() {
  const [tab, setTab] = useState<Tab>("inapp")

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900/50">
        {([["inapp", "Annonce In-App", Megaphone], ["email", "Campagne Mailing", Mail]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-11 rounded-lg text-sm font-bold transition-colors ${
              tab === id
                ? "bg-white dark:bg-slate-800 text-[#013ff4] dark:text-[#3a6bff] shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "inapp" ? <BroadcastClient /> : <CampaignClient emailOnly />}
    </div>
  )
}
