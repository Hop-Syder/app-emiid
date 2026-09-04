/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Talents de la commune de l'utilisateur — section du tableau de bord.
 *
 *              Se place après « Talents autour de … », et raisonne à une échelle
 *              plus fine : la COMMUNE administrative du profil
 *              (user_profiles.commune_id) plutôt que la ville ou le GPS. C'est
 *              le découpage des boosts payants, dont les profils remontent ici
 *              en tête — la section leur sert de vitrine.
 *
 *              Elle se masque entièrement quand elle n'a rien à dire : profil
 *              sans commune rattachée, ou aucun autre membre dans la commune.
 *              Un bloc vide sur un tableau de bord se lit comme une panne.
 *
 *              Nécessite la migration 20260904 et /api/dashboard-user/commune.
 * @created 2026-09-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Building2, Loader2, Sparkles } from "lucide-react"
import { EntrepreneursSection } from "./entrepreneurs-section"
import type { PublicProfile } from "@/types"

interface CommuneResponse {
    profiles?: PublicProfile[]
    commune?: string | null
    boostedCount?: number
}

export function CommuneSection() {
    const [profiles, setProfiles] = useState<PublicProfile[]>([])
    const [commune, setCommune] = useState<string | null>(null)
    const [boostedCount, setBoostedCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        ;(async () => {
            try {
                const res = await fetch("/api/dashboard-user/commune")
                if (!res.ok) return
                const data = (await res.json()) as CommuneResponse
                if (!active) return
                setProfiles(data.profiles || [])
                setCommune(data.commune ?? null)
                setBoostedCount(data.boostedCount || 0)
            } catch (err) {
                // Section secondaire : un échec la masque, il ne remonte pas à
                // l'utilisateur — le tableau de bord reste utilisable.
                console.error("Chargement des talents de la commune impossible", err)
            } finally {
                if (active) setLoading(false)
            }
        })()

        return () => {
            active = false
        }
    }, [])

    // Rien à montrer : on ne laisse pas un titre orphelin au-dessus du vide.
    if (!loading && profiles.length === 0) return null

    return (
        <div className="space-y-4 pt-4">
            <div className="flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
                <h3 className="text-lg sm:text-2xl font-black text-foreground flex items-center gap-2 sm:gap-3 tracking-tight min-w-0">
                    <div className="p-1.5 sm:p-2 bg-[#013ff4]/10 rounded-xl shrink-0 relative overflow-hidden">
                        {loading && <div className="absolute inset-0 bg-[#013ff4]/20 animate-ping rounded-xl" />}
                        <Building2 className="text-[#013ff4] w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                    </div>
                    <span className="truncate flex items-center gap-2">
                        {/* Le nom de la commune n'arrive qu'avec la réponse : on
                            affiche un intitulé générique en attendant, jamais un
                            « undefined » ni un espace vide. */}
                        {commune ? `Dans votre commune · ${commune}` : "Dans votre commune"}
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-[#013ff4] shrink-0" />}
                    </span>
                </h3>

                <Link
                    href="/annuaire"
                    className="text-xs sm:text-sm font-semibold text-[#013ff4] hover:text-[#0135d0] flex items-center gap-1 group shrink-0"
                >
                    Voir tout{" "}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Mention de la mise en avant payante : les profils boostés sont en
                tête, l'utilisateur doit savoir que ce classement est acheté. */}
            {!loading && boostedCount > 0 && (
                <p className="px-1 sm:px-2 text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                    {boostedCount === 1
                        ? "1 profil mis en avant dans votre commune"
                        : `${boostedCount} profils mis en avant dans votre commune`}
                </p>
            )}

            <EntrepreneursSection
                entrepreneursList={profiles}
                loading={loading && profiles.length === 0}
                variant="glass-blue"
            />
        </div>
    )
}
