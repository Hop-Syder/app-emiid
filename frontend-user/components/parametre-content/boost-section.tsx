/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description BoostSection — Achat de visibilité communale (Mobile Money).
 *              Sélection de la commune ciblée, choix de la durée, paiement
 *              FedaPay. Aligné charte (bleu roi #013ff4 / cyan #03b3f8) ;
 *              l'or #F59E0B signale la mise en vedette (spec §2.A).
 * @created 2026-08-24
 */

"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Rocket, AlertCircle, Loader2, Check, Clock, Search, Globe2 } from "lucide-react"
import { useBoost, BOOST_PLANS, plansForScope, type BoostScope } from "@/hooks/use-boost"
import { formatFcfa } from "@/hooks/use-subscription"

/** Reste à courir avant expiration, en langage courant. */
function remaining(iso: string): string {
    const ms = new Date(iso).getTime() - Date.now()
    if (ms <= 0) return "expiré"
    const hours = Math.floor(ms / 3_600_000)
    if (hours < 24) return `${hours} h restantes`
    return `${Math.floor(hours / 24)} j restants`
}

export function BoostSection() {
    const { communes, departments, profileCommuneId, activeBoost, loading, checkoutLoading, error, startBoostCheckout } = useBoost()
    const [scope, setScope] = useState<BoostScope>("COMMUNE")
    const [selected, setSelected] = useState<string>("")
    const [selectedDept, setSelectedDept] = useState<string>("")
    const [filter, setFilter] = useState("")

    // Présélection : la commune du profil, quand elle est connue.
    useEffect(() => {
        if (profileCommuneId && !selected) setSelected(profileCommuneId)
    }, [profileCommuneId, selected])

    const visible = useMemo(() => {
        const q = filter.trim().toLowerCase()
        if (!q) return communes
        return communes.filter(
            (c) => c.name.toLowerCase().includes(q) || c.department.toLowerCase().includes(q)
        )
    }, [communes, filter])

    const busy = checkoutLoading !== null
    const target = scope === "COMMUNE" ? selected : selectedDept

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8">
            <div>
                <h3 className="text-lg font-bold text-slate-900">Boost de visibilité</h3>
                <p className="text-slate-500 text-xs mt-1">
                    Passez en tête des résultats dans la commune de votre choix, pour une durée limitée.
                </p>
            </div>

            {/* ── Boost actif ───────────────────────────────────────────────── */}
            {activeBoost && (
                <div className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/[0.06] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F59E0B]/15 text-[#B45309]">
                                <Rocket className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-sm font-black text-slate-900">
                                    En vedette {activeBoost.scope === "COMMUNE" ? "à" : "dans le"} {activeBoost.targetName}
                                </p>
                                <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    {remaining(activeBoost.expiresAt)}
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#F59E0B]/40 bg-white px-3 py-1.5 text-xs font-bold text-[#B45309]">
                            <Check className="h-3.5 w-3.5" />
                            Boost actif
                        </span>
                    </div>
                </div>
            )}

            {/* ── Erreur ────────────────────────────────────────────────────── */}
            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                    <div>
                        <p className="text-sm font-bold text-rose-900">Paiement impossible</p>
                        <p className="text-xs text-rose-700">{error}</p>
                    </div>
                </div>
            )}

            {/* ── Portée et cible ──────────────────────────────────────────── */}
            <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Portée du boost</h5>

                <div className="grid grid-cols-2 gap-2">
                    {([
                        { id: "COMMUNE" as BoostScope, icon: MapPin, title: "Communale", desc: "Atelier fixe" },
                        { id: "DEPARTMENT" as BoostScope, icon: Globe2, title: "Départementale", desc: "Pro mobile / PME" },
                    ]).map((opt) => {
                        const active = scope === opt.id
                        return (
                            <button
                                key={opt.id}
                                onClick={() => setScope(opt.id)}
                                className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-left transition-colors ${
                                    active
                                        ? "border-[#013ff4] bg-[#013ff4]/[0.05]"
                                        : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <opt.icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-[#013ff4]" : "text-slate-400"}`} />
                                <span className="min-w-0">
                                    <span className={`block text-xs font-black ${active ? "text-[#013ff4]" : "text-slate-800"}`}>
                                        {opt.title}
                                    </span>
                                    <span className="block text-[11px] font-medium text-slate-500">{opt.desc}</span>
                                </span>
                            </button>
                        )
                    })}
                </div>

                <h5 className="pt-2 text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#013ff4]" />
                    {scope === "COMMUNE" ? "Commune ciblée" : "Département ciblé"}
                </h5>

                {loading ? (
                    <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                ) : scope === "COMMUNE" ? (
                    <>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                            <Search className="h-4 w-4 shrink-0 text-slate-400" />
                            <input
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                placeholder="Filtrer par commune ou département…"
                                aria-label="Filtrer les communes"
                                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>

                        <select
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            aria-label="Commune à cibler"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#013ff4]/40 focus:outline-none"
                        >
                            <option value="">— Choisir une commune —</option>
                            {visible.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.department})
                                </option>
                            ))}
                        </select>

                        {!profileCommuneId && (
                            <p className="text-[11px] font-medium text-amber-700">
                                Votre profil n&apos;est rattaché à aucune commune : renseignez votre ville dans
                                l&apos;onglet Profil pour qu&apos;elle soit présélectionnée.
                            </p>
                        )}
                    </>
                ) : (
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        aria-label="Département à cibler"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#013ff4]/40 focus:outline-none"
                    >
                        <option value="">— Choisir un département —</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* ── Forfaits ──────────────────────────────────────────────────── */}
            <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Durée du boost</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {plansForScope(scope).map((planId) => {
                        const plan = BOOST_PLANS[planId]
                        const best = planId.endsWith("_30D")
                        return (
                            <motion.div
                                key={planId}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative rounded-2xl border p-5 flex flex-col justify-between gap-4 ${
                                    best ? "border-[#013ff4]/30 bg-[#013ff4]/[0.03]" : "border-slate-200"
                                }`}
                            >
                                {best && (
                                    <span className="absolute -top-2.5 right-4 rounded-full bg-[#013ff4] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                                        Meilleur tarif
                                    </span>
                                )}
                                <div>
                                    <p className="text-xs font-bold text-slate-500">{plan.label}</p>
                                    <p className="mt-1 text-2xl font-black text-slate-900">{formatFcfa(plan.amount)}</p>
                                    <p className="text-[11px] font-medium text-slate-400">{plan.duration}</p>
                                </div>
                                <button
                                    onClick={() => startBoostCheckout(planId, target)}
                                    disabled={busy || !target || loading}
                                    className={`w-full rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        best
                                            ? "bg-[#013ff4] text-white shadow-lg shadow-[#013ff4]/25 hover:bg-[#0135d0]"
                                            : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
                                    }`}
                                >
                                    {checkoutLoading === planId ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Redirection…
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="h-4 w-4" />
                                            Booster
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )
                    })}
                </div>

                <p className="text-[11px] text-slate-400 font-medium">
                    Paiement MTN MoMo, Moov ou Celtiis. La durée court à partir de la confirmation du paiement.
                    Un boost communal place votre profil en tête des recherches de la commune ; un boost départemental le remonte sur tout le département, juste en dessous des boosts communaux.
                </p>
            </div>
        </div>
    )
}
