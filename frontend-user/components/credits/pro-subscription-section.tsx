/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section « Abonnement Pro » de la page Mes Abonnements — grille
 *              tarifaire des forfaits Pro (réutilise useSubscription, source
 *              unique déjà utilisée par components/parametre-content/plan-section.tsx).
 *              La gestion complète (renouvellement auto, résiliation, factures)
 *              reste dans Paramètres pour ne pas dupliquer cette logique ici.
 * @created 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { Star, Sparkles, CreditCard, Loader2, Check, ArrowRight } from "lucide-react"
import { useSubscription, PLANS, formatFcfa, type PlanId } from "@/hooks/use-subscription"

export function ProSubscriptionSection() {
  const { subscription, isPro, loading, checkoutLoading, startCheckout } = useSubscription()
  const busy = checkoutLoading !== null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Abonnement Pro EmiID</h2>
          <p className="text-xs text-muted-foreground">
            Visibilité renforcée, badge vérifié et statistiques détaillées de votre profil public.
          </p>
        </div>
      </div>

      {isPro && !loading ? (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:flex-row sm:items-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Vous êtes déjà EmiID Pro</p>
              <p className="text-xs text-muted-foreground">
                {subscription?.endDate
                  ? `Actif jusqu'au ${new Date(subscription.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.`
                  : "Votre abonnement est actif."}
              </p>
            </div>
          </div>
          <Link
            href="/parametres"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
          >
            <span>Gérer mon abonnement</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(Object.keys(PLANS) as PlanId[]).map((planId) => {
            const plan = PLANS[planId]
            const isAnnual = planId === "PRO_ANNUAL"
            return (
              <div
                key={planId}
                className={`relative flex flex-col justify-between gap-5 rounded-3xl border p-6 shadow-xs transition-all ${
                  isAnnual ? "border-[#013ff4]/40 bg-[#013ff4]/[0.03]" : "border-border bg-card"
                }`}
              >
                {isAnnual && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-[#013ff4] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                    2 mois offerts
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-[#013ff4]" />
                    <span>{plan.label}</span>
                  </div>
                  <p className="mt-1 text-2xl font-black text-foreground">{formatFcfa(plan.amount)}</p>
                  <p className="text-[11px] font-medium text-muted-foreground">{plan.period}</p>
                </div>
                <button
                  type="button"
                  onClick={() => startCheckout(planId)}
                  disabled={busy}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    isAnnual
                      ? "bg-[#013ff4] text-white shadow-md shadow-blue-500/25 hover:bg-[#0135d0] active:scale-98"
                      : "border border-border bg-card text-foreground hover:bg-muted active:scale-98"
                  }`}
                >
                  {checkoutLoading === planId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Redirection…</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Payer par Mobile Money</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {!isPro && !loading && (
        <ul className="grid grid-cols-1 gap-2.5 text-[11px] text-muted-foreground sm:grid-cols-2">
          <li className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>Badge « Pro Vérifié » sur votre carte et votre profil public.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>Priorité dans la recherche face aux profils gratuits.</span>
          </li>
        </ul>
      )}
    </div>
  )
}
