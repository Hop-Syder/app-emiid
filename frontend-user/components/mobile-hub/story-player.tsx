/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Lecteur plein écran des stories 24 h : barre de progression,
 *              avance automatique en 5 s, tap à gauche / à droite pour reculer
 *              ou avancer, temps restant avant expiration.
 *              Sur sa propre story : nombre de vues et suppression. Sur celle
 *              d'un autre : accès au profil et à la discussion.
 * @created 2026-10-09
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { BadgeCheck, Eye, MessageCircle, Trash2, X } from "lucide-react"
import type { Story } from "@/hooks/use-stories"

const DURATION_MS = 5000

/** « Encore 7 h » / « Encore 45 min » avant disparition. */
function remainingLabel(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "Expirée"
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 1) return `Encore ${hours} h`
  return `Encore ${Math.max(1, Math.round(ms / 60_000))} min`
}

interface StoryPlayerProps {
  stories: Story[]
  current: Story | null
  onChange: (story: Story | null) => void
  onViewed: (storyId: string) => void
  onDelete: (storyId: string) => void
}

export function StoryPlayer({ stories, current, onChange, onViewed, onDelete }: StoryPlayerProps) {
  const index = current ? stories.findIndex((s) => s.id === current.id) : -1
  const [confirmDelete, setConfirmDelete] = useState(false)

  const go = useCallback(
    (delta: number) => {
      onChange(stories[index + delta] ?? null)
    },
    [stories, index, onChange],
  )

  // Vue enregistrée à l'ouverture de chaque story.
  useEffect(() => {
    if (current && !current.isMine) onViewed(current.id)
  }, [current, onViewed])

  useEffect(() => {
    setConfirmDelete(false)
  }, [current])

  useEffect(() => {
    if (index < 0) return
    const t = setTimeout(() => go(1), DURATION_MS)
    return () => clearTimeout(t)
  }, [index, go])

  useEffect(() => {
    if (index < 0) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null)
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, go, onChange])

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Story de ${current.authorName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col bg-black text-white"
        >
          <div className="flex gap-1 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            {stories.map((s, i) => (
              <span key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                {i < index && <span className="block h-full w-full bg-white" />}
                {i === index && (
                  <motion.span
                    key={current.id}
                    className="block h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: DURATION_MS / 1000, ease: "linear" }}
                  />
                )}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- avatar de stockage utilisateur */}
            <img src={current.authorAvatar || "/profil/avatar.jpg"} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm font-bold">
                {current.isMine ? "Ma story" : current.authorName}
                {current.authorVerified && <BadgeCheck className="h-4 w-4 text-contact" />}
              </p>
              <p className="truncate text-xs text-white/70">{remainingLabel(current.expiresAt)}</p>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Fermer"
              className="flex h-11 w-11 items-center justify-center rounded-full active:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- photo de story, hôte variable */}
            <img src={current.imageUrl} alt={current.caption || "Story"} className="max-h-full max-w-full object-contain" />
            <button type="button" aria-label="Précédent" onClick={() => go(-1)} className="absolute inset-y-0 left-0 w-1/3" />
            <button type="button" aria-label="Suivant" onClick={() => go(1)} className="absolute inset-y-0 right-0 w-1/3" />
          </div>

          <div className="space-y-3 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
            {current.caption && <p className="text-sm">{current.caption}</p>}

            {current.isMine ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  <Eye className="h-4 w-4" />
                  {current.viewsCount} vue{current.viewsCount > 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => (confirmDelete ? onDelete(current.id) : setConfirmDelete(true))}
                  className="ml-auto inline-flex h-11 items-center gap-2 rounded-full border border-white/40 px-4 text-sm font-bold active:bg-white/10"
                >
                  <Trash2 className="h-4 w-4" />
                  {confirmDelete ? "Confirmer la suppression" : "Supprimer"}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {current.authorSlug && (
                  <Link
                    href={`/profil/${current.authorSlug}`}
                    className="flex h-11 flex-1 items-center justify-center rounded-full border border-white/40 text-sm font-bold active:bg-white/10"
                  >
                    Voir le profil
                  </Link>
                )}
                <Link
                  href={`/messages?contact=${current.authorUserId}`}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-contact-strong text-sm font-bold text-white active:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" /> Écrire
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
