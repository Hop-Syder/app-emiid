/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte pédagogique des règles du parrainage à engagement partagé.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { ShieldCheck, Scale, AlertTriangle, Sparkles, HeartHandshake } from "lucide-react"

export function SponsorshipRulesCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#013ff4] dark:text-[#03b3f8]">
        <Scale className="h-4 w-4" />
        <span>Charte d'engagement partagé</span>
      </div>

      <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
        Comment fonctionne le parrainage sur EmiID ?
      </h3>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Règle 1 */}
        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-[#013ff4] dark:text-[#03b3f8]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            1. Prime de bienvenue Filleul
          </h4>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Chaque professionnel certifié s'inscrivant via votre lien reçoit immédiatement <strong>3 crédits de candidature</strong> offerts pour se lancer sur la plateforme.
          </p>
        </div>

        {/* Règle 2 */}
        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            2. Bonus de fidélité Parrain
          </h4>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Dès que votre filleul mène à bien et livre sa première mission courte avec succès, vous recevez automatiquement <strong>2 crédits bonus</strong> sur votre portefeuille.
          </p>
        </div>

        {/* Règle 3 */}
        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            3. Règle des 2 manquements
          </h4>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Si un filleul commet un abandon de mission ou perd un litige arbitré pour travail non conforme, le parrain reçoit un strike. À <strong>2 strikes</strong>, la possibilité de parrainer est révoquée.
          </p>
        </div>
      </div>
    </div>
  )
}
