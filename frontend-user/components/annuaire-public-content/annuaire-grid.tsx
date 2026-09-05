/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Grille de l'annuaire public découpée en lignes horizontales défilantes de 10 profils avec flèches de contrôle.
 * @created 2026-06-13
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion } from "framer-motion"
import { ProfileRow } from "./profile-row"
import { SearchAssistant } from "./search-assistant"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import type { PublicProfile } from "@/types"
import { useAnnuaireProfiles } from "@/hooks/use-annuaire-profiles"

interface AnnuaireGridProps {
  filters?: {
    search: string
    category: string
    country: string
    city: string
    /** Découpage administratif (Bénin) : identifiants, pas des libellés. */
    department: string
    commune: string
    tags: string
    status: string
    activity_domain: string
    lat?: string
    lng?: string
  }
  initialProfiles?: PublicProfile[]
  onlyPremium?: boolean
  theme?: "default" | "red" | "orange"
  /** Relance une recherche (utilisé par l'assistant sur 0 résultat). */
  onSearch?: (q: string) => void
}

// Nombre de cartes par ligne défilante
const ROW_SIZE = 10

export function AnnuaireGrid({
  filters,
  initialProfiles = [],
  onlyPremium = false,
  theme = "default",
  onSearch,
}: AnnuaireGridProps) {
  const {
    profiles,
    loading,
    page,
    setPage,
    totalPages,
    degraded,
    handleResetFilters,
  } = useAnnuaireProfiles({
    filters,
    initialProfiles,
    onlyPremium,
  })

  // Squelette calé sur la carte compacte : mêmes proportions et mêmes repères
  // (catégorie, avatar centré, nom, rôle, deux compteurs), pour que le passage
  // au contenu réel ne fasse pas sauter la mise en page.
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`skeleton-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="w-full max-w-[200px] min-h-[212px] mx-auto bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col items-center p-4"
          >
            <div className="h-4 w-20 self-start rounded-full bg-muted/60 animate-pulse" />
            <div className="mt-3 h-16 w-16 rounded-full bg-slate-300/50 animate-pulse" />
            <div className="mt-3 h-4 w-24 rounded-md bg-muted/60 animate-pulse" />
            <div className="mt-2 h-3 w-16 rounded-md bg-muted/40 animate-pulse" />
            <div className="mt-4 flex items-center gap-4">
              <div className="h-6 w-8 rounded-md bg-muted animate-pulse" />
              <div className="h-6 w-8 rounded-md bg-muted animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (profiles.length === 0) {
    const searchTerm = filters?.search?.trim() || ""
    return (
      <div className="max-w-md mx-auto py-10">
        <EmptyState
          icon={Search}
          title="Aucun résultat trouvé"
          description="Nous n'avons trouvé aucun profil correspondant à vos critères de recherche. Essayez d'autres filtres."
          actionText="Réinitialiser les filtres"
          onAction={handleResetFilters}
          colorTheme={theme}
        />
        {/* Assistant IA (Couche ③) : suggestions sur recherche infructueuse. */}
        {searchTerm && onSearch && (
          <SearchAssistant query={searchTerm} onPick={onSearch} />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Repli lexical actif : les profils affichés sont pertinents, mais l'ordre
          n'est pas celui du moteur de pertinence. On le dit franchement plutôt
          que de laisser croire à un classement fiable. */}
      {degraded && (
        <div
          role="status"
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
        >
          Le classement par pertinence est momentanément indisponible. Voici les
          profils dont la fiche contient vos mots-clés.
        </div>
      )}

      {/* Lignes de ROW_SIZE cartes max */}
      {Array.from({ length: Math.ceil(profiles.length / ROW_SIZE) }, (_, rowIndex) => (
        <ProfileRow
          key={`row-${rowIndex}-${profiles[rowIndex * ROW_SIZE]?.id ?? rowIndex}`}
          profiles={profiles.slice(rowIndex * ROW_SIZE, (rowIndex + 1) * ROW_SIZE)}
          theme={theme}
        />
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={
              theme === "red"
                ? "hover:bg-red-50 hover:text-red-600"
                : theme === "orange"
                  ? "hover:bg-orange-50 hover:text-orange-600"
                  : "hover:bg-muted"
            }
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
          </Button>
          <span className="text-sm font-semibold text-muted-foreground select-none">
            Page{" "}
            <span
              className={
                theme === "red"
                  ? "text-red-600 font-bold"
                  : theme === "orange"
                    ? "text-orange-600 font-bold"
                    : "text-foreground font-bold"
              }
            >
              {page}
            </span>{" "}
            sur {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={
              theme === "red"
                ? "hover:bg-red-50 hover:text-red-600"
                : theme === "orange"
                  ? "hover:bg-orange-50 hover:text-orange-600"
                  : "hover:bg-muted"
            }
          >
            Suivant <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
