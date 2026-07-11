/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Découverte des réalisations (project_gallery approuvées) — carrousel
 *              horizontal de cartes carrées + lightbox. Format volontairement distinct
 *              des cartes profils.
 * @created 2026-07-10
 * @updated 2026-07-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Maximize2, ArrowRight, ImageOff, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getOptimizedImageUrl } from "@/lib/image-optimization"

interface ShowcaseItem {
  id: string
  title: string | null
  description: string | null
  imageUrl: string
  authorName: string
  authorAvatar: string | null
  authorSlug: string | null
}

export function RealisationsShowcase() {
  const supabase = createClient()
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ShowcaseItem | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" })
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      // Réalisations approuvées, les plus récentes.
      const { data: gallery } = await supabase
        .from("project_gallery")
        .select("id, title, description, image_url, profile_id")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(12)

      const rows = (gallery as { id: string; title: string | null; description: string | null; image_url: string; profile_id: string | null }[]) || []
      const profileIds = Array.from(new Set(rows.map((r) => r.profile_id).filter(Boolean))) as string[]

      // Auteurs (public_profiles anon-lisible)
      const authorMap = new Map<string, { name: string; avatar: string | null; slug: string | null }>()
      if (profileIds.length) {
        const { data: profs } = await supabase
          .from("public_profiles")
          .select("id, first_name, last_name, avatar_url, slug")
          .in("id", profileIds)
        for (const p of (profs as { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null; slug: string | null }[]) || []) {
          authorMap.set(p.id, {
            name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Membre EmiID",
            avatar: p.avatar_url,
            slug: p.slug,
          })
        }
      }

      const mapped: ShowcaseItem[] = rows.map((r) => {
        const a = r.profile_id ? authorMap.get(r.profile_id) : undefined
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          imageUrl: r.image_url,
          authorName: a?.name || "Membre EmiID",
          authorAvatar: a?.avatar || null,
          authorSlug: a?.slug || null,
        }
      })

      if (active) { setItems(mapped); setLoading(false) }
    })()
    return () => { active = false }
  }, [supabase])

  if (loading) {
    return (
      <div className="flex overflow-x-auto pb-6 pt-4 px-4 -mx-4 gap-6 no-scrollbar w-full">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="min-w-[240px] sm:min-w-[280px] flex-shrink-0 aspect-square rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400">
        <ImageOff className="h-9 w-9 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-bold text-slate-500">Aucune réalisation à découvrir pour le moment</p>
        <p className="text-xs mt-1">Soyez le premier à exposer votre travail depuis votre portefeuille.</p>
      </div>
    )
  }

  return (
    <>
      <div className="relative group/carousel">
        {/* Flèche gauche */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Défiler vers la gauche"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white/90 border border-white/10 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-md"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto pb-6 pt-4 px-4 -mx-4 gap-6 snap-x no-scrollbar w-full scroll-smooth"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="group min-w-[240px] sm:min-w-[280px] flex-shrink-0 snap-start text-left rounded-2xl overflow-hidden bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013ff4]/40"
            >
              {/* Cover carrée */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title || "Réalisation"}
                  fill
                  sizes="(max-width: 640px) 240px, 280px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Dégradé sombre en bas pour la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
                <span className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                  <Maximize2 className="h-3 w-3" /> Aperçu
                </span>
                {/* Titre + auteur en surimpression */}
                <div className="absolute bottom-0 inset-x-0 p-3.5">
                  <p className="text-sm font-black text-white truncate drop-shadow">{item.title || "Réalisation"}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-5 h-5 rounded-full overflow-hidden bg-white/30 shrink-0 relative ring-1 ring-white/40">
                      {item.authorAvatar ? (
                        <Image src={item.authorAvatar} alt={item.authorName} fill sizes="20px" className="object-cover" />
                      ) : null}
                    </span>
                    <span className="text-[11px] font-semibold text-white/85 truncate">{item.authorName}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Flèche droite */}
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Défiler vers la droite"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white/90 border border-white/10 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-md"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl gap-0">
          {selected && (
            <>
              <div className="relative aspect-video w-full bg-slate-100">
                <Image
                  src={getOptimizedImageUrl(selected.imageUrl, { width: 1200, height: 675, quality: 90 })}
                  alt={selected.title || "Réalisation"}
                  fill priority sizes="(max-width: 768px) 100vw, 672px" className="object-cover"
                />
              </div>
              <div className="p-6 max-h-[45vh] overflow-y-auto">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl font-black text-slate-900">{selected.title || "Réalisation"}</DialogTitle>
                </DialogHeader>
                {selected.description ? (
                  <DialogDescription asChild>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mt-3">{selected.description}</p>
                  </DialogDescription>
                ) : (
                  <DialogDescription className="text-sm text-slate-400 italic mt-3">Aucune description.</DialogDescription>
                )}
                {selected.authorSlug && (
                  <Link
                    href={`/profil/${selected.authorSlug}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#013ff4] hover:gap-3 transition-all"
                  >
                    Voir le profil de {selected.authorName} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
