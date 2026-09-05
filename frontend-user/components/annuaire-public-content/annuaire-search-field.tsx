/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Champ de recherche libre de l'annuaire.
 *
 *              Extrait de annuaire-hero le 05/09, lors de la suppression du
 *              bandeau. C'était le SEUL champ texte de la page : les filtres
 *              facettés ne proposent que des listes déroulantes (type, secteur,
 *              pays). Le retirer avec le bandeau aurait rendu impossible toute
 *              recherche ou correction de requête sur la page même où atterrit
 *              la recherche vocale et la saisie du FAB.
 *
 *              Il vit désormais dans l'en-tête des résultats, sur fond clair.
 *              La saisie reste débouncée à 300 ms : on filtre pendant la frappe
 *              sans lancer une requête par caractère.
 * @created 2026-09-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"

interface AnnuaireSearchFieldProps {
    searchQuery: string
    onSearchChange: (value: string) => void
}

export function AnnuaireSearchField({ searchQuery, onSearchChange }: AnnuaireSearchFieldProps) {
    const [value, setValue] = useState(searchQuery)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Resynchronise le champ si le filtre est réinitialisé ailleurs
    // (bouton « Réinitialiser », retour arrière du navigateur…).
    useEffect(() => {
        setValue(searchQuery)
    }, [searchQuery])

    // Le minuteur survivrait au démontage et appellerait onSearchChange sur un
    // composant disparu : on le purge.
    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current)
    }, [])

    const handleChange = (v: string) => {
        setValue(v)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => onSearchChange(v), 300)
    }

    const clear = () => {
        setValue("")
        if (timer.current) clearTimeout(timer.current)
        onSearchChange("")
    }

    return (
        <div className="w-full sm:w-80 shrink-0">
            <div className="relative flex items-center h-12 px-4 rounded-2xl bg-card border border-border focus-within:border-[#013ff4]/60 focus-within:ring-2 focus-within:ring-[#013ff4]/15 shadow-sm transition-all duration-200">
                <Search className="w-4 h-4 text-muted-foreground mr-2.5 shrink-0" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Rechercher un profil, un métier…"
                    aria-label="Rechercher dans l'annuaire"
                    className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/80 outline-none min-w-0"
                />
                {value && (
                    <button
                        type="button"
                        onClick={clear}
                        aria-label="Effacer la recherche"
                        className="ml-2 shrink-0 flex items-center justify-center h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}
