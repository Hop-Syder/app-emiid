/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Rail horizontal des stories 24 h (« Chantiers du jour »), façon
 *              WhatsApp : avatars ronds cerclés de vert, le sien en tête avec
 *              un « + » pour publier la photo du jour.
 *
 *              Une story disparaît d'elle-même au bout de 24 h. Tant que la
 *              migration 20261011 n'est pas appliquée (ou si personne n'a
 *              publié), le rail retombe sur les dernières réalisations
 *              validées : mieux vaut montrer du travail récent qu'un vide.
 * @created 2026-10-09
 * @updated 2026-10-09 — vraies stories éphémères.
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useRef, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRealisationsShowcase, type ShowcaseItem } from "@/hooks/use-realisations-showcase"
import { useStories, type Story } from "@/hooks/use-stories"
import { StoryViewer } from "./story-viewer"
import { StoryPlayer } from "./story-player"
import { cn } from "@/lib/utils"

/** Pastille ronde du rail : anneau vert, image, prénom dessous. */
function RailItem({
  imageUrl, label, ring = true, onClick, ariaLabel,
}: {
  imageUrl: string
  label: string
  ring?: boolean
  onClick: () => void
  ariaLabel: string
}) {
  return (
    <li className="w-[68px] shrink-0 snap-start">
      <button type="button" onClick={onClick} aria-label={ariaLabel} className="flex w-full flex-col items-center gap-1.5 active:opacity-70">
        <span className={cn("rounded-full p-[2.5px]", ring ? "bg-contact" : "bg-border")}>
          <span className="block rounded-full bg-background p-[2px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- image de stockage utilisateur, hôte variable */}
            <img src={imageUrl} alt="" loading="lazy" className="h-14 w-14 rounded-full object-cover" />
          </span>
        </span>
        <span className="w-full truncate text-center text-[11px] font-medium text-foreground">{label}</span>
      </button>
    </li>
  )
}

export function StoryRail({ title }: { title?: string }) {
  const { stories, loading, available, publishing, currentUserId, publish, remove, markViewed } = useStories({ limit: 30 })
  // Repli tant qu'aucune story n'est publiée : les réalisations récentes.
  const { items: fallback, loading: loadingFallback, selected, setSelected } = useRealisationsShowcase({ limit: 15 })

  const fileRef = useRef<HTMLInputElement>(null)
  const [playing, setPlaying] = useState<Story | null>(null)

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // permet de re-choisir la même photo
    if (!file) return
    if (!file.type.startsWith("image/")) return toast.error("Choisissez une photo")
    const ok = await publish(file)
    toast[ok ? "success" : "error"](ok ? "Story publiée — visible 24 h" : "Publication impossible")
  }

  const myStory = stories.find((s) => s.isMine) ?? null
  const others = stories.filter((s) => !s.isMine)
  const busy = loading || loadingFallback

  // Rien à montrer et rien à publier : le rail disparaît plutôt que d'afficher un vide.
  if (!busy && stories.length === 0 && fallback.length === 0 && !currentUserId) return null

  return (
    <section aria-label={title || "Chantiers du jour"}>
      {title && <h2 className="px-4 pb-2 text-base sm:text-lg font-bold text-foreground">{title}</h2>}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => void onPick(e)} />

      <ul className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
        {/* Ma story : publier, ou revoir la sienne. */}
        {currentUserId && available && (
          <li className="w-[68px] shrink-0 snap-start">
            <button
              type="button"
              onClick={() => (myStory ? setPlaying(myStory) : fileRef.current?.click())}
              disabled={publishing}
              aria-label={myStory ? "Voir ma story" : "Publier une story"}
              className="flex w-full flex-col items-center gap-1.5 active:opacity-70 disabled:opacity-60 cursor-pointer"
            >
              <span className={cn("relative rounded-full p-[2.5px]", myStory ? "bg-contact" : "bg-border")}>
                <span className="block rounded-full bg-background p-[2px]">
                  {myStory ? (
                    // eslint-disable-next-line @next/next/no-img-element -- image de stockage utilisateur
                    <img src={myStory.imageUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      {publishing ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      )}
                    </span>
                  )}
                </span>
                {myStory && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-contact-strong px-1 text-[11px] font-bold text-white ring-2 ring-background">
                    {myStory.viewsCount}
                  </span>
                )}
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium text-foreground">
                {myStory ? "Ma story" : "Publier"}
              </span>
            </button>
          </li>
        )}

        {busy &&
          Array.from({ length: 4 }).map((_, i) => (
            <li key={`sk-${i}`} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
              <span className="h-16 w-16 animate-pulse rounded-full bg-muted" />
              <span className="h-2.5 w-12 animate-pulse rounded bg-muted" />
            </li>
          ))}

        {/* Stories des autres professionnels. */}
        {others.map((s) => (
          <RailItem
            key={s.id}
            imageUrl={s.imageUrl}
            label={s.authorName.split(" ")[0]}
            onClick={() => setPlaying(s)}
            ariaLabel={`Voir la story de ${s.authorName}`}
          />
        ))}

        {/* Repli : réalisations récentes, quand personne n'a publié. */}
        {!busy &&
          stories.length === 0 &&
          fallback.map((item: ShowcaseItem) => (
            <RailItem
              key={item.id}
              imageUrl={item.imageUrl}
              label={item.authorName.split(" ")[0]}
              onClick={() => setSelected(item)}
              ariaLabel={`Voir la réalisation de ${item.authorName}`}
            />
          ))}
      </ul>

      {/* Lecteur des vraies stories (chronomètre, vues, suppression). */}
      <StoryPlayer
        stories={myStory && playing?.isMine ? [myStory] : others}
        current={playing}
        onChange={setPlaying}
        onViewed={markViewed}
        onDelete={async (id) => {
          const ok = await remove(id)
          toast[ok ? "success" : "error"](ok ? "Story supprimée" : "Suppression impossible")
          if (ok) setPlaying(null)
        }}
      />

      {/* Visionneuse du repli (réalisations). */}
      <StoryViewer items={fallback} current={selected} onChange={setSelected} />
    </section>
  )
}
