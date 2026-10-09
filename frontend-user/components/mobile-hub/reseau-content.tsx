/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Réseau — deux sous-onglets, sur le modèle de Missions :
 *
 *              • Annuaire (par défaut) : tous les profils, avec recherche et
 *                filtres. Réutilise AnnuairePublicContent en mode « embedded ».
 *              • Projets : chantiers du jour (statuts) puis catalogue des
 *                réalisations — la preuve en photo, façon catalogue WhatsApp
 *                Business.
 *
 *              L'onglet actif vit dans l'URL (?onglet=projets) : un rechargement
 *              ou un lien partagé retombe au bon endroit.
 * @created 2026-10-09
 * @updated 2026-10-09
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { BadgeCheck, ImageOff, LayoutGrid, Search, Users } from "lucide-react"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"
import { useRealisationsShowcase, type ShowcaseItem } from "@/hooks/use-realisations-showcase"
import { MobileTopBar } from "./mobile-top-bar"
import { StoryRail } from "./story-rail"
import { StoryViewer } from "./story-viewer"
import { formatFcfa } from "./format"
import { cn } from "@/lib/utils"

type ReseauTab = "annuaire" | "projets"

const TABS: { id: ReseauTab; label: string; icon: React.ElementType }[] = [
  { id: "annuaire", label: "Annuaire", icon: Users },
  { id: "projets", label: "Projets", icon: LayoutGrid },
]

function CatalogTile({ item, onOpen }: { item: ShowcaseItem; onOpen: () => void }) {
  const profileHref = item.authorSlug ? `/profil/${item.authorSlug}` : null

  return (
    <li className="flex flex-col overflow-hidden rounded-xl bg-card">
      <button type="button" onClick={onOpen} className="block aspect-square w-full overflow-hidden bg-muted active:opacity-80">
        {/* eslint-disable-next-line @next/next/no-img-element -- photo de réalisation, hôte variable */}
        <img src={item.imageUrl} alt={item.title || `Réalisation de ${item.authorName}`} loading="lazy" className="h-full w-full object-cover" />
      </button>
      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <p className="flex items-center gap-1 text-sm font-bold text-foreground">
          <span className="truncate">{item.authorName}</span>
          {item.authorVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-contact-fg" aria-label="Vérifié" />}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {item.title || item.authorRole || "Réalisation"}
        </p>
        {item.authorStartingPrice != null && (
          <p className="text-xs font-semibold text-foreground">Dès {formatFcfa(item.authorStartingPrice)}</p>
        )}
        {profileHref && (
          <Link
            href={profileHref}
            className="mt-2 flex h-10 items-center justify-center rounded-lg border border-border text-[13px] font-semibold text-[#013ff4] active:bg-muted"
          >
            Voir plus
          </Link>
        )}
      </div>
    </li>
  )
}

/** Chantiers du jour + catalogue des réalisations. */
function ProjetsTab() {
  const { items, loading, selected, setSelected } = useRealisationsShowcase({ limit: 40 })

  return (
    <>
      <div className="bg-background py-3 lg:rounded-2xl">
        <StoryRail title="Chantiers du jour" />
      </div>

      <section className="px-3 pt-4 lg:px-0" aria-labelledby="catalogue">
        <h2 id="catalogue" className="px-1 pb-3 text-[15px] font-bold text-foreground">
          Catalogue des réalisations
        </h2>

        {loading ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Aucune réalisation publiée pour le moment.</p>
            <Link href="/portefeuille" className="text-sm font-semibold text-[#013ff4]">
              Publier la mienne
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 pb-6 md:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <CatalogTile key={item.id} item={item} onOpen={() => setSelected(item)} />
            ))}
          </ul>
        )}
      </section>

      <StoryViewer items={items} current={selected} onChange={setSelected} />
    </>
  )
}

export function ReseauContent() {
  const [tab, setTab] = useState<ReseauTab>("annuaire")

  // Lu depuis window plutôt que useSearchParams : pas de contrainte de Suspense
  // sur toute la page, et la valeur est validée contre les onglets connus.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("onglet")
    if (requested === "projets" || requested === "annuaire") setTab(requested)
  }, [])

  const openTab = useCallback((next: ReseauTab) => {
    setTab(next)
    const url = new URL(window.location.href)
    url.searchParams.set("onglet", next)
    window.history.replaceState(window.history.state, "", url)
  }, [])

  return (
    <div className="min-h-[100dvh] bg-muted/50 lg:bg-transparent">
      <MobileTopBar
        title="Réseau"
        centered
        actions={
          <Link href="/recherche" aria-label="Rechercher" className="flex h-11 w-11 items-center justify-center rounded-full active:bg-muted">
            <Search className="h-[22px] w-[22px]" />
          </Link>
        }
      />

      <div className="mx-auto max-w-[1400px] lg:px-8 lg:py-8">
        <h1 className="hidden lg:block pb-6 text-3xl font-black tracking-tight text-foreground">Réseau</h1>

        {/* Onglets — même composition que Missions. */}
        <div
          role="tablist"
          aria-label="Sections du réseau"
          className="mx-3 grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 lg:mx-0 lg:max-w-md"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => openTab(id)}
              className={cn(
                "flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all",
                tab === id ? "bg-[#013ff4] text-white shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="pt-3">
          {tab === "annuaire" ? (
            <div className="px-3 lg:px-0">
              <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
                <AnnuairePublicContent embedded />
              </Suspense>
            </div>
          ) : (
            <ProjetsTab />
          )}
        </div>
      </div>
    </div>
  )
}
