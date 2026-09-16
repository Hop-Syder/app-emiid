/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook React personnalisé pour la gestion du portefeuille de crédits
 *              et de l'historique des transactions d'un utilisateur.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { CreditWallet, CreditTransaction } from "@/types/missions"

export function useCredits() {
  const [wallet, setWallet] = useState<CreditWallet | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchCreditsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setWallet(null)
        setTransactions([])
        setLoading(false)
        return
      }

      // 1. Lecture du wallet. Ne peut pas être parallélisée avec les
      // transactions : credit_transactions n'a pas de colonne user_id, elle
      // référence uniquement wallet_id (sql/migrations/20260915_missions_engine_phase1.sql:138-146)
      // — il faut donc connaître l'id du wallet avant de pouvoir filtrer.
      const { data: walletData, error: walletError } = await (supabase as any)
        .from("credit_wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (walletError) {
        console.error("[useCredits] Erreur lecture wallet:", walletError)
      }
      setWallet((walletData as CreditWallet) ?? null)

      // 2. Récupération de l'historique des transactions (filtré par
      // wallet_id, pas user_id — colonne inexistante sur cette table).
      if (walletData?.id) {
        const { data: txData, error: txError } = await (supabase as any)
          .from("credit_transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false })

        if (txError) {
          console.error("[useCredits] Erreur lecture transactions:", txError)
        } else if (txData) {
          setTransactions(txData as CreditTransaction[])
        }
      } else {
        setTransactions([])
      }
    } catch (err: any) {
      console.error("[useCredits] Exception:", err)
      setError(err?.message || "Impossible de charger les crédits")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCreditsData()
  }, [fetchCreditsData])

  return {
    balance: wallet?.balance ?? 0,
    wallet,
    transactions,
    loading,
    error,
    refetch: fetchCreditsData,
  }
}
