/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section d'affichage des entrepreneurs — carrousel horizontal sur
 *              mobile/tablette, grille dense multi-colonnes sur desktop (≥ lg).
 * @created 2026-05-24
 * @updated 2026-08-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmiIDProfileCard, EmiIDCardVariant } from "@/components/carte-profil/emiid-profile-card"
import { EmptyState } from "@/components/EmptyState"
import { Users, ChevronLeft, ChevronRight } from "lucide-react"
import type { PublicProfile } from "@/types"
import { useEntrepreneurActions } from "@/hooks/use-entrepreneur-actions"

interface EntrepreneursSectionProps {
  entrepreneursList: PublicProfile[]
  loading: boolean
  variant?: EmiIDCardVariant
}

export function EntrepreneursSection({ entrepreneursList, loading, variant = "tech" }: EntrepreneursSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { profiles, session, handleCardAction, handleRedirectToAnnuaire } = useEntrepreneurActions(entrepreneursList)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section>
      {loading ? (
        <div className="flex overflow-x-auto pb-6 gap-6 snap-x no-scrollbar w-full lg:grid lg:grid-cols-5 lg:overflow-visible">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[200px] lg:min-w-0 space-y-3 p-4 border rounded-xl bg-card snap-center">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : profiles.length > 0 ? (
        <div className="relative group/carousel">
          {/* Flèche gauche (masquée sur desktop : tout est visible dans la grille) */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex lg:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white/90 border border-white/10 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto pb-10 pt-4 px-4 -mx-4 gap-6 snap-x no-scrollbar w-full scroll-smooth lg:grid lg:grid-cols-5 lg:gap-5 xl:gap-6 lg:overflow-visible lg:p-0 lg:m-0"
          >
            {profiles.map((entrepreneur, index) => (
              <motion.div
                key={entrepreneur.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03, y: -5, rotateY: 2 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="min-w-[200px] lg:min-w-0 snap-center relative group perspective-1000"
              >
                {/* Magic glow for Elite (Premium) variant if applicable */}
                {variant === "elite" && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500 z-0"></div>
                )}
                <div className="relative z-10 h-full">
                  <EmiIDProfileCard
                    user={{
                      id: entrepreneur.id,
                      name: entrepreneur.name,
                      role: entrepreneur.role,
                      avatar: entrepreneur.avatar,
                      category: entrepreneur.category,
                      specialty: entrepreneur.specialty,
                      location: entrepreneur.location,
                      followers: entrepreneur.followers,
                      verified: entrepreneur.verified,
                      premium: entrepreneur.premium,
                      tags: entrepreneur.tags || [entrepreneur.specialty],
                    }}
                    variant={variant}
                    size="compact"
                    isFollowed={!!entrepreneur.isFollowed}
                    onAction={(type) => handleCardAction(type, entrepreneur.id, entrepreneur.slug)}
                    isLoggedIn={!!session}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Flèche droite */}
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex lg:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white/90 border border-white/10 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Aucun entrepreneur trouvé"
          description="Soyez le premier à rejoindre cette catégorie ou essayez d'autres filtres."
          actionText="Découvrir l'annuaire"
          onAction={handleRedirectToAnnuaire}
        />
      )}
    </section>
  )
}
