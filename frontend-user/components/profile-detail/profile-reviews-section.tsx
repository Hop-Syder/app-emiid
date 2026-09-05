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

import { useState } from "react"
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

// Avis de référence fidèles à l'Image 2
const INITIAL_REVIEWS: ReviewItem[] = [
    {
        id: "rev-1",
        authorName: "Adjoua K.",
        authorInitials: "AK",
        rating: 5,
        date: "Il y a 3 semaines",
        comment:
            "Bibliothèque livrée en trois semaines comme annoncé. Les mesures étaient au millimètre, le montage fait sur place sans dégâts. Le devis n'a pas bougé.",
        isVerifiedClient: true,
        avatarColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
    },
    {
        id: "rev-2",
        authorName: "Sylvain H.",
        authorInitials: "SH",
        rating: 5,
        date: "Il y a 2 mois",
        comment:
            "Très bon travail sur la restauration d'une commode. Un peu de retard au démarrage, prévenu à l'avance.",
        isVerifiedClient: false,
        avatarColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
        artisanResponse: {
            authorName: "Christian",
            comment:
                "Merci Sylvain. Le retard venait d'un lot de teck arrivé hors délai chez le fournisseur — j'ai changé depuis."
        }
    }
]

// Distribution des étoiles fidèle à l'Image 2 (Total 23 avis)
const RATING_DISTRIBUTION = [
    { star: 5, count: 18, percentage: 78 },
    { star: 4, count: 3, percentage: 13 },
    { star: 3, count: 2, percentage: 9 },
    { star: 2, count: 0, percentage: 0 },
    { star: 1, count: 0, percentage: 0 }
]

export function ProfileReviewsSection({
    profileId,
    profileName,
    className
}: ProfileReviewsSectionProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS)
    const [isAddReviewOpen, setIsAddReviewOpen] = useState(false)
    const [newRating, setNewRating] = useState(5)
    const [newAuthor, setNewAuthor] = useState("")
    const [newComment, setNewComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [showAll, setShowAll] = useState(false)

    const professionalFirstName = profileName
        ? profileName.split(" ")[0]?.toUpperCase()
        : "L'ARTISAN"

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newAuthor.trim()) {
            toast.error("Veuillez renseigner votre nom.")
            return
        }
        if (!newComment.trim()) {
            toast.error("Veuillez rédiger votre retour d'expérience.")
            return
        }

        setSubmitting(true)
        setTimeout(() => {
            const initials = newAuthor
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("")

            const newRev: ReviewItem = {
                id: `rev-${Date.now()}`,
                authorName: newAuthor.trim(),
                authorInitials: initials || "CL",
                rating: newRating,
                date: "À l'instant",
                comment: newComment.trim(),
                isVerifiedClient: true,
                avatarColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            }

            setReviews([newRev, ...reviews])
            setNewAuthor("")
            setNewComment("")
            setNewRating(5)
            setIsAddReviewOpen(false)
            setSubmitting(false)
            toast.success("Merci ! Votre avis a été publié avec succès.")
        }, 600)
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

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddReviewOpen(true)}
                    className="rounded-xl h-9 text-xs px-4 font-bold border-border bg-card hover:bg-muted shadow-sm transition-all hover:-translate-y-0.5 text-foreground"
                >
                    Laisser un avis
                </Button>
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

                        <Input
                            value={newAuthor}
                            onChange={(e) => setNewAuthor(e.target.value)}
                            placeholder="Votre nom ou prénom (ex: Mireille T.)"
                            className="bg-card text-xs font-semibold"
                            required
                        />

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
                        4,7
                    </div>
                    <div className="flex items-center gap-1 mt-2.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className="h-4 w-4 text-amber-400 fill-amber-400"
                            />
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold mt-1.5">
                        23 avis
                    </div>
                </div>

                {/* Barres horizontales de distribution (Image 2) */}
                <div className="flex-1 w-full space-y-2">
                    {RATING_DISTRIBUTION.map((item) => (
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
