/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description PlanSection — Abonnement Pro EmiID (offre réelle, paiement Mobile
 *              Money FedaPay) et statistiques d'engagement du profil.
 *              Aligné charte : bleu roi #013ff4 / cyan #03b3f8.
 * @created 2026-07-11
 * @updated 2026-08-23
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Star, ShieldCheck, Zap, Globe, MessageSquare, CreditCard, Sparkles,
  Eye, Phone, Share2, AlertCircle, Loader2, Check, ReceiptText,
} from "lucide-react"
import { useSubscription, PLANS, formatFcfa, type PlanId, type Invoice } from "@/hooks/use-subscription"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"

interface PlanSectionProps {
  profile: {
    is_premium: boolean
    email: string
  }
}

const FEATURES = [
  { icon: ShieldCheck, title: "Badge « Pro Vérifié »", desc: "Badge distinctif sur votre carte et votre profil public." },
  { icon: Zap, title: "Priorité dans la recherche", desc: "Vous passez devant les profils gratuits à pertinence égale." },
  { icon: Globe, title: "Portfolio étendu", desc: "Jusqu'à 15 photos HD et un lien vidéo TikTok / YouTube." },
  { icon: MessageSquare, title: "Statistiques de performance", desc: "Vues du profil, clics WhatsApp et appels générés." },
]

/** Formate une date d'échéance en français (ex. « 23 septembre 2026 »). */
function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export function PlanSection({ profile }: PlanSectionProps) {
  const {
    subscription, stats, invoices, isPro, loading, checkoutLoading, managing, error,
    startCheckout, toggleAutoRenew, cancelSubscription,
  } = useSubscription()
  const [cancelOpen, setCancelOpen] = useState(false)

  // Repli sur la donnée du profil tant que l'abonnement n'est pas chargé.
  const pro = loading ? profile.is_premium : isPro
  const busy = checkoutLoading !== null

  const handleToggleAutoRenew = async (enabled: boolean) => {
    try {
      await toggleAutoRenew(enabled)
      toast.success(enabled ? "Renouvellement automatique activé" : "Renouvellement automatique désactivé")
    } catch {
      toast.error("Impossible de modifier le renouvellement automatique.")
    }
  }

  const handleCancel = async () => {
    try {
      await cancelSubscription()
      toast.success("Votre abonnement a été résilié.")
    } catch {
      toast.error("La résiliation a échoué. Réessayez dans un instant.")
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold text-foreground">Mon offre EmiID</h3>
        <p className="text-muted-foreground text-xs mt-1">
          Consultez et gérez votre abonnement, vos avantages et vos statistiques.
        </p>
      </div>

      {/* ── Offre active ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border p-6 bg-muted flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Offre active</span>
          <h4 className="text-xl font-black text-foreground flex items-center gap-2">
            {pro ? (
              <>
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                EmiID Pro
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-[#013ff4]" />
                EmiID Starter
              </>
            )}
          </h4>
          <p className="text-xs text-muted-foreground">
            {pro
              ? subscription?.endDate
                ? `Votre abonnement est actif jusqu'au ${formatDate(subscription.endDate)}.`
                : "Votre abonnement Pro est actif."
              : "Profitez de l'essentiel d'EmiID. Passez Pro pour gagner en visibilité."}
          </p>
        </div>

        {pro && (
          <div className="shrink-0">
            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700">
              <Check className="h-4 w-4" />
              Abonnement actif
            </span>
          </div>
        )}
      </div>

      {/* ── Erreur de paiement ───────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="text-sm font-bold text-rose-900">Paiement impossible</p>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* ── Gestion de l'abonnement (si Pro) ─────────────────────────── */}
      {pro && subscription && !loading && (
        <div className="rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Renouvellement automatique</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {subscription.autoRenew
                  ? `Votre forfait sera renouvelé automatiquement le ${formatDate(subscription.endDate)}.`
                  : "Sans renouvellement, votre abonnement s'achève à son échéance — pensez à le relancer."}
              </p>
            </div>
            <Switch
              checked={subscription.autoRenew}
              onCheckedChange={(value) => void handleToggleAutoRenew(value)}
              disabled={managing}
              aria-label="Renouvellement automatique"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Résilier l&apos;abonnement</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Effet immédiat : le badge Pro et ses avantages sont retirés, sans remboursement au prorata.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={managing}
              onClick={() => setCancelOpen(true)}
              className="shrink-0 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              {managing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Résilier"}
            </Button>
          </div>

          <ConfirmActionDialog
            isOpen={cancelOpen}
            onClose={() => setCancelOpen(false)}
            onConfirm={() => {
              setCancelOpen(false)
              void handleCancel()
            }}
            title="Résilier l'abonnement Pro ?"
            description="Vous perdez immédiatement le badge Pro, la priorité dans la recherche et l'accès à vos statistiques détaillées. Cette action est irréversible."
            confirmText="Oui, résilier"
            cancelText="Conserver mon offre"
            variant="destructive"
          />
        </div>
      )}

      {/* ── Historique de paiements ──────────────────────────────────── */}
      {!loading && invoices.length > 0 && (
        <div className="space-y-4">
          <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">Historique de paiements</h5>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {invoices.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </div>
        </div>
      )}

      {/* ── Forfaits (si pas encore Pro) ─────────────────────────────── */}
      {!pro && !loading && (
        <div className="space-y-4">
          <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">Choisir un forfait</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(PLANS) as PlanId[]).map((planId) => {
              const plan = PLANS[planId]
              const isAnnual = planId === "PRO_ANNUAL"
              return (
                <div
                  key={planId}
                  className={`relative rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                    isAnnual ? "border-[#013ff4]/30 bg-[#013ff4]/[0.03]" : "border-border"
                  }`}
                >
                  {isAnnual && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-[#013ff4] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                      2 mois offerts
                    </span>
                  )}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground">{plan.label}</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{formatFcfa(plan.amount)}</p>
                    <p className="text-[11px] font-medium text-slate-400">{plan.period}</p>
                  </div>
                  <button
                    onClick={() => startCheckout(planId)}
                    disabled={busy}
                    className={`w-full rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                      isAnnual
                        ? "bg-[#013ff4] text-white shadow-lg shadow-[#013ff4]/25 hover:bg-[#0135d0]"
                        : "bg-card border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {checkoutLoading === planId ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirection…
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Payer par Mobile Money
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Paiement sécurisé MTN MoMo, Moov ou Celtiis. Activation immédiate après confirmation.
          </p>
        </div>
      )}

      {/* ── Avantages Pro (si pas encore Pro) ────────────────────────── */}
      {!pro && (
        <div className="space-y-5 pt-2">
          <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">Pourquoi passer Pro ?</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3 items-start p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-[#013ff4]/[0.08] rounded-lg text-[#013ff4]">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <h6 className="text-xs font-bold text-foreground">{f.title}</h6>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Statistiques d'engagement ────────────────────────────────── */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center justify-between gap-2 pt-6">
          <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">Performance du profil</h5>
          {!pro && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              Détail complet avec Pro
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile icon={Eye} label="Vues" value={stats?.views ?? 0} loading={loading} />
          <StatTile icon={MessageSquare} label="Clics WhatsApp" value={stats?.whatsapp ?? 0} loading={loading} locked={!pro} />
          <StatTile icon={Phone} label="Appels" value={stats?.calls ?? 0} loading={loading} locked={!pro} />
          <StatTile icon={Share2} label="Partages" value={stats?.shares ?? 0} loading={loading} locked={!pro} />
        </div>
      </div>
    </div>
  )
}

// ── Ligne d'historique de paiement ──────────────────────────────────────
function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const badge =
    invoice.status === "SUCCESS"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : invoice.status === "FAILED"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-amber-50 text-amber-700 border-amber-200"
  const label = invoice.status === "SUCCESS" ? "Payé" : invoice.status === "FAILED" ? "Échoué" : "En attente"

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-xl bg-muted text-slate-400 shrink-0">
          <ReceiptText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground">{formatFcfa(invoice.amount)}</p>
          <p className="text-[11px] text-slate-400">{formatDate(invoice.createdAt)}</p>
        </div>
      </div>
      <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge}`}>
        {label}
      </span>
    </div>
  )
}

// ── Tuile de statistique ────────────────────────────────────────────────
function StatTile({
  icon: Icon,
  label,
  value,
  loading,
  locked = false,
}: {
  icon: React.ElementType
  label: string
  value: number
  loading: boolean
  locked?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 text-xl font-black text-foreground">
        {loading ? <span className="inline-block h-5 w-10 animate-pulse rounded bg-muted" /> : locked ? "—" : value}
      </p>
    </motion.div>
  )
}
