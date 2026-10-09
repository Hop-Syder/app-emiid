/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Accueil mobile — hub de proximité façon WhatsApp.
 *              Objectif : trouver un professionnel disponible près de chez soi
 *              en moins de 10 secondes.
 *              1. Barre du haut : logo, notifications, réglages.
 *              2. Recherche rapide (ouvre /recherche : IA + dictée vocale).
 *              3. Rail de « statuts » : dernières réalisations de chantiers.
 *              4. Flux « Talents actifs » : liste dense, séparateurs fins, bouton
 *                 vert de contact direct sur chaque ligne.
 * @created 2026-10-09
 */

"use client"

import Link from "next/link"
import { Bell, Search, Settings, Users } from "lucide-react"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"
import type { PublicProfile } from "@/types"
import { MobileTopBar } from "./mobile-top-bar"
import { StoryRail } from "./story-rail"
import { TalentRow } from "./talent-row"

interface MobileHomeProps {
  talents: PublicProfile[]
  locationLabel?: string | null
}

export function MobileHome({ talents, locationLabel }: MobileHomeProps) {
  const unread = useUnreadNotifications()

  return (
    <div className="lg:hidden bg-background min-h-[100dvh]">
      <MobileTopBar
        title={<span className="text-2xl font-black tracking-tight text-[#013ff4]">EmiID</span>}
        actions={
          <>
            <Link
              href="/notifications"
              aria-label={unread > 0 ? `Notifications, ${unread} non lue${unread > 1 ? "s" : ""}` : "Notifications"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full active:bg-muted"
            >
              <Bell className="h-[22px] w-[22px]" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-contact-strong px-1 text-[10px] font-bold text-white ring-2 ring-background">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Link
              href="/parametres"
              aria-label="Paramètres"
              className="flex h-11 w-11 items-center justify-center rounded-full active:bg-muted"
            >
              <Settings className="h-[22px] w-[22px]" />
            </Link>
          </>
        }
      >
        <div className="px-4 pb-3">
          <Link
            href="/recherche"
            className="flex h-11 items-center gap-2.5 rounded-full bg-muted px-4 text-[15px] text-muted-foreground active:opacity-80"
          >
            <Search className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">Rechercher un électricien, un quartier…</span>
          </Link>
        </div>
      </MobileTopBar>

      <div className="pt-2">
        <StoryRail />
      </div>

      <section className="mt-4 border-t border-border/60 px-4" aria-labelledby="talents-actifs">
        <div className="flex items-baseline justify-between pt-4">
          <h2 id="talents-actifs" className="text-[15px] font-bold text-foreground">
            Talents actifs{locationLabel ? ` · ${locationLabel}` : ""}
          </h2>
          <Link href="/annuaire" className="py-2 text-sm font-semibold text-[#013ff4]">
            Tout voir
          </Link>
        </div>

        {talents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Aucun talent à afficher pour le moment.</p>
            <Link href="/annuaire" className="text-sm font-semibold text-[#013ff4]">
              Explorer l&apos;annuaire
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {talents.map((t) => (
              <TalentRow key={t.id} profile={t} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
