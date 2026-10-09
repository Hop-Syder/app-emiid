/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Ligne « Talent actif » de l'accueil mobile, façon liste de
 *              discussions WhatsApp : avatar + pastille d'activité, nom et badge
 *              vérifié, métier · quartier, tarif de départ, et contact direct
 *              (ouvre la discussion sans page intermédiaire).
 * @created 2026-10-09
 * @updated 2026-10-09 — même icône que l'onglet Messagerie (MessageSquare),
 *              sans pastille : le vert passe dans le tracé.
 */

"use client"

import Link from "next/link"
import { BadgeCheck, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { PublicProfile } from "@/types"
import { formatFcfa, initialsOf } from "./format"

export function TalentRow({ profile }: { profile: PublicProfile }) {
  const href = `/profil/${profile.slug || profile.id}`
  const meta = [profile.role, profile.district || profile.location?.split(",")[0]].filter(Boolean).join(" · ")

  return (
    <li className="flex items-center gap-3 py-3">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 active:opacity-70">
        <span className="relative shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar} alt="" className="object-cover" />
            <AvatarFallback className="bg-muted text-sm font-bold text-muted-foreground">
              {initialsOf(profile.name)}
            </AvatarFallback>
          </Avatar>
          {profile.recentlyActive && (
            <span
              className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-contact"
              title="Actif cette semaine"
            />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1">
            <span className="truncate text-[15px] font-bold text-foreground">{profile.name}</span>
            {profile.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-contact-fg" aria-label="Profil vérifié" />}
          </span>
          {meta && <span className="block truncate text-[13px] text-muted-foreground">{meta}</span>}
          {profile.startingPrice != null && (
            <span className="block text-[13px] font-semibold text-foreground">
              Dès {formatFcfa(profile.startingPrice)}
            </span>
          )}
        </span>
      </Link>

      <Link
        href={`/messages?contact=${profile.id}`}
        aria-label={`Écrire à ${profile.name}`}
        // Pas de pastille : l'icône de l'onglet Messagerie, tracée en vert.
        // La zone tactile reste de 44 px, simplement invisible.
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-contact-fg active:bg-contact/10 transition-colors"
      >
        <MessageSquare className="h-[23px] w-[23px]" strokeWidth={1.8} />
      </Link>
    </li>
  )
}
