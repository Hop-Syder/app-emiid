/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Abonnement Pro & statistiques de profil.
 *              Lit l'abonnement réel (RLS : ses propres lignes) et les compteurs
 *              d'engagement, puis expose le déclenchement du paiement FedaPay.
 * @created 2026-08-23
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"

export type PlanId = "PRO_MONTHLY" | "PRO_ANNUAL"

export interface SubscriptionState {
    tier: "FREE" | "PRO_MONTHLY" | "PRO_ANNUAL" | "B2B"
    status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING"
    endDate: string | null
    autoRenew: boolean
}

export interface ProfileStats {
    views: number
    whatsapp: number
    calls: number
    shares: number
}

/** Grille tarifaire (miroir du backend — montants entiers FCFA). */
export const PLANS: Record<PlanId, { amount: number; label: string; period: string }> = {
    PRO_MONTHLY: { amount: 1000, label: "Pro mensuel", period: "par mois" },
    PRO_ANNUAL: { amount: 10000, label: "Pro annuel", period: "par an" },
}

/** Formate un montant FCFA (1000 → « 1 000 FCFA »). */
export function formatFcfa(amount: number): string {
    return `${amount.toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`
}

export function useSubscription() {
    const [subscription, setSubscription] = useState<SubscriptionState | null>(null)
    const [stats, setStats] = useState<ProfileStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [checkoutLoading, setCheckoutLoading] = useState<PlanId | null>(null)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        const supabase = createClient()
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            // Les VUES viennent de profile_views (table append-only déjà alimentée
            // par use-profile-data, avec anti-auto-vue) — pas de compteur dupliqué.
            // profile_analytics ne sert qu'aux clics (WhatsApp / appel / partage).
            const [subRes, statsRes, viewsRes] = await Promise.all([
                supabase
                    .from("subscriptions")
                    .select("tier, status, end_date, auto_renew")
                    .eq("user_id", user.id)
                    .maybeSingle(),
                supabase
                    .from("profile_analytics")
                    .select("whatsapp_clicks, call_clicks, shares_count")
                    .eq("profile_id", user.id)
                    .maybeSingle(),
                supabase
                    .from("profile_views")
                    .select("id", { count: "exact", head: true })
                    .eq("profile_id", user.id),
            ])

            // Aucune ligne = utilisateur encore sur l'offre gratuite.
            setSubscription(
                subRes.data
                    ? {
                          tier: subRes.data.tier,
                          status: subRes.data.status,
                          endDate: subRes.data.end_date,
                          autoRenew: subRes.data.auto_renew,
                      }
                    : { tier: "FREE", status: "ACTIVE", endDate: null, autoRenew: false }
            )

            setStats({
                views: viewsRes.count ?? 0,
                whatsapp: statsRes.data?.whatsapp_clicks ?? 0,
                calls: statsRes.data?.call_clicks ?? 0,
                shares: statsRes.data?.shares_count ?? 0,
            })
        } catch (err) {
            console.error("useSubscription: chargement échoué", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    /** Lance le paiement Mobile Money et redirige vers FedaPay. */
    const startCheckout = useCallback(async (plan: PlanId) => {
        setCheckoutLoading(plan)
        setError(null)
        try {
            const res = await fetchWithAuth("/api/payments/checkout", {
                method: "POST",
                body: JSON.stringify({ plan }),
            })
            const data = await res.json()
            if (!res.ok || !data?.url) {
                throw new Error(data?.error || "Le paiement n'a pas pu être initialisé.")
            }
            window.location.href = data.url
        } catch (err) {
            setError(err instanceof Error ? err.message : "Le paiement a échoué.")
            setCheckoutLoading(null)
        }
    }, [])

    const isPro =
        !!subscription &&
        subscription.status === "ACTIVE" &&
        subscription.tier !== "FREE" &&
        (!subscription.endDate || new Date(subscription.endDate) > new Date())

    return { subscription, stats, isPro, loading, checkoutLoading, error, startCheckout, reload: load }
}
