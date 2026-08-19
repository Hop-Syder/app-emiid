/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Écran de recherche immersif « Deep Electric Navy » — point d'entrée
 *              universel de la recherche de profils. Conçu pour la recherche en
 *              langage naturel (IA à venir). Soumission → /annuaire?search=…
 * @created 2026-08-19
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Menu, Bell, Search, ArrowRight, Mic, Bot } from "lucide-react"

// Exemples de requêtes en langage naturel (guident l'utilisateur non expert).
const SUGGESTIONS = [
    "un couturier à Akpakpa",
    "électricien à Cotonou",
    "graphiste freelance",
    "menuisier à Porto-Novo",
]

export default function RecherchePage() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [micAvailable, setMicAvailable] = useState(false)
    const [listening, setListening] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null)

    // Autofocus : le clavier s'ouvre immédiatement → l'utilisateur tape direct.
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Reconnaissance vocale (Web Speech API) — précieux pour la cible mobile.
    useEffect(() => {
        if (typeof window === "undefined") return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SR) return
        setMicAvailable(true)
        const recognition = new SR()
        recognition.lang = "fr-FR"
        recognition.interimResults = false
        recognition.maxAlternatives = 1
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript = event?.results?.[0]?.[0]?.transcript || ""
            setQuery(transcript)
            setListening(false)
        }
        recognition.onend = () => setListening(false)
        recognition.onerror = () => setListening(false)
        recognitionRef.current = recognition
        return () => {
            try {
                recognition.stop()
            } catch {
                /* noop */
            }
        }
    }, [])

    const submit = useCallback(() => {
        const q = query.trim()
        if (!q) {
            inputRef.current?.focus()
            return
        }
        router.push(`/annuaire?search=${encodeURIComponent(q)}`)
    }, [query, router])

    const toggleMic = useCallback(() => {
        const recognition = recognitionRef.current
        if (!recognition) return
        if (listening) {
            recognition.stop()
            setListening(false)
        } else {
            try {
                recognition.start()
                setListening(true)
            } catch {
                setListening(false)
            }
        }
    }, [listening])

    return (
        <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[linear-gradient(180deg,#040E2E_0%,#02071B_100%)] text-white">
            {/* Halos lumineux d'ambiance */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-[#013ff4]/25 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 h-64 w-80 rounded-full bg-[#03b3f8]/20 blur-[110px]" />

            <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-6 pb-8 pt-4">

                {/* ── Top navbar ─────────────────────────────────────────────── */}
                <header className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        aria-label="Retour"
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-white/90 hover:bg-white/10 transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <span className="text-lg font-extrabold tracking-tight">
                        Emi<span className="text-[#03b3f8]">ID</span>
                    </span>

                    <Link
                        href="/notifications"
                        aria-label="Notifications"
                        className="relative flex h-11 w-11 items-center justify-center rounded-xl text-white/90 hover:bg-white/10 transition-colors"
                    >
                        <Bell className="h-6 w-6" />
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#00C8FF] shadow-[0_0_8px_#00C8FF]" />
                    </Link>
                </header>

                {/* ── Greeting badge « Hi » ──────────────────────────────────── */}
                <div className="relative mt-10 flex justify-center">
                    <div className="relative">
                        <div className="relative flex h-20 w-24 items-center justify-center rounded-[26px] rounded-br-md bg-[linear-gradient(135deg,#013ff4_0%,#03b3f8_100%)] shadow-[0_16px_40px_rgba(1,63,244,0.4)]">
                            <span className="text-3xl font-black text-white">Hi</span>
                        </div>
                        {/* petits éclats lumineux */}
                        <span className="absolute -right-2 -top-1 h-0.5 w-4 rotate-45 rounded-full bg-[#00C8FF]" />
                        <span className="absolute -right-3 top-2 h-0.5 w-3 rotate-12 rounded-full bg-[#00C8FF]/80" />
                        <span className="absolute -right-1 top-5 h-0.5 w-2.5 -rotate-12 rounded-full bg-[#00C8FF]/60" />
                    </div>
                </div>

                {/* ── Titre H1 ───────────────────────────────────────────────── */}
                <h1 className="mt-7 text-center text-[34px] font-extrabold leading-[1.1] tracking-tight">
                    Qui recherchez-vous
                    <br />
                    <span className="relative inline-block">
                        aujourd&apos;hui&nbsp;?
                        <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-[linear-gradient(90deg,#0150FD_0%,#00C8FF_60%,transparent_100%)]" />
                    </span>
                </h1>

                {/* ── Barre de recherche (pilule blanche) ────────────────────── */}
                <div className="mt-10">
                    <div className="flex items-center gap-2 rounded-full bg-white p-2 pl-5 shadow-[0_20px_50px_rgba(1,80,253,0.25)]">
                        <Search className="h-5 w-5 shrink-0 text-[#94A3B8]" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submit()}
                            placeholder="Rechercher un artisan, un métier..."
                            aria-label="Rechercher"
                            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] font-medium text-slate-900 placeholder:text-[#64748B] focus:outline-none"
                        />
                        {micAvailable && (
                            <button
                                onClick={toggleMic}
                                aria-label={listening ? "Arrêter la dictée" : "Recherche vocale"}
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all ${
                                    listening
                                        ? "bg-[#00C8FF]/15 text-[#0150FD] animate-pulse"
                                        : "text-[#94A3B8] hover:bg-slate-100"
                                }`}
                            >
                                <Mic className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={submit}
                            aria-label="Lancer la recherche"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0150FD] text-white shadow-[0_8px_20px_rgba(1,80,253,0.45)] transition-all hover:bg-[#013ff4] hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Suggestions en langage naturel */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => router.push(`/annuaire?search=${encodeURIComponent(s)}`)}
                                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-[#03b3f8]/50 hover:text-white"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Zone mascotte / illustration ───────────────────────────── */}
                <div className="relative mt-auto flex items-end justify-center pt-10">
                    {/* Lignes de vitesse */}
                    <div className="pointer-events-none absolute inset-x-6 top-1/2 flex flex-col gap-2 opacity-60">
                        <span className="h-0.5 w-16 rounded-full bg-[linear-gradient(90deg,transparent,#03b3f8)]" />
                        <span className="h-0.5 w-24 rounded-full bg-[linear-gradient(90deg,transparent,#00C8FF)]" />
                        <span className="h-0.5 w-12 rounded-full bg-[linear-gradient(90deg,transparent,#03b3f8)]" />
                    </div>
                    {/* Halo de projection au sol */}
                    <div className="pointer-events-none absolute bottom-2 left-1/2 h-6 w-40 -translate-x-1/2 rounded-[100%] bg-[#00C8FF]/25 blur-xl" />
                    {/*
                       Placeholder mascotte : remplacer par le rendu 3D (robot blanc,
                       optiques cyan) via <Image src="/recherche/mascotte.png" … />.
                    */}
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[linear-gradient(135deg,#013ff4,#02071B)] shadow-[0_20px_60px_rgba(0,200,255,0.35)] ring-1 ring-white/10">
                        <Bot className="h-14 w-14 text-[#00C8FF]" />
                    </div>
                </div>
            </div>
        </div>
    )
}
