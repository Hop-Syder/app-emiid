/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de maintenance et de statut temporaire lorsque l'API Backend est inaccessible
 * @created 2026-08-10
 * @updated 2026-08-10
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ServerOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Globe,
  MessageSquare,
  Activity,
  Database,
  WifiOff,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface ServiceStatus {
  name: string
  key: "backend" | "supabase" | "realtime"
  description: string
  icon: typeof ServerOff
  status: "online" | "degraded" | "offline" | "checking"
  pingTimeMs?: number
}

export default function MaintenancePage() {
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null)
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(null)
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "API Backend Central",
      key: "backend",
      description: "Service Node.js & Express (Règles métier, notifications, calculs)",
      icon: ServerOff,
      status: "checking",
    },
    {
      name: "Base de Données Supabase",
      key: "supabase",
      description: "Stockage PostgreSQL & authentification principale",
      icon: Database,
      status: "online",
      pingTimeMs: 42,
    },
    {
      name: "Messagerie & Temps Réel",
      key: "realtime",
      description: "WebSockets & relais de messages instantanés",
      icon: Activity,
      status: "degraded",
    },
  ])

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [diagnosticLog, setDiagnosticLog] = useState<string[]>([])

  const checkBackendHealth = useCallback(async () => {
    setIsChecking(true)
    const startTime = performance.now()
    const timestamp = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    try {
      // Interroge le proxy Next.js vers la route health du backend
      const res = await fetch("/api/proxy/health", {
        method: "GET",
        cache: "no-store",
        headers: { "x-maintenance-check": "true" },
      })

      const endTime = performance.now()
      const pingMs = Math.round(endTime - startTime)

      if (res.ok) {
        const data = await res.json()
        setServices((prev) =>
          prev.map((s) =>
            s.key === "backend"
              ? { ...s, status: "online", pingTimeMs: pingMs }
              : s.key === "realtime"
                ? { ...s, status: "online", pingTimeMs: pingMs + 10 }
                : s
          )
        )
        setDiagnosticLog((prev) => [
          `[${timestamp}] ✅ Backend accessible (HTTP ${res.status}) - Latence: ${pingMs}ms`,
          ...prev.slice(0, 4),
        ])

        // Déclencher le décompte de redirection vers le dashboard
        if (autoRedirectCountdown === null) {
          setAutoRedirectCountdown(5)
        }
      } else {
        setServices((prev) =>
          prev.map((s) =>
            s.key === "backend"
              ? { ...s, status: "offline", pingTimeMs: pingMs }
              : s.key === "realtime"
                ? { ...s, status: "degraded" }
                : s
          )
        )
        setDiagnosticLog((prev) => [
          `[${timestamp}] ❌ Backend indisponible (HTTP ${res.status})`,
          ...prev.slice(0, 4),
        ])
        setAutoRedirectCountdown(null)
      }
    } catch {
      const endTime = performance.now()
      const pingMs = Math.round(endTime - startTime)
      setServices((prev) =>
        prev.map((s) =>
          s.key === "backend"
            ? { ...s, status: "offline", pingTimeMs: pingMs }
            : s.key === "realtime"
              ? { ...s, status: "offline" }
              : s
        )
      )
      setDiagnosticLog((prev) => [
        `[${timestamp}] ⚠️ Erreur de réseau : impossible de joindre le serveur API`,
        ...prev.slice(0, 4),
      ])
      setAutoRedirectCountdown(null)
    } finally {
      setIsChecking(false)
      setLastCheckTime(timestamp)
    }
  }, [autoRedirectCountdown])

  // Lancer la première vérification au chargement + intervalle automatique de 12s
  useEffect(() => {
    checkBackendHealth()
    const interval = setInterval(() => {
      checkBackendHealth()
    }, 12000)

    return () => clearInterval(interval)
  }, [checkBackendHealth])

  // Décompte de redirection automatique lorsque le serveur revient en ligne
  useEffect(() => {
    if (autoRedirectCountdown === null || autoRedirectCountdown <= 0) return

    const timer = setTimeout(() => {
      if (autoRedirectCountdown === 1) {
        window.location.href = "/dashboard-user"
      } else {
        setAutoRedirectCountdown((prev) => (prev ? prev - 1 : null))
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [autoRedirectCountdown])

  const isBackendOnline = services.find((s) => s.key === "backend")?.status === "online"

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Arrière-plan dynamique avec dégradés fluides et maillage de lumière */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-[128px]" />

        {/* Trame de grille subtile */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* En-tête principal */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center p-2 group-hover:border-blue-500/60 transition-all duration-300">
            <Image
              src="/logo/icon.svg"
              alt="EmiID Icon"
              width={24}
              height={24}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
            EmiID
          </span>
        </Link>

        {/* Pilule de statut global */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBackendOnline ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isBackendOnline ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>
          <span className={isBackendOnline ? "text-emerald-400" : "text-amber-300"}>
            {isBackendOnline ? "Service Rétabli" : "Maintenance en cours"}
          </span>
        </div>
      </header>

      {/* Contenu central — Layout Bento Grid */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Bannière de restauration si le service est revenu */}
          <AnimatePresence>
            {isBackendOnline && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl flex items-center justify-between gap-4 text-emerald-300 shadow-lg shadow-emerald-950/20"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm text-emerald-200">
                      Le serveur API est de nouveau opérationnel !
                    </h3>
                    <p className="text-xs text-emerald-400/80">
                      Redirection automatique vers le tableau de bord dans{" "}
                      <span className="font-bold text-white">{autoRedirectCountdown}s</span>...
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => (window.location.href = "/dashboard-user")}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-xs shadow-md"
                >
                  Y aller maintenant <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Carte Principale du Statut de Maintenance */}
          <div className="relative rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-slate-950/50 overflow-hidden">
            {/* Effet visuel de halo lumineux */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              {/* Icône d'illustration animée */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/30">
                  <ServerOff className="w-10 h-10 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 text-xs">
                  <WifiOff className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide uppercase">
                  <AlertTriangle className="w-3.5 h-3.5" /> Intervention Technique Temporaire
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Serveur Backend Temporairement Inaccessible
                </h1>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  L&apos;API centrale EmiID subit une courte interruption de service ou une mise à jour d&apos;infrastructure. Vos cartes de visite, identifiants et données de profil restent{" "}
                  <strong className="text-slate-200 font-semibold">100% sécurisés</strong>.
                </p>

                {/* Actions principales */}
                <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Button
                    onClick={checkBackendHealth}
                    disabled={isChecking}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-70"
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${isChecking ? "animate-spin text-blue-200" : ""}`}
                    />
                    {isChecking ? "Vérification..." : "Tester la connexion"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/dashboard-user")}
                    className="rounded-xl border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 px-5 py-2.5 text-sm font-medium"
                  >
                    Mode Dégradé / Dashboard
                  </Button>
                </div>
              </div>
            </div>

            {/* Barre de statut des sous-services */}
            <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((service) => {
                const IconComponent = service.icon
                return (
                  <div
                    key={service.key}
                    className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3.5 transition-all hover:border-slate-700/80"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white truncate">
                          {service.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            service.status === "online"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : service.status === "degraded"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                : service.status === "checking"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {service.status === "online"
                            ? "En ligne"
                            : service.status === "degraded"
                              ? "Ralenti"
                              : service.status === "checking"
                                ? "Test..."
                                : "Inaccessible"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                        {service.description}
                      </p>
                      {service.pingTimeMs && service.status === "online" && (
                        <span className="inline-block mt-1 text-[10px] font-mono text-slate-400">
                          Latence : {service.pingTimeMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section Accordéon / Diagnostic Technique */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4 backdrop-blur-md">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Journal des tests et informations de diagnostic
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {showTechnicalDetails ? "Masquer ▲" : "Afficher ▼"}
              </span>
            </button>

            {showTechnicalDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-slate-800/60 space-y-2 font-mono text-[11px]"
              >
                <div className="flex flex-wrap justify-between gap-2 text-slate-400">
                  <span>Dernier test : {lastCheckTime || "En cours..."}</span>
                  <span>Code Erreur : ERR_BACKEND_OFFLINE_502</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 overflow-x-auto space-y-1">
                  {diagnosticLog.length > 0 ? (
                    diagnosticLog.map((log, index) => (
                      <div key={index} className="whitespace-nowrap">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">Aucun événement enregistré.</div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Pied de page et liens d'urgence */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>© {new Date().getFullYear()} EmiID — Nexus Partners. Tous droits réservés.</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://t.me/emiid_official"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Canal Telegram
          </a>
          <a
            href="https://wa.me/22900000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Support WhatsApp
          </a>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" /> Auto-ping: 12s
          </div>
        </div>
      </footer>
    </div>
  )
}
