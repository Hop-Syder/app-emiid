/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Visionneuse plein écran des « statuts » (réalisations) :
 *              barre de progression, avance automatique en 5 s, tap à gauche /
 *              à droite pour reculer / avancer, et accès direct au profil ou à
 *              la discussion avec l'artisan.
 * @created 2026-10-09
 */

"use client"

import { useCallback, useEffect } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { BadgeCheck, MessageCircle, X } from "lucide-react"
import type { ShowcaseItem } from "@/hooks/use-realisations-showcase"

const DURATION_MS = 5000

interface StoryViewerProps {
  items: ShowcaseItem[]
  current: ShowcaseItem | null
  onChange: (item: ShowcaseItem | null) => void
}

export function StoryViewer({ items, current, onChange }: StoryViewerProps) {
  const index = current ? items.findIndex((i) => i.id === current.id) : -1

  const go = useCallback(
    (delta: number) => {
      const next = items[index + delta]
      onChange(next ?? null)
    },
    [items, index, onChange],
  )

  // Avance automatique, comme un statut WhatsApp.
  useEffect(() => {
    if (index < 0) return
    const t = setTimeout(() => go(1), DURATION_MS)
    return () => clearTimeout(t)
  }, [index, go])

  // Échap ferme ; flèches pour naviguer au clavier.
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
          aria-label={`Réalisation de ${current.authorName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col bg-black text-white"
        >
          {/* Progression */}
          <div className="flex gap-1 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            {items.map((it, i) => (
              <span key={it.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
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

          {/* Auteur */}
          <div className="flex items-center gap-3 px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- avatar de stockage utilisateur */}
            <img src={current.authorAvatar || "/profil/avatar.jpg"} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm font-bold">
                {current.authorName}
                {current.authorVerified && <BadgeCheck className="h-4 w-4 text-[#25D366]" />}
              </p>
              {current.authorRole && <p className="truncate text-xs text-white/70">{current.authorRole}</p>}
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

          {/* Image + zones de tap */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- photo de réalisation, hôte variable */}
            <img src={current.imageUrl} alt={current.title || "Réalisation"} className="max-h-full max-w-full object-contain" />
            <button type="button" aria-label="Précédent" onClick={() => go(-1)} className="absolute inset-y-0 left-0 w-1/3" />
            <button type="button" aria-label="Suivant" onClick={() => go(1)} className="absolute inset-y-0 right-0 w-1/3" />
          </div>

          {/* Légende + actions */}
          <div className="space-y-3 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
            {current.title && <p className="text-sm font-semibold">{current.title}</p>}
            <div className="flex gap-2">
              {current.authorSlug && (
                <Link
                  href={`/profil/${current.authorSlug}`}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-white/40 text-sm font-bold active:bg-white/10"
                >
                  Voir le profil
                </Link>
              )}
              {current.authorUserId && (
                <Link
                  href={`/messages?contact=${current.authorUserId}`}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold text-white active:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" /> Écrire
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
