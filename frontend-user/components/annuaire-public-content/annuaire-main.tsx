/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page principale de l'Annuaire — barre de recherche universelle (nom, tags, compétences, description) + résultats.
 * @created 2026-06-03
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { AnnuaireSearchField } from "./annuaire-search-field"
import { AnnuaireGrid } from "./annuaire-grid"
import { AnnuaireSpotlight } from "./annuaire-spotlight"
import { AnnuaireFilters } from "./annuaire-filters"

import type { PublicProfile } from "@/types"

interface AnnuairePublicContentProps {
    initialCategory?: string
    initialActivityDomain?: string
    initialCity?: string
    /** Requête reçue du serveur (/annuaire?search=…), y compris depuis la dictée vocale. */
    initialSearch?: string
    initialProfiles?: PublicProfile[]
    /** Monté dans un onglet (Réseau) : pas de cadre ni de titre propres. */
    embedded?: boolean
}

/**
 * Enveloppe de section. Hors onglet, elle apparaît en fondu. Dans l'onglet,
 * c'est un simple <div> : le contenu part d'`opacity:0` et ne serait jamais
 * révélé si l'animation ne démarrait pas — un annuaire vide plutôt qu'un
 * annuaire sans fondu. Le changement d'onglet se suffit à lui-même.
 */
function Section({
    animated,
    delay,
    className,
    children,
}: {
    animated: boolean
    delay: number
    className?: string
    children: React.ReactNode
}) {
    if (!animated) return <div className={className}>{children}</div>
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function AnnuairePublicContent({
    initialCategory = "all",
    initialActivityDomain = "all",
    initialCity = "",
    initialSearch = "",
    initialProfiles = [],
    embedded = false,
}: AnnuairePublicContentProps) {
    const [filters, setFilters] = useState({
        // Renseigné dès le premier rendu : la grille part de la bonne requête au lieu
        // d'attendre l'effet de lecture d'URL, qui affichait un état transitoire faux.
        search: initialSearch,
        category: initialCategory,
        country: "all",
        city: initialCity,
        // Découpage administratif (Bénin) : identifiants, pas des libellés.
        department: "",
        commune: "",
        tags: "",
        status: "all",
        activity_domain: initialActivityDomain,
        lat: "",
        lng: ""
    })
    const searchParams = useSearchParams()

    // Se resynchronise à CHAQUE navigation vers /annuaire avec de nouveaux
    // paramètres (recherche vocale, liens externes, suggestions de l'assistant…),
    // y compris quand ce composant est déjà monté : Next.js réutilise l'instance
    // au lieu de la remonter pour une navigation vers la même route, donc un
    // effet à dépendances vides (ancien code) ne se redéclenchait qu'une fois et
    // la deuxième recherche vocale restait bloquée sur la première requête.
    // useSearchParams() est réactif au routeur Next — contrairement à une lecture
    // de window.location.search — d'où son usage ici. Les modifications LOCALES
    // (barre de recherche, filtres) passent volontairement par history.replaceState
    // et non par le routeur (édition à chaque frappe sans re-fetch serveur) : elles
    // ne déclenchent donc jamais cet effet, pas de boucle ni de conflit.
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            search: searchParams.get("search") || prev.search,
            category: searchParams.get("category") || prev.category,
            country: searchParams.get("country") || prev.country,
            city: searchParams.get("city") || prev.city,
            department: searchParams.get("department") || prev.department,
            commune: searchParams.get("commune") || prev.commune,
            tags: searchParams.get("tags") || prev.tags,
            status: searchParams.get("status") || prev.status,
            activity_domain: searchParams.get("activity_domain") || prev.activity_domain,
            lat: searchParams.get("lat") || prev.lat,
            lng: searchParams.get("lng") || prev.lng
        }))
    }, [searchParams])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value }
            if (typeof window !== "undefined") {
                const url = new URL(window.location.href)
                if (value && value !== "all") {
                    url.searchParams.set(key, value)
                } else {
                    url.searchParams.delete(key)
                }
                
                // Si on désactive lat, on enlève aussi lng par précaution, et vice versa. 
                // C'est géré par le onFilterChange ("lat", "") qui fera l'appel pour lng juste après, 
                // mais c'est propre de nettoyer.
                
                window.history.replaceState({}, '', url.toString())
            }
            return next
        })
    }

    const resetFilters = () => {
        setFilters({ search: "", category: "all", country: "all", city: "", department: "", commune: "", tags: "", status: "all", activity_domain: "all", lat: "", lng: "" })
        if (typeof window !== "undefined") {
            window.history.replaceState({}, "", window.location.pathname)
        }
    }

    return (
        <div className={embedded ? "w-full relative overflow-x-clip" : "w-full relative overflow-x-clip bg-muted min-h-screen pb-20"}>
            {/* Halos d'ambiance : hors onglet seulement (ils débordent à 360 px
                et le conteneur de l'onglet n'a pas vocation à les rogner). */}
            {!embedded && (
                <>
                    <div className="absolute top-[20%] left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute top-[60%] right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
                </>
            )}

            <div className={embedded ? "relative z-10 space-y-10" : "max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 py-8"}>

                {/* Le bandeau d'en-tête a été retiré le 05/09 (desktop et mobile).
                    Ce qu'il portait de fonctionnel — le titre de page et le champ
                    de recherche libre — vit désormais dans l'en-tête des
                    résultats, remonté en tête de page le 06/09 : le visiteur
                    arrive sur le titre, la recherche et les filtres, sans avoir
                    à passer la vitrine. */}

                {/* --- SECTION 1: RESULTATS (titre, recherche, filtres, grille) --- */}
                <Section animated={!embedded} delay={0.1} className="space-y-6">
                    {/* En-tête compact : le titre et la recherche partagent une
                        ligne — le titre est court, l'espace à sa droite était
                        perdu. Les filtres suivent, sur deux rangées porteuses de
                        sens (où / quoi). Le paragraphe d'introduction a été
                        retiré : il ne disait rien que le titre ne dise déjà, et
                        son lien « Réinitialiser » fait doublon avec celui de la
                        barre de filtres. */}
                    <div className="space-y-3 border-b border-border pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Dans l'onglet Réseau, le titre de page est « Réseau » :
                                ce second titre ferait doublon. */}
                            {/* h1 et non h2 : le bandeau supprimé portait le seul
                                titre de premier niveau des trois routes /annuaire. */}
                            {!embedded && (
                                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                                    Tous les <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0150fd] to-blue-600">Profils</span>
                                </h1>
                            )}

                            {/* Recueillie du bandeau supprimé : les filtres ne
                                sont que des listes, c'est ici et nulle part
                                ailleurs qu'on tape un mot. */}
                            <AnnuaireSearchField
                                searchQuery={filters.search}
                                onSearchChange={(v) => handleFilterChange("search", v)}
                            />
                        </div>

                        <AnnuaireFilters filters={filters} onFilterChange={handleFilterChange} onReset={resetFilters} />
                    </div>

                    <div className="pt-4">
                        <AnnuaireGrid
                            filters={filters}
                            initialProfiles={initialProfiles}
                            theme="default"
                            onSearch={(q) => handleFilterChange("search", q)}
                        />
                    </div>
                </Section>

                {/* --- SECTION 2: SPOTLIGHT --- */}
                <Section animated={!embedded} delay={0.3}>
                    <AnnuaireSpotlight />
                </Section>

            </div>
        </div>
    )
}
