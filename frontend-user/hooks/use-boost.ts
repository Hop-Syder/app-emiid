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

export type BoostScope = "COMMUNE" | "DEPARTMENT"
export type BoostPlanId =
    | "COMMUNE_48H" | "COMMUNE_7D" | "COMMUNE_30D"
    | "DEPARTMENT_48H" | "DEPARTMENT_7D" | "DEPARTMENT_30D"

/** Grille tarifaire (miroir du backend — montants entiers FCFA). */
export const BOOST_PLANS: Record<BoostPlanId, { amount: number; label: string; duration: string; scope: BoostScope }> = {
    COMMUNE_48H:    { amount: 500,   label: "Flash",   duration: "48 heures", scope: "COMMUNE" },
    COMMUNE_7D:     { amount: 1200,  label: "Semaine", duration: "7 jours",   scope: "COMMUNE" },
    COMMUNE_30D:    { amount: 4000,  label: "Mois",    duration: "30 jours",  scope: "COMMUNE" },
    DEPARTMENT_48H: { amount: 1200,  label: "Flash",   duration: "48 heures", scope: "DEPARTMENT" },
    DEPARTMENT_7D:  { amount: 3000,  label: "Semaine", duration: "7 jours",   scope: "DEPARTMENT" },
    DEPARTMENT_30D: { amount: 10000, label: "Mois",    duration: "30 jours",  scope: "DEPARTMENT" },
}

/** Forfaits d'une portée donnée, du plus court au plus long. */
export function plansForScope(scope: BoostScope): BoostPlanId[] {
    return (Object.keys(BOOST_PLANS) as BoostPlanId[]).filter((id) => BOOST_PLANS[id].scope === scope)
}

export interface CommuneOption {
    id: string
    name: string
    department: string
    departmentId: string
}

export interface DepartmentOption {
    id: string
    name: string
}

export interface ActiveBoost {
    id: string
    scope: BoostScope
    /** Nom de la commune ou du département ciblé. */
    targetName: string
    expiresAt: string
    pricePaid: number
}

export function useBoost() {
    const [communes, setCommunes] = useState<CommuneOption[]>([])
    const [departments, setDepartments] = useState<DepartmentOption[]>([])
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
                    .select("id, name, department_id, departments(name)")
                    .order("name", { ascending: true }),
                user
                    ? supabase.from("user_profiles").select("commune_id").eq("id", user.id).maybeSingle()
                    : Promise.resolve({ data: null }),
                user
                    ? supabase
                          .from("profile_boosts")
                          .select("id, scope, expires_at, price_paid, communes(name), departments(name)")
                          .eq("profile_id", user.id)
                          .eq("status", "ACTIVE")
                          .gt("expires_at", new Date().toISOString())
                          .order("expires_at", { ascending: false })
                          .limit(1)
                          .maybeSingle()
                    : Promise.resolve({ data: null }),
            ])

            const rows = (communesRes.data as unknown as
                { id: string; name: string; department_id: string; departments: { name: string } | { name: string }[] | null }[] | null) || []
            const mapped = rows.map((c) => ({
                id: c.id,
                name: c.name,
                departmentId: c.department_id,
                department: (Array.isArray(c.departments) ? c.departments[0]?.name : c.departments?.name) || "",
            }))
            setCommunes(mapped)

            // Départements déduits du référentiel : une seule requête suffit.
            const seen = new Map<string, string>()
            for (const c of mapped) if (c.departmentId) seen.set(c.departmentId, c.department)
            setDepartments(
                [...seen.entries()]
                    .map(([id, name]) => ({ id, name }))
                    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
            )

            setProfileCommuneId((profileRes.data as { commune_id: string | null } | null)?.commune_id ?? null)

            const b = boostRes.data as unknown as {
                id: string
                scope: BoostScope
                expires_at: string
                price_paid: number
                communes: { name: string } | { name: string }[] | null
                departments: { name: string } | { name: string }[] | null
            } | null
            const pick = (j: { name: string } | { name: string }[] | null) =>
                (Array.isArray(j) ? j[0]?.name : j?.name) || ""
            setActiveBoost(
                b
                    ? {
                          id: b.id,
                          scope: b.scope,
                          targetName:
                              (b.scope === "COMMUNE" ? pick(b.communes) : pick(b.departments)) || "votre zone",
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
    const startBoostCheckout = useCallback(async (plan: BoostPlanId, targetId: string) => {
        const scope = BOOST_PLANS[plan].scope
        if (!targetId) {
            setError(
                scope === "COMMUNE"
                    ? "Choisissez d'abord une commune à cibler."
                    : "Choisissez d'abord un département à cibler."
            )
            return
        }
        setCheckoutLoading(plan)
        setError(null)
        try {
            const res = await fetchWithAuth("/api/payments/boost/checkout", {
                method: "POST",
                body: JSON.stringify(
                    scope === "COMMUNE" ? { plan, communeId: targetId } : { plan, departmentId: targetId }
                ),
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
        departments,
        profileCommuneId,
        activeBoost,
        loading,
        checkoutLoading,
        error,
        startBoostCheckout,
        reload: load,
    }
}
