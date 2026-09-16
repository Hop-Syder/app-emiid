/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Ligne horizontale défilante de profils de l'annuaire avec flèches de défilement.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnnuaireCard } from "./annuaire-card"
import type { PublicProfile } from "@/types"

interface ProfileRowProps {
  profiles: PublicProfile[]
  theme: "default" | "red" | "orange"
}

export function ProfileRow({ profiles, theme }: ProfileRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    window.addEventListener("resize", updateArrows)
    return () => {
      window.removeEventListener("resize", updateArrows)
    }
  }, [updateArrows, profiles.length])

  const scrollByCards = (direction: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" })
  }

  return (
    <div className="relative group">
      {/* Flèche gauche — desktop uniquement (mobile/tablette : scroll tactile) */}
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Faire défiler vers la gauche"
          onClick={() => scrollByCards(-1)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-10 h-10 rounded-full bg-card shadow-lg border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:scale-105 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Piste défilante — chaque ligne défile indépendamment des autres */}
      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 -mx-4 sm:-mx-6 px-5 sm:px-6 md:mx-0 md:px-0 scroll-pl-5 sm:scroll-pl-6 md:scroll-pl-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
            className="min-w-[200px] max-w-[220px] w-[200px] shrink-0 snap-start"
          >
            <AnnuaireCard profile={profile} theme={theme} />
          </motion.div>
        ))}
      </div>

      {/* Flèche droite — desktop uniquement */}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Faire défiler vers la droite"
          onClick={() => scrollByCards(1)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-10 h-10 rounded-full bg-card shadow-lg border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:scale-105 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
