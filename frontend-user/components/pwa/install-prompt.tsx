/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Invitation à installer EmiID sur l'écran d'accueil.
 *
 *              Deux parcours, parce que les navigateurs ne se valent pas :
 *
 *              • Chromium (Chrome, Edge, Samsung Internet, Opera) émet
 *                `beforeinstallprompt`. On le retient pour déclencher la boîte
 *                native au moment choisi par l'utilisateur, et non à l'instant
 *                où le navigateur l'a décidé.
 *
 *              • Safari iOS n'implémente pas cet événement. Aucune installation
 *                ne peut être déclenchée par le code : la seule voie est le menu
 *                Partager. On affiche donc des instructions illustrées.
 *
 *              Le refus est mémorisé, avec une date : « plus tard » veut dire
 *              plus tard, pas jamais.
 * @created 2026-08-28
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Share, PlusSquare, X, Sparkles } from "lucide-react"

/** Événement Chromium, absent des types DOM standards. */
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "emiid:pwa-install-dismissed-at"
/** Un refus met l'invitation en sommeil deux semaines, pas définitivement. */
const DISMISS_DAYS = 14
/** Laisser l'utilisateur arriver quelque part avant de lui proposer autre chose. */
const APPEAR_DELAY_MS = 4000

/** L'application tourne-t-elle déjà en mode installé ? */
function isStandalone(): boolean {
    if (typeof window === "undefined") return false
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        // Safari iOS n'expose pas display-mode : il a sa propre propriété.
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    )
}

function isIos(): boolean {
    if (typeof window === "undefined") return false
    const ua = window.navigator.userAgent
    // iPadOS 13+ se présente comme un Mac : le test tactile lève l'ambiguïté.
    return (
        /iphone|ipad|ipod/i.test(ua) ||
        (/Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document)
    )
}

/** Le refus est-il encore valable ? */
function recentlyDismissed(): boolean {
    try {
        const raw = window.localStorage.getItem(DISMISS_KEY)
        if (!raw) return false
        const elapsed = Date.now() - Number(raw)
        return Number.isFinite(elapsed) && elapsed < DISMISS_DAYS * 86_400_000
    } catch {
        // Navigation privée ou stockage bloqué : ne pas insister pour autant.
        return false
    }
}

export function PwaInstallPrompt() {
    const [visible, setVisible] = useState(false)
    const [iosMode, setIosMode] = useState(false)
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
    const [installing, setInstalling] = useState(false)

    const hide = useCallback((remember: boolean) => {
        setVisible(false)
        if (!remember) return
        try {
            window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
        } catch {
            /* stockage indisponible : le refus vaut pour cette session */
        }
    }, [])

    useEffect(() => {
        // Déjà installée, ou refus encore frais : on ne montre rien.
        if (isStandalone() || recentlyDismissed()) return

        let appearTimer: ReturnType<typeof setTimeout> | undefined

        const onBeforeInstall = (e: Event) => {
            // Sans ceci, Chrome affiche sa propre barre au moment qui l'arrange.
            e.preventDefault()
            setDeferred(e as BeforeInstallPromptEvent)
            appearTimer = setTimeout(() => setVisible(true), APPEAR_DELAY_MS)
        }

        const onInstalled = () => {
            setVisible(false)
            setDeferred(null)
            // Installée : plus aucune raison de reproposer.
            try {
                window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
            } catch {
                /* sans importance ici */
            }
        }

        window.addEventListener("beforeinstallprompt", onBeforeInstall)
        window.addEventListener("appinstalled", onInstalled)

        // Safari n'émettra jamais l'événement : on bascule sur les instructions.
        if (isIos()) {
            setIosMode(true)
            appearTimer = setTimeout(() => setVisible(true), APPEAR_DELAY_MS)
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstall)
            window.removeEventListener("appinstalled", onInstalled)
            if (appearTimer) clearTimeout(appearTimer)
        }
    }, [])

    const install = useCallback(async () => {
        if (!deferred) return
        setInstalling(true)
        try {
            await deferred.prompt()
            const { outcome } = await deferred.userChoice
            // La boîte native ne se rejoue pas : l'événement est consommé.
            setDeferred(null)
            hide(outcome === "dismissed")
        } catch {
            hide(false)
        } finally {
            setInstalling(false)
        }
    }, [deferred, hide])

    if (!visible) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                role="dialog"
                aria-labelledby="pwa-install-title"
                className="fixed inset-x-0 bottom-0 z-[60] px-4 lg:left-auto lg:right-6 lg:w-[360px] lg:px-0"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 6.5rem)" }}
            >
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.32)] backdrop-blur-2xl">
                    {/* Bandeau de marque */}
                    <div className="relative flex items-center gap-3 bg-[linear-gradient(135deg,#013ff4_0%,#03b3f8_100%)] p-4 text-white">
                        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-2xl" />
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                            <Sparkles className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p id="pwa-install-title" className="text-sm font-black">
                                Installer EmiID
                            </p>
                            <p className="text-xs text-white/85">Accès direct depuis votre écran d&apos;accueil</p>
                        </div>
                        <button
                            onClick={() => hide(true)}
                            aria-label="Plus tard"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-5">
                        {iosMode ? (
                            <>
                                <p className="text-sm font-medium leading-relaxed text-slate-600">
                                    Sur iPhone, l&apos;installation passe par le menu de partage de Safari :
                                </p>
                                <ol className="mt-4 space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#013ff4]/[0.08] text-xs font-black text-[#013ff4]">
                                            1
                                        </span>
                                        <span className="flex-1 text-sm font-medium text-slate-700">
                                            Appuyez sur{" "}
                                            <Share className="mx-0.5 inline h-4 w-4 -translate-y-0.5 text-[#013ff4]" />{" "}
                                            <strong className="font-bold">Partager</strong>, en bas de l&apos;écran.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#013ff4]/[0.08] text-xs font-black text-[#013ff4]">
                                            2
                                        </span>
                                        <span className="flex-1 text-sm font-medium text-slate-700">
                                            Choisissez{" "}
                                            <PlusSquare className="mx-0.5 inline h-4 w-4 -translate-y-0.5 text-[#013ff4]" />{" "}
                                            <strong className="font-bold">Sur l&apos;écran d&apos;accueil</strong>.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#013ff4]/[0.08] text-xs font-black text-[#013ff4]">
                                            3
                                        </span>
                                        <span className="flex-1 text-sm font-medium text-slate-700">
                                            Confirmez avec <strong className="font-bold">Ajouter</strong>.
                                        </span>
                                    </li>
                                </ol>
                                <button
                                    onClick={() => hide(true)}
                                    className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    J&apos;ai compris
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-medium leading-relaxed text-slate-600">
                                    Ouvrez EmiID en un geste, sans passer par le navigateur — et recevez vos
                                    notifications comme avec une application installée.
                                </p>
                                <div className="mt-5 flex gap-2">
                                    <button
                                        onClick={() => hide(true)}
                                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50"
                                    >
                                        Plus tard
                                    </button>
                                    <button
                                        onClick={install}
                                        disabled={installing || !deferred}
                                        className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-[#013ff4] px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#013ff4]/25 transition-all hover:bg-[#0135d0] disabled:opacity-60"
                                    >
                                        <Download className="h-4 w-4" />
                                        {installing ? "Installation…" : "Installer"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
