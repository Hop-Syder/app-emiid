/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Boosts communaux — référentiel des communes, boost actif de
 *              l'utilisateur et déclenchement du paiement Mobile Money.
 * @created 2026-08-24
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"

export type BoostPlanId = "COMMUNE_48H" | "COMMUNE_7D" | "COMMUNE_30D"

/** Grille tarifaire (miroir du backend — montants entiers FCFA). */
export const BOOST_PLANS: Record<BoostPlanId, { amount: number; label: string; duration: string }> = {
    COMMUNE_48H: { amount: 500, label: "Flash", duration: "48 heures" },
    COMMUNE_7D: { amount: 1200, label: "Semaine", duration: "7 jours" },
    COMMUNE_30D: { amount: 4000, label: "Mois", duration: "30 jours" },
}

export interface CommuneOption {
    id: string
    name: string
    department: string
}

export interface ActiveBoost {
    id: string
    communeName: string
    expiresAt: string
    pricePaid: number
}

export function useBoost() {
    const [communes, setCommunes] = useState<CommuneOption[]>([])
    const [profileCommuneId, setProfileCommuneId] = useState<string | null>(null)
    const [activeBoost, setActiveBoost] = useState<ActiveBoost | null>(null)
    const [loading, setLoading] = useState(true)
    const [checkoutLoading, setCheckoutLoading] = useState<BoostPlanId | null>(null)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        const supabase = createClient()
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Référentiel (lisible publiquement) + commune du profil + boost en cours.
            const [communesRes, profileRes, boostRes] = await Promise.all([
                supabase
                    .from("communes")
                    .select("id, name, departments(name)")
                    .order("name", { ascending: true }),
                user
                    ? supabase.from("user_profiles").select("commune_id").eq("id", user.id).maybeSingle()
                    : Promise.resolve({ data: null }),
                user
                    ? supabase
                          .from("profile_boosts")
                          .select("id, expires_at, price_paid, communes(name)")
                          .eq("profile_id", user.id)
                          .eq("status", "ACTIVE")
                          .gt("expires_at", new Date().toISOString())
                          .order("expires_at", { ascending: false })
                          .limit(1)
                          .maybeSingle()
                    : Promise.resolve({ data: null }),
            ])

            const rows = (communesRes.data as unknown as
                { id: string; name: string; departments: { name: string } | { name: string }[] | null }[] | null) || []
            setCommunes(
                rows.map((c) => ({
                    id: c.id,
                    name: c.name,
                    department: (Array.isArray(c.departments) ? c.departments[0]?.name : c.departments?.name) || "",
                }))
            )

            setProfileCommuneId((profileRes.data as { commune_id: string | null } | null)?.commune_id ?? null)

            const b = boostRes.data as unknown as
                { id: string; expires_at: string; price_paid: number; communes: { name: string } | { name: string }[] | null } | null
            setActiveBoost(
                b
                    ? {
                          id: b.id,
                          communeName:
                              (Array.isArray(b.communes) ? b.communes[0]?.name : b.communes?.name) || "votre commune",
                          expiresAt: b.expires_at,
                          pricePaid: b.price_paid,
                      }
                    : null
            )
        } catch (err) {
            console.error("useBoost: chargement échoué", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    /** Lance le paiement d'un boost et redirige vers FedaPay. */
    const startBoostCheckout = useCallback(async (plan: BoostPlanId, communeId: string) => {
        if (!communeId) {
            setError("Choisissez d'abord une commune à cibler.")
            return
        }
        setCheckoutLoading(plan)
        setError(null)
        try {
            const res = await fetchWithAuth("/api/payments/boost/checkout", {
                method: "POST",
                body: JSON.stringify({ plan, communeId }),
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

    return {
        communes,
        profileCommuneId,
        activeBoost,
        loading,
        checkoutLoading,
        error,
        startBoostCheckout,
        reload: load,
    }
}
