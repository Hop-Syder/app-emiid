/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant de bannière flottante notifiant l'inaccessibilité temporaire du Backend EmiID
 * @created 2026-08-10
 * @updated 2026-08-10
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, ServerOff, ArrowRight, X } from "lucide-react"

export function BackendStatusBanner() {
  const [isBackendDown, setIsBackendDown] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Écouter les événements globaux de proxy 502 / Backend Down
    const handleBackendError = () => {
      setIsBackendDown(true)
    }

    window.addEventListener("emiid:backend-down", handleBackendError)

    // Détection passive rapide au montage
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/proxy/health", { method: "GET", cache: "no-store" })
        if (!res.ok) {
          setIsBackendDown(true)
        }
      } catch {
        setIsBackendDown(true)
      }
    }

    checkHealth()

    return () => {
      window.removeEventListener("emiid:backend-down", handleBackendError)
    }
  }, [])

  if (!isBackendDown || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-xl p-3.5 rounded-2xl bg-amber-950/90 border border-amber-500/40 backdrop-blur-xl text-amber-200 shadow-2xl shadow-amber-950/50 flex items-center justify-between gap-3 text-xs md:text-sm"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <ServerOff className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">
              Serveur backend temporairement inaccessible
            </p>
            <p className="text-amber-300/80 text-[11px] truncate">
              Les fonctionnalités avancées sont en mode dégradé.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/maintenance"
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-md active:scale-95"
          >
            Statut <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-amber-500/20 text-amber-400 transition-colors"
            title="Masquer la notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
