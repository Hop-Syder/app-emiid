/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Rail horizontal de « statuts » façon WhatsApp : avatars ronds
 *              cerclés de vert. Source : les dernières réalisations approuvées
 *              (photos de chantiers) — EmiID n'a pas encore de statuts éphémères.
 *              Un tap ouvre la visionneuse plein écran.
 * @created 2026-10-09
 */

"use client"

import { useRealisationsShowcase, type ShowcaseItem } from "@/hooks/use-realisations-showcase"
import { StoryViewer } from "./story-viewer"

export function StoryRail({ title }: { title?: string }) {
  const { items, loading, selected, setSelected } = useRealisationsShowcase({ limit: 15 })

  if (!loading && items.length === 0) return null

  return (
    <section aria-label={title || "Réalisations récentes"}>
      {title && <h2 className="px-4 pb-2 text-[15px] font-bold text-foreground">{title}</h2>}
      <ul className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
                <span className="h-16 w-16 animate-pulse rounded-full bg-muted" />
                <span className="h-2.5 w-12 animate-pulse rounded bg-muted" />
              </li>
            ))
          : items.map((item: ShowcaseItem) => (
              <li key={item.id} className="w-[68px] shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="flex w-full flex-col items-center gap-1.5 active:opacity-70"
                  aria-label={`Voir la réalisation de ${item.authorName}`}
                >
                  <span className="rounded-full bg-[#25D366] p-[2.5px]">
                    <span className="block rounded-full bg-background p-[2px]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- images de stockage utilisateur, hôtes variables */}
                      <img src={item.imageUrl} alt="" loading="lazy" className="h-14 w-14 rounded-full object-cover" />
                    </span>
                  </span>
                  <span className="w-full truncate text-center text-[11px] font-medium text-foreground">
                    {item.authorName.split(" ")[0]}
                  </span>
                </button>
              </li>
            ))}
      </ul>

      <StoryViewer
        items={items}
        current={selected}
        onChange={setSelected}
      />
    </section>
  )
}
