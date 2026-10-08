/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section « Services & Tarifs » inspirée de la maquette (catalogue de prestations, tarifs indicatifs FCFA/Gratuit).
 * @created 2026-09-06
 * @updated 2026-10-09 — « Demander un devis » (discussion pré-remplie) ; un prix
 *              non renseigné s'affiche « Sur devis » et non plus « Gratuit ».
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { MessageCircle, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ServiceItemData {
    title: string
    price: number | null
    description?: string
}

interface ProfileServicesSectionProps {
    services?: ServiceItemData[]
    professionName?: string
    onContactClick?: () => void
    /** user_id du professionnel : active « Demander un devis » (absent = sa propre fiche). */
    quoteContactId?: string
    className?: string
}

export function ProfileServicesSection({
    services,
    professionName,
    onContactClick,
    quoteContactId,
    className
}: ProfileServicesSectionProps) {
    // Les vrais services, ou rien. Le repli sur des tarifs d'exemple faisait
    // afficher « 180 000 FCFA » sur des profils qui n'ont jamais rien saisi :
    // un visiteur y lisait une offre ferme, le professionnel découvrait des
    // prix qu'il n'avait pas fixés.
    const displayServices = services ?? []

    // Rien à montrer : la section disparaît plutôt que d'exhiber un cadre vide.
    if (displayServices.length === 0) return null

    const formatPrice = (price: number | null) => {
        // null = prix non renseigné, ce n'est PAS une prestation gratuite.
        if (price === null) {
            return { isFree: false, label: "Sur devis", sublabel: "" }
        }
        if (price === 0) {
            return { isFree: true, label: "Gratuit", sublabel: "" }
        }
        return {
            isFree: false,
            label: `${price.toLocaleString("fr-FR")} FCFA`,
            sublabel: "à partir de"
        }
    }

    return (
        <section
            className={cn(
                "bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-[0_4px_24px_rgb(15,23,42,0.05)] relative overflow-hidden",
                className
            )}
        >
            {/* ── En-tête : SERVICES & TARIFS + Tarifs indicatifs, hors matière ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#013ff4] shrink-0" />
                    <span>SERVICES & TARIFS</span>
                </h2>
                <span className="text-xs text-muted-foreground font-medium tracking-wide">
                    Tarifs indicatifs, hors matière
                </span>
            </div>

            {/* ── Liste des prestations (Image 2) ── */}
            <div className="mt-5 space-y-3.5">
                {displayServices.map((service, index) => {
                    const priceInfo = formatPrice(service.price)

                    return (
                        <div
                            key={index}
                            className="group rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/40 p-4 sm:p-5 transition-all duration-200"
                        >
                          {/* Titre à gauche, prix à droite : lisibles d'un même coup d'œil. */}
                          <div className="flex items-start justify-between gap-4">
                            {/* Titre & Description */}
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm sm:text-base font-extrabold text-foreground group-hover:text-[#013ff4] transition-colors">
                                        {service.title}
                                    </h3>
                                </div>
                                {service.description && (
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                                        {service.description}
                                    </p>
                                )}
                            </div>

                            {/* Prix à droite */}
                            <div className="shrink-0 text-right">
                                {priceInfo.isFree ? (
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-sm sm:text-base">
                                        Gratuit
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-base sm:text-lg font-black text-foreground tracking-tight">
                                            {priceInfo.label}
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-400 block sm:text-right">
                                            {priceInfo.sublabel}
                                        </span>
                                    </div>
                                )}
                            </div>
                          </div>
                                {quoteContactId && service.title && (
                                    <Link
                                        href={`/messages?contact=${quoteContactId}&texte=${encodeURIComponent(`Bonjour, je souhaite un devis pour : ${service.title}`)}`}
                                        className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full border border-[#25D366]/40 px-4 text-xs font-bold text-[#1DA851] hover:bg-[#25D366]/10 active:scale-[0.98]"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Demander un devis
                                    </Link>
                                )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
