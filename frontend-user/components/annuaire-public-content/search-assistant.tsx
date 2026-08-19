/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Assistant de recherche (Couche ③) — affiché sous l'état vide de
 *              l'annuaire quand une recherche ne renvoie aucun résultat.
 *              Récupère un message + des suggestions cliquables via
 *              /api/search-assistant (Groq/Llama). Silencieux si indisponible.
 *              Design aligné charte (bleu roi #013ff4 / cyan #03b3f8).
 * @created 2026-08-21
 */

"use client"

import { useEffect, useState } from "react"
import { Sparkles, ArrowUpRight } from "lucide-react"

interface SearchAssistantProps {
    /** Requête ayant donné 0 résultat. */
    query: string
    /** Relance la recherche avec la suggestion choisie. */
    onPick: (q: string) => void
}

interface AssistantData {
    message: string
    suggestions: string[]
}

export function SearchAssistant({ query, onPick }: SearchAssistantProps) {
    const [data, setData] = useState<AssistantData | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const q = query?.trim()
        if (!q || q.length < 2) {
            setData(null)
            return
        }
        let active = true
        setLoading(true)
        setData(null)
        ;(async () => {
            try {
                const res = await fetch(`/api/search-assistant?q=${encodeURIComponent(q)}`)
                if (!res.ok) return
                const json = (await res.json()) as AssistantData
                if (active && (json.message || json.suggestions?.length)) {
                    setData(json)
                }
            } catch {
                /* dégradation silencieuse */
            } finally {
                if (active) setLoading(false)
            }
        })()
        return () => {
            active = false
        }
    }, [query])

    // Skeleton discret pendant la réflexion de l'assistant.
    if (loading) {
        return (
            <div className="mx-auto mt-6 max-w-md animate-pulse rounded-3xl border border-[#013ff4]/10 bg-[#013ff4]/[0.03] p-5">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-2xl bg-[#013ff4]/10" />
                    <div className="h-3 w-40 rounded-full bg-slate-200" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    <div className="h-8 w-28 rounded-full bg-slate-200" />
                    <div className="h-8 w-24 rounded-full bg-slate-200" />
                    <div className="h-8 w-32 rounded-full bg-slate-200" />
                </div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-3xl border border-[#013ff4]/12 bg-white shadow-[0_18px_45px_-20px_rgba(1,63,244,0.35)]">
            {/* Bandeau assistant — dégradé charte */}
            <div className="relative flex items-center gap-3 bg-[linear-gradient(135deg,#013ff4_0%,#03b3f8_100%)] p-4 text-white">
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-2xl" />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                    <Sparkles className="h-[18px] w-[18px]" />
                </div>
                <p className="text-sm font-bold">Assistant de recherche</p>
            </div>

            <div className="p-5">
                {data.message && (
                    <p className="text-sm font-medium leading-relaxed text-slate-600">{data.message}</p>
                )}

                {data.suggestions.length > 0 && (
                    <>
                        <p className="mb-2.5 mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Essayez plutôt
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {data.suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => onPick(s)}
                                    className="group inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-[#013ff4]/40 hover:bg-[#013ff4]/[0.05] hover:text-[#013ff4]"
                                >
                                    {s}
                                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-[#013ff4]" />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
