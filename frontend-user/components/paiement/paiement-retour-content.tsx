/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contenu du retour de paiement — lecture de la transaction
 *              (RLS : ses propres lignes) avec polling court tant que le webhook
 *              FedaPay n'a pas basculé le statut. États : attente, succès,
 *              échec, délai dépassé, référence inconnue.
 * @created 2026-08-26
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    AlarmClock,
    CheckCircle2,
    CreditCard,
    Loader2,
    ReceiptText,
    ShieldCheck,
    XCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatFcfa } from "@/hooks/use-subscription"

type PaymentType = "SUBSCRIPTION_PRO" | "PROFILE_BOOST"

interface Transaction {
    id: string
    amount: number
    currency: string
    type: PaymentType
    status: "PENDING" | "SUCCESS" | "FAILED"
    created_at: string
}

type ViewState = "loading" | "pending" | "success" | "failed" | "timeout" | "unknown"

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 90_000

const TYPE_META: Record<PaymentType, { label: string; ctaLabel: string; ctaHref: string; successCopy: string }> = {
    SUBSCRIPTION_PRO: {
        label: "Abonnement Pro",
        ctaLabel: "Voir mon abonnement",
        ctaHref: "/parametres?tab=plan",
        successCopy:
            "Votre abonnement Pro est actif. Vos statistiques d'audience sont déverrouillées et votre profil gagne en visibilité dans l'annuaire.",
    },
    PROFILE_BOOST: {
        label: "Boost de visibilité",
        ctaLabel: "Voir mon boost",
        ctaHref: "/parametres?tab=boost",
        successCopy:
            "Votre boost est actif. Votre profil apparaît en tête des résultats de votre zone pendant toute la durée choisie.",
    },
}

const STATE_COPY: Record<
    ViewState,
    { title: string; description: string }
> = {
    loading: { title: "Vérification du paiement", description: "Nous relisons votre transaction…" },
    pending: {
        title: "Confirmation en cours",
        description:
            "Cette page se met à jour automatiquement dès que FedaPay confirme le paiement — quelques secondes suffisent.",
    },
    success: { title: "Paiement confirmé", description: "" },
    failed: {
        title: "Paiement non abouti",
        description:
            "La transaction a été refusée ou annulée. Aucun montant n'a été prélevé — vous pouvez relancer le paiement à tout moment.",
    },
    timeout: {
        title: "Toujours en attente",
        description:
            "La confirmation tarde à arriver. Si vous avez payé, l'activation se fera automatiquement dès réception de la confirmation opérateur.",
    },
    unknown: {
        title: "Transaction introuvable",
        description: "Aucun paiement récent ne correspond à ce retour de paiement.",
    },
}

export function PaiementRetourContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [state, setState] = useState<ViewState>("loading")
    const [tx, setTx] = useState<Transaction | null>(null)

    // La référence locale (tx.id) est lue une seule fois au premier rendu.
    const initialTxIdRef = useRef<string | null>(searchParams.get("t"))

    const startRef = useRef<number>(0)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    /** Applique le statut d'une transaction et indique si le cycle est terminé. */
    const resolve = useCallback((row: Transaction): boolean => {
        setTx(row)
        if (row.status === "SUCCESS") {
            setState("success")
            return true
        }
        if (row.status === "FAILED") {
            setState("failed")
            return true
        }
        if (Date.now() - startRef.current >= POLL_TIMEOUT_MS) {
            setState("timeout")
            return true
        }
        setState("pending")
        return false
    }, [])

    /** Interroge SA propre transaction (RLS select_own). Sans id : la plus récente. */
    const fetchAndResolve = useCallback(
        async (txId: string | null): Promise<boolean> => {
            const supabase = createClient()
            // eslint-disable-next-line no-restricted-syntax -- accès authentifié à SA PROPRE ligne (RLS OK) pour la réconciliation paiement
            let query = supabase
                .from("payment_transactions")
                .select("id, amount, currency, type, status, created_at")
            query = txId ? query.eq("id", txId) : query.order("created_at", { ascending: false }).limit(1)
            const { data } = await query.maybeSingle()

            if (!data) {
                setTx(null)
                setState("unknown")
                return true
            }
            return resolve(data as Transaction)
        },
        [resolve]
    )

    useEffect(() => {
        let cancelled = false
        startRef.current = Date.now()

        void (async () => {
            const { data: { user } } = await createClient().auth.getUser()
            if (!user) {
                router.replace("/login")
                return
            }

            const finished = await fetchAndResolve(initialTxIdRef.current)
            if (finished || cancelled) return

            const tick = async () => {
                if (cancelled) return
                const done = await fetchAndResolve(initialTxIdRef.current)
                if (done || cancelled) return
                timerRef.current = setTimeout(tick, POLL_INTERVAL_MS)
            }
            timerRef.current = setTimeout(tick, POLL_INTERVAL_MS)
        })()

        return () => {
            cancelled = true
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [fetchAndResolve, router])

    const meta = tx ? TYPE_META[tx.type] : null
    const copy = STATE_COPY[state]
    const dateLabel = tx
        ? new Date(tx.created_at).toLocaleString("fr-FR", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
          })
        : null

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#000616] relative overflow-hidden px-4 py-10">
            {/* Fond décoratif */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#03b3f8]/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#013ff4]/15 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[2rem] px-8 py-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] text-center">
                    <Link href="/" aria-label="Accueil EmiID">
                        <Image
                            src="/logo/logo-emiid.png"
                            alt="EmiID"
                            width={160}
                            height={40}
                            className="h-10 w-auto object-contain mx-auto mb-8 brightness-0 invert opacity-90"
                        />
                    </Link>

                    <div className="flex justify-center mb-6">
                        <StateIcon state={state} />
                    </div>

                    <h1 className="text-2xl font-black text-white tracking-tight">{copy.title}</h1>
                    <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                        {(state === "success" && meta ? meta.successCopy : copy.description) ||
                            STATE_COPY.success.description}
                    </p>

                    {tx && meta && state !== "loading" && (
                        <div className="mt-6 rounded-2xl bg-white/[0.03] border border-white/10 px-5 py-4 text-left space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    {meta.label}
                                </span>
                                <StatusBadge status={tx.status} />
                            </div>
                            <p className="text-xl font-black text-white">{formatFcfa(tx.amount)}</p>
                            <p className="text-[11px] text-slate-500 inline-flex items-center gap-1.5">
                                <ReceiptText className="h-3 w-3" />
                                {dateLabel}
                            </p>
                        </div>
                    )}

                    <div className="mt-8 space-y-3">
                        {state === "success" && meta && (
                            <a
                                href={meta.ctaHref}
                                className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-brand-gradient hover:opacity-90 text-white text-sm font-bold transition-opacity"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                {meta.ctaLabel}
                            </a>
                        )}
                        {state === "failed" && meta && (
                            <a
                                href={meta.ctaHref}
                                className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white text-sm font-semibold transition-colors"
                            >
                                Relancer le paiement
                            </a>
                        )}
                        {state === "timeout" && (
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white text-sm font-semibold transition-colors"
                            >
                                <AlarmClock className="h-4 w-4" />
                                Revérifier maintenant
                            </button>
                        )}
                        {state !== "pending" && state !== "loading" && (
                            <a
                                href="/dashboard-user"
                                className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-transparent border border-white/10 hover:bg-white/[0.04] text-slate-400 hover:text-white text-sm font-semibold transition-colors"
                            >
                                Retour au tableau de bord
                            </a>
                        )}
                    </div>
                </div>

                <p className="text-center text-[11px] text-slate-600 mt-6">
                    Paiement sécurisé FedaPay · Mobile Money · EmiID
                </p>
            </motion.div>
        </div>
    )
}

/** Icône d'état animée au centre de la carte. */
function StateIcon({ state }: { state: ViewState }) {
    if (state === "success") {
        return (
            <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
            >
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </motion.div>
        )
    }
    if (state === "failed" || state === "unknown") {
        return (
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
            </div>
        )
    }
    if (state === "timeout") {
        return (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <AlarmClock className="h-8 w-8 text-amber-400" />
            </div>
        )
    }
    return (
        <div className="w-16 h-16 rounded-2xl bg-[#013ff4]/20 border border-[#03b3f8]/30 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#03b3f8]" />
        </div>
    )
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
    const styles =
        status === "SUCCESS"
            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
            : status === "FAILED"
              ? "bg-red-500/15 text-red-300 border-red-500/30"
              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
    const labels = { SUCCESS: "Payé", FAILED: "Échoué", PENDING: "En attente" }
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}>
            {labels[status]}
        </span>
    )
}
