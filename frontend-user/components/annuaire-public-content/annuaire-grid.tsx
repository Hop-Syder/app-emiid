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
    tags: string
    status: string
    activity_domain: string
  }
  initialProfiles?: PublicProfile[]
  onlyPremium?: boolean
  theme?: "default" | "red" | "orange"
}

// Nombre de cartes par ligne défilante
const ROW_SIZE = 10

export function AnnuaireGrid({
  filters,
  initialProfiles = [],
  onlyPremium = false,
  theme = "default",
}: AnnuaireGridProps) {
  const {
    profiles,
    loading,
    page,
    setPage,
    totalPages,
    handleResetFilters,
  } = useAnnuaireProfiles({
    filters,
    initialProfiles,
    onlyPremium,
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`skeleton-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="w-full aspect-[1/1.4] bg-white rounded-[2rem] border border-slate-100/50 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="h-[100px] w-full bg-slate-200/50 animate-pulse" />
            <div className="flex-1 p-5 relative">
              <div className="absolute -top-12 left-5 w-20 h-20 rounded-full bg-slate-300/50 animate-pulse border-4 border-white" />
              <div className="mt-10 space-y-3">
                <div className="h-5 w-3/4 bg-slate-200/60 rounded-md animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-200/40 rounded-md animate-pulse" />
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded-md animate-pulse" />
                <div className="h-3 w-full bg-slate-100 rounded-md animate-pulse" />
                <div className="h-3 w-2/3 bg-slate-100 rounded-md animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (profiles.length === 0) {
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
      </div>
    )
  }

  return (
    <div className="space-y-8">
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
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200/60">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={
              theme === "red"
                ? "hover:bg-red-50 hover:text-red-600"
                : theme === "orange"
                  ? "hover:bg-orange-50 hover:text-orange-600"
                  : "hover:bg-slate-100"
            }
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
          </Button>
          <span className="text-sm font-semibold text-slate-500 select-none">
            Page{" "}
            <span
              className={
                theme === "red"
                  ? "text-red-600 font-bold"
                  : theme === "orange"
                    ? "text-orange-600 font-bold"
                    : "text-slate-800 font-bold"
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
                  : "hover:bg-slate-100"
            }
          >
            Suivant <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
