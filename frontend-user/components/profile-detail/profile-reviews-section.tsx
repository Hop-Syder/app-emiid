/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section « Avis Clients » inspirée de la maquette (note 4,7, barres de distribution par étoiles, avis vérifiés, réponse de l'artisan et modal d'avis).
 * @created 2026-09-06
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Star,
    MessageSquareQuote,
    Check,
    CornerDownRight,
    Sparkles,
    Send,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

async function getAuthHeaders(includeJson = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {}
    if (includeJson) {
        headers["Content-Type"] = "application/json"
    }
    try {
        const supabase = createClient()
        let { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const res = await supabase.auth.getSession()
                session = res.data.session
            }
        }
        if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`
        }
    } catch {
        // En cas d'erreur locale, les cookies restent transmis
    }
    return headers
}

export interface ReviewItem {
    id: string
    authorName: string
    authorInitials: string
    rating: number
    date: string
    comment: string
    isVerifiedClient: boolean
    avatarColor?: string
    artisanResponse?: {
        authorName: string
        comment: string
    }
}

interface ProfileReviewsSectionProps {
    profileId: string
    profileName?: string
    className?: string
}

/** Synthèse renvoyée par /api/profiles/[id]/reviews. */
interface ReviewStats {
    count: number
    average: number
    distribution: Record<string, number>
}

export function ProfileReviewsSection({
    profileId,
    profileName,
    className
}: ProfileReviewsSectionProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>([])
    const [stats, setStats] = useState<ReviewStats>({ count: 0, average: 0, distribution: {} })
    const [loading, setLoading] = useState(true)
    // Décidé par la base, jamais par l'écran : plus de dix messages échangés
    // avec ce professionnel, dans les deux sens.
    const [canReview, setCanReview] = useState(false)
    const [isAddReviewOpen, setIsAddReviewOpen] = useState(false)
    const [newRating, setNewRating] = useState(5)
    const [newComment, setNewComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [showAll, setShowAll] = useState(false)

    const loadReviews = useCallback(async () => {
        if (!profileId) { setLoading(false); return }
        try {
            const headers = await getAuthHeaders(false)
            const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/reviews`, {
                headers,
            })
            if (!res.ok) throw new Error("chargement impossible")
            const data = await res.json()
            setReviews(Array.isArray(data.reviews) ? data.reviews : [])
            if (data.stats) setStats(data.stats)
            setCanReview(data.canReview === true)
        } catch {
            // Silencieux : une section d'avis indisponible ne doit pas couvrir
            // le profil d'un message d'erreur.
            setReviews([])
        } finally {
            setLoading(false)
        }
    }, [profileId])

    useEffect(() => { void loadReviews() }, [loadReviews])

    const professionalFirstName = profileName
        ? profileName.split(" ")[0]?.toUpperCase()
        : "L'ARTISAN"

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        const comment = newComment.trim()
        // Le nom n'est plus saisi : il vient du compte connecté. Un champ libre
        // laissait signer un avis sous n'importe quelle identité.
        if (comment.length < 10) {
            toast.error("Votre retour doit faire au moins 10 caractères.")
            return
        }

        try {
            const supabase = createClient()
            let { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    toast.error("Connectez-vous pour laisser un avis.")
                    return
                }
            }
        } catch {
            // Continuation
        }

        setSubmitting(true)
        try {
            const headers = await getAuthHeaders(true)
            const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/reviews`, {
                method: "POST",
                headers,
                body: JSON.stringify({ rating: newRating, comment }),
            })
            const data = await res.json().catch(() => null)

            if (!res.ok) {
                toast.error(data?.error || "Impossible de publier votre avis.")
                return
            }

            setNewComment("")
            setNewRating(5)
            setIsAddReviewOpen(false)
            // On relit la liste plutôt que d'y insérer une ligne devinée : le
            // nom affiché, la date et le rang viennent du serveur.
            await loadReviews()
            toast.success("Merci ! Votre avis est publié.")
        } catch {
            toast.error("Erreur réseau.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section
            className={cn(
                "bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-[0_4px_24px_rgb(15,23,42,0.05)] relative overflow-hidden",
                className
            )}
        >
            {/* ── En-tête : AVIS + Bouton Laisser un avis (Image 2) ── */}
            <div className="flex flex-row items-center justify-between gap-3 pb-4 border-b border-border/60">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquareQuote className="h-4 w-4 text-[#013ff4] shrink-0" />
                    <span>AVIS</span>
                </h2>

                {/* Proposer un bouton qui sera refusé serait une promesse non
                    tenue : il n'apparaît que si le droit est acquis. */}
                {canReview && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddReviewOpen(true)}
                        className="rounded-xl h-9 text-xs px-4 font-bold border-border bg-card hover:bg-muted shadow-sm transition-all hover:-translate-y-0.5 text-foreground"
                    >
                        Laisser un avis
                    </Button>
                )}
            </div>

            {/* ── Formulaire Modal « Laisser un avis » ── */}
            {isAddReviewOpen && (
                <div className="mt-4 p-5 rounded-2xl bg-muted/40 border border-border space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#013ff4]" />
                            <h3 className="text-sm font-extrabold text-foreground">
                                Votre avis sur la prestation
                            </h3>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAddReviewOpen(false)}
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmitReview} className="space-y-3.5">
                        {/* Étoiles sélectionnables */}
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <Star
                                        className={cn(
                                            "h-5 w-5",
                                            star <= newRating
                                                ? "text-amber-400 fill-amber-400"
                                                : "text-slate-300 dark:text-slate-700"
                                        )}
                                    />
                                </button>
                            ))}
                            <span className="text-xs font-bold text-foreground ml-2">
                                {newRating} / 5
                            </span>
                        </div>

                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            placeholder="Partagez votre retour d'expérience : ponctualité, qualité du travail, respect du devis..."
                            className="w-full rounded-xl border border-border bg-card p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#013ff4]/20 focus:border-[#013ff4] resize-none font-medium"
                            required
                        />

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsAddReviewOpen(false)}
                                className="text-xs font-bold"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={submitting}
                                className="bg-[#013ff4] hover:bg-[#013ff4]/90 text-white font-bold text-xs gap-1.5 rounded-xl shadow-sm"
                            >
                                <Send className="h-3.5 w-3.5" />
                                {submitting ? "Publication..." : "Publier l'avis"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Synthèse globale : Note 4,7 + Distribution par étoiles (Image 2) ── */}
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-muted/20 border border-border/70 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                {/* Note géante */}
                <div className="flex flex-col items-center justify-center shrink-0 min-w-[130px] text-center">
                    <div className="text-5xl font-black text-foreground tracking-tight leading-none">
                        {stats.average.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </div>
                    <div className="flex items-center gap-1 mt-2.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn(
                                    "h-4 w-4",
                                    star <= Math.round(stats.average)
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-slate-300 dark:text-slate-700",
                                )}
                            />
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold mt-1.5">
                        {stats.count} avis
                    </div>
                </div>

                {/* Barres horizontales de distribution (Image 2) */}
                <div className="flex-1 w-full space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = stats.distribution?.[String(star)] ?? 0
                        // Pourcentage rapporté au total : à zéro avis, toutes
                        // les barres restent vides plutôt que de diviser par 0.
                        const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0
                        return { star, count, percentage }
                    }).map((item) => (
                        <div key={item.star} className="flex items-center gap-3 text-xs">
                            <span className="w-2.5 font-bold text-slate-500 text-right">
                                {item.star}
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                            <span className="w-4 font-bold text-slate-400 text-right text-[11px]">
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Liste des avis (Image 2) ── */}
            <div className="mt-8 divide-y divide-border/60 space-y-6">
                {reviews.map((rev) => (
                    <article key={rev.id} className="pt-6 first:pt-0 space-y-2.5">
                        {/* En-tête de l'avis : Avatar, Nom, Étoiles, Badge vérifié, Date */}
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            {/* Avatar rond initiales */}
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-black shrink-0",
                                    rev.avatarColor || "bg-blue-100 text-blue-700"
                                )}
                            >
                                {rev.authorInitials}
                            </div>

                            <span className="font-extrabold text-sm text-foreground">
                                {rev.authorName}
                            </span>

                            {/* Étoiles dorées */}
                            <div className="flex items-center gap-0.5">
                                {[...Array(rev.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-3.5 w-3.5 text-amber-400 fill-amber-400"
                                    />
                                ))}
                            </div>

                            {/* Badge CLIENT VÉRIFIÉ (Image 2) */}
                            {rev.isVerifiedClient && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                    CLIENT VÉRIFIÉ
                                </span>
                            )}

                            <span className="text-xs text-slate-400 font-medium ml-auto sm:ml-0">
                                {rev.date}
                            </span>
                        </div>

                        {/* Commentaire de l'avis */}
                        <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed pl-1 sm:pl-11">
                            {rev.comment}
                        </p>

                        {/* Réponse officielle de l'artisan avec bordure bleue (Image 2) */}
                        {rev.artisanResponse && (
                            <div className="mt-3.5 ml-2 sm:ml-11 rounded-r-2xl border-l-4 border-[#013ff4] bg-slate-50 dark:bg-slate-900/60 p-4 space-y-1.5 shadow-xs">
                                <div className="text-[10px] font-black text-[#013ff4] dark:text-[#03b3f8] uppercase tracking-wider flex items-center gap-1.5">
                                    <CornerDownRight className="h-3.5 w-3.5" />
                                    <span>
                                        RÉPONSE DE {rev.artisanResponse.authorName.toUpperCase() || professionalFirstName}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                                    {rev.artisanResponse.comment}
                                </p>
                            </div>
                        )}
                    </article>
                ))}
            </div>

            {/* ── Bouton centré : Voir les 23 avis (Image 2) ── */}
            <div className="mt-8 text-center pt-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setShowAll(!showAll)
                        toast.info("Affichage des avis complets.")
                    }}
                    className="rounded-2xl border-border bg-card hover:bg-muted font-extrabold text-xs px-6 py-2.5 shadow-xs text-foreground transition-all hover:-translate-y-0.5"
                >
                    Voir les 23 avis
                </Button>
            </div>
        </section>
    )
}
