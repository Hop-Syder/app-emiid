/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carrousel de profils vérifiés mis en avant, sur le hero public.
 *              Remplace la carte démo statique "Calbert VITO" (donnée fictive
 *              présentée comme réelle — voir memory project-audit-2026-09) par
 *              une vitrine de vrais membres, tirés au sort à chaque visite.
 *
 *              Dégradation par paliers (2026-09-16) : le pool idéal — abonnement
 *              actif (is_premium) ET badge vérifié (is_verified) — est vide sur
 *              cette base au moment de l'écriture (0 profil). Attendre d'avoir
 *              de vrais abonnés vérifiés aurait laissé le hero public visible-
 *              ment vide entre-temps. Le carrousel élargit donc automatiquement
 *              son pool (vérifié seul, puis publié tout court) s'il n'a pas
 *              assez de profils au palier strict — et se resserre de lui-même
 *              sans changement de code dès que le pool premium+vérifié grossit.
 *              Si vraiment aucun profil publié n'existe, un encart CTA honnête
 *              remplace la carte plutôt que d'inventer un profil.
 * @created 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EmiIDProfileCard, type EmiIDCardVariant } from "../carte-profil/emiid-profile-card"

const ROTATION_MS = 7000
const POOL_SIZE = 8
// En dessous de ce seuil, le palier est jugé trop maigre pour "sembler
// vivant" et on élargit au palier suivant.
const MIN_POOL_FOR_TIER = 3

const VALID_VARIANTS: EmiIDCardVariant[] = ["elite", "glass", "glass-blue", "glass-orange", "glass-red", "tech"]

interface FeaturedProfile {
  id: string
  name: string
  role: string
  avatar?: string
  category?: string
  specialty?: string
  location?: string
  followers?: number
  verified: boolean
  premium: boolean
  variant: EmiIDCardVariant
  slug: string | null
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function useFeaturedProfiles() {
  const [profiles, setProfiles] = useState<FeaturedProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function load() {
      // Palier 1 : abonnement actif + badge vérifié (la vitrine voulue).
      // Palier 2 : vérifié seul. Palier 3 : publié tout court (dernier filet,
      // pour ne jamais afficher une section vide si la plateforme est jeune).
      const tiers: Array<{ column: "is_verified" | "is_premium" | null; extra?: "is_verified" }> = [
        { column: "is_premium", extra: "is_verified" },
        { column: "is_verified" },
        { column: null },
      ]

      for (const tier of tiers) {
        let query = (supabase as any)
          .from("public_profiles")
          .select("id, user_id, first_name, last_name, avatar_url, category, job_title, role, specialty, city, is_verified, is_premium, card_variant, followers_count, slug")
          .eq("is_published", true)
          .limit(30)

        if (tier.column) query = query.eq(tier.column, true)
        if (tier.extra) query = query.eq(tier.extra, true)

        const { data } = await query
        if (!active) return

        if (data && data.length >= MIN_POOL_FOR_TIER) {
          const mapped: FeaturedProfile[] = data.map((p: any) => ({
            id: p.user_id || p.id,
            name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Membre EmiID",
            role: p.role || p.job_title || p.category || "Professionnel",
            avatar: p.avatar_url || undefined,
            category: p.category || undefined,
            specialty: p.specialty || undefined,
            location: p.city || undefined,
            followers: p.followers_count ?? undefined,
            verified: !!p.is_verified,
            premium: !!p.is_premium,
            variant: VALID_VARIANTS.includes(p.card_variant) ? p.card_variant : "glass-blue",
            slug: p.slug || null,
          }))
          setProfiles(shuffle(mapped).slice(0, POOL_SIZE))
          setLoading(false)
          return
        }
      }

      // Aucun palier n'a atteint le minimum (plateforme vraiment naissante) :
      // pas de pool exploitable, l'appelant affichera l'état vide honnête.
      if (active) {
        setProfiles([])
        setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  return { profiles, loading }
}

export function FeaturedProfilesCarousel() {
  const { profiles, loading } = useFeaturedProfiles()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const count = profiles.length

  const goTo = (next: number) => {
    setIndex(((next % count) + count) % count)
    setProgressKey((k) => k + 1)
  }

  // Rotation automatique — s'arrête si en pause (survol desktop / doigt posé
  // mobile), s'il n'y a qu'un seul profil, ou si le pool n'est pas encore chargé.
  useEffect(() => {
    if (paused || count <= 1) return
    timerRef.current = setTimeout(() => goTo(index + 1), ROTATION_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, count])

  const current = useMemo(() => profiles[index], [profiles, index])

  if (loading) {
    return (
      <div className="relative w-full max-w-[200px] mx-auto h-[280px] rounded-2xl bg-white/[0.04] border border-white/[0.08] animate-pulse" />
    )
  }

  // Filet de sécurité final : aucun profil publié n'existe encore. Un CTA
  // honnête plutôt qu'un profil inventé.
  if (!current) {
    return (
      <div className="relative w-full max-w-[220px] mx-auto rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-6 text-center">
        <Sparkles className="h-6 w-6 text-[#03b3f8] mx-auto mb-3" />
        <p className="text-sm font-bold text-white mb-1">Soyez le premier</p>
        <p className="text-xs text-[#8891AC] leading-relaxed">
          Votre carte pourrait être la première mise en avant ici.
        </p>
      </div>
    )
  }

  return (
    <div
      className="relative w-full max-w-[200px] mx-auto group/carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Halo lumineux sous la carte */}
      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-[#013ff4]/30 to-[#03b3f8]/30 blur-2xl opacity-60 pointer-events-none" />

      <Link
        href={current.slug ? `/profil/${current.slug}` : `/profil/${current.id}`}
        className="relative z-10 block transform-gpu transition-all"
      >
        <EmiIDProfileCard
          key={current.id}
          variant={current.variant}
          size="compact"
          user={{
            id: current.id,
            name: current.name,
            role: current.role,
            location: current.location,
            avatar: current.avatar,
            specialty: current.specialty,
            category: current.category,
            verified: current.verified,
            premium: current.premium,
            followers: current.followers,
          }}
        />
      </Link>

      {count > 1 && (
        <>
          {/* Barre de progression — réinitialisée à chaque changement de carte
              (index ou clic manuel) via `progressKey` dans sa key React. */}
          <div className="relative z-10 mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              key={progressKey}
              className="h-full rounded-full bg-gradient-to-r from-[#013ff4] to-[#03b3f8]"
              style={{
                animation: `${paused ? "none" : `featured-carousel-progress ${ROTATION_MS}ms linear forwards`}`,
              }}
            />
          </div>
          <style jsx>{`
            @keyframes featured-carousel-progress {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>

          {/* Navigation manuelle : flèches discrètes + puces */}
          <div className="relative z-10 mt-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Profil précédent"
              onClick={(e) => {
                e.preventDefault()
                goTo(index - 1)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 opacity-0 transition-opacity hover:bg-white/20 hover:text-white group-hover/carousel:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              {profiles.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Voir le profil ${i + 1}`}
                  aria-current={i === index}
                  onClick={(e) => {
                    e.preventDefault()
                    goTo(i)
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-4 bg-[#03b3f8]" : "w-1.5 bg-white/25 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Profil suivant"
              onClick={(e) => {
                e.preventDefault()
                goTo(index + 1)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 opacity-0 transition-opacity hover:bg-white/20 hover:text-white group-hover/carousel:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
