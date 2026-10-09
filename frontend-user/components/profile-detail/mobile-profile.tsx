/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Fiche profil mobile façon « contact WhatsApp Business » :
 *              - MobileProfileHeader : photo, nom + vérifié, métier · lieu,
 *                slogan, ligne de confiance (note, expérience, ouvert/fermé)
 *                et 4 actions rondes (Message, Appeler, WhatsApp, Partager) ;
 *              - MobileRealisationsGrid : photos de chantiers en grille 3
 *                colonnes, visionneuse plein écran au toucher ;
 *              - MobileContactBar : « Écrire / Appeler » collé en bas, au-dessus
 *                de la barre de navigation, pendant tout le défilement.
 *              Le contact reste soumis aux règles existantes : numéro visible
 *              uniquement pour un membre connecté et si le pro l'a autorisé.
 * @created 2026-10-09
 */

"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BadgeCheck, Briefcase, Clock, LogIn, MessageCircle, Pencil, Phone, Share2, Star, UserCheck, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StoryViewer } from "@/components/mobile-hub/story-viewer"
import type { ShowcaseItem } from "@/hooks/use-realisations-showcase"
import type { GalleryItem, ProfileData } from "@/hooks/use-profile-data"
import { formatFcfa } from "@/components/mobile-hub/format"
import { formatOpenStatus, getOpenStatus } from "@/lib/opening-hours"
import { toInternational } from "@/lib/phone"
import { trackProfileMetric } from "@/lib/track-profile"
import { trackProfileContact } from "@/lib/analytics"
import { cn } from "@/lib/utils"

export interface ReviewSummary {
  count: number
  average: number
}

/** Où envoyer un visiteur non connecté qui veut contacter (retour sur la fiche ensuite). */
const loginHref = () =>
  `/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`

function useContact(profile: ProfileData, isLoggedIn: boolean) {
  const phone = isLoggedIn && profile.phone ? toInternational(profile.phone) : ""
  return {
    phone,
    /** Un numéro existe mais le visiteur doit se connecter pour le voir. */
    phoneLocked: !isLoggedIn && !!profile.hasContact,
    messageHref: `/messages?contact=${profile.id}`,
    whatsappHref: phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(`Bonjour ${profile.name}, je vous ai trouvé sur EmiID.`)}`
      : "",
  }
}

function RoundAction({
  href, onClick, icon: Icon, label, tone = "default", external = false,
}: {
  href?: string
  onClick?: () => void
  icon: React.ElementType
  label: string
  tone?: "default" | "green"
  external?: boolean
}) {
  const circle = cn(
    "flex h-12 w-12 items-center justify-center rounded-full",
    tone === "green" ? "bg-contact-strong text-white" : "bg-[#013ff4]/10 text-[#013ff4] dark:text-[#4d7bff]",
  )
  const inner = (
    <>
      <span className={circle}><Icon className="h-5 w-5" /></span>
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </>
  )
  const cls = "flex w-[72px] flex-col items-center gap-1.5 active:opacity-70"
  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer ugc nofollow" onClick={onClick} className={cls}>{inner}</a>
    ) : (
      <Link href={href} onClick={onClick} className={cls}>{inner}</Link>
    )
  }
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>
}

interface MobileProfileHeaderProps {
  profile: ProfileData
  isOwnProfile: boolean
  isLoggedIn: boolean
  isFollowed: boolean
  followLoading: boolean
  onFollow: () => void
  onShare: () => void
  reviews: ReviewSummary | null
}

export function MobileProfileHeader({
  profile, isOwnProfile, isLoggedIn, isFollowed, followLoading, onFollow, onShare, reviews,
}: MobileProfileHeaderProps) {
  const contact = useContact(profile, isLoggedIn)
  const openStatus = useMemo(() => getOpenStatus(profile.opening_hours), [profile.opening_hours])
  const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")
  const place = profile.location.split(",")[0]?.trim()

  return (
    <section className="flex flex-col items-center px-2 pb-5 pt-2 text-center">
      <Avatar className="h-28 w-28 ring-4 ring-background shadow-md">
        <AvatarImage src={profile.avatar} alt="" className="object-cover" />
        <AvatarFallback className="bg-muted text-2xl font-black text-muted-foreground">{initials}</AvatarFallback>
      </Avatar>

      <h1 className="mt-3 flex items-center justify-center gap-1.5 text-2xl font-black tracking-tight text-foreground">
        <span className="line-clamp-2">{profile.name}</span>
        {profile.verified && <BadgeCheck className="h-6 w-6 shrink-0 text-contact-fg" aria-label="Profil vérifié" />}
      </h1>
      <p className="mt-0.5 text-[15px] text-muted-foreground">
        {[profile.role, place].filter(Boolean).join(" · ")}
      </p>
      {profile.business_name && <p className="text-sm font-semibold text-foreground">{profile.business_name}</p>}
      {profile.slogan && <p className="mt-2 max-w-sm text-sm italic text-muted-foreground">« {profile.slogan} »</p>}

      {/* Ligne de confiance */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
        {reviews && reviews.count > 0 && (
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {reviews.average.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            <span className="font-normal text-muted-foreground">({reviews.count})</span>
          </span>
        )}
        {profile.yearsExperience && (
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            {profile.yearsExperience} an{profile.yearsExperience > 1 ? "s" : ""}
          </span>
        )}
        {openStatus && (
          <span className={cn("inline-flex items-center gap-1 font-semibold", openStatus.state === "open" ? "text-contact-fg" : "text-muted-foreground")}>
            <Clock className="h-4 w-4" />
            {formatOpenStatus(openStatus)}
          </span>
        )}
      </div>

      {/* Actions */}
      {isOwnProfile ? (
        <div className="mt-5 flex justify-center gap-3">
          <RoundAction href="/parametres" icon={Pencil} label="Modifier" />
          <RoundAction href="/vous" icon={Share2} label="Mon QR" />
        </div>
      ) : (
        <>
          {/* Deux actions majeures, pleine largeur (maquette). Le vert porte du
              texte blanc : on utilise le vert foncé lisible (contact-strong),
              pas le #25D366 vif, illisible en blanc. */}
          <div className="mt-5 flex w-full gap-2">
            {contact.phone ? (
              <>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer ugc nofollow"
                  onClick={() => { trackProfileMetric(profile.id, "whatsapp"); trackProfileContact(profile.id, "whatsapp") }}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-contact-strong text-sm font-bold text-white active:opacity-90"
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                  Discuter sur WhatsApp
                </a>
                <a
                  href={`tel:+${contact.phone}`}
                  onClick={() => { trackProfileMetric(profile.id, "call"); trackProfileContact(profile.id, "call") }}
                  className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#013ff4] px-5 text-sm font-bold text-white active:opacity-90"
                >
                  <Phone className="h-[18px] w-[18px]" />
                  Appeler
                </a>
              </>
            ) : (
              <>
                {/* Sans numéro public : l'échange reste possible dans EmiID. */}
                <Link
                  href={contact.messageHref}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-contact-strong text-sm font-bold text-white active:opacity-90"
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                  Envoyer un message
                </Link>
                {contact.phoneLocked && (
                  <Link
                    href={loginHref()}
                    className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#013ff4] px-5 text-sm font-bold text-white active:opacity-90"
                  >
                    <LogIn className="h-[18px] w-[18px]" />
                    Numéro
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Message interne et partage, en retrait : les deux actions
              majeures restent celles du dessus. */}
          <div className="mt-3 flex justify-center gap-2">
            {contact.phone && <RoundAction href={contact.messageHref} icon={MessageCircle} label="Message" />}
            <RoundAction onClick={onShare} icon={Share2} label="Partager" />
          </div>

          {isLoggedIn && (
            <button
              type="button"
              onClick={onFollow}
              disabled={followLoading}
              className={cn(
                "mt-4 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-bold disabled:opacity-60",
                isFollowed ? "border border-border text-foreground" : "bg-foreground text-background",
              )}
            >
              {isFollowed ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {isFollowed ? "Abonné" : "Suivre"}
            </button>
          )}
        </>
      )}
    </section>
  )
}

export function MobileRealisationsGrid({ gallery, profile }: { gallery: GalleryItem[]; profile: ProfileData }) {
  const [selected, setSelected] = useState<ShowcaseItem | null>(null)
  const [category, setCategory] = useState<string>("Tous")

  // Même forme que les statuts du Réseau : la visionneuse est réutilisée telle quelle.
  const items: ShowcaseItem[] = useMemo(
    () =>
      gallery.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        imageUrl: g.imageUrl,
        authorName: profile.name,
        authorAvatar: profile.avatar,
        authorSlug: null, // déjà sur la fiche : pas de bouton « Voir le profil »
        authorUserId: profile.id,
        authorVerified: profile.verified,
        authorRole: profile.role,
        authorDistrict: null,
        authorStartingPrice: null,
        price: g.price ?? null,
        category: g.category ?? null,
      })),
    [gallery, profile],
  )

  // « Tous » puis les catégories réellement présentes, dans l'ordre d'apparition.
  const categories = useMemo(() => {
    const seen: string[] = []
    for (const it of items) {
      const c = it.category?.trim()
      if (c && !seen.includes(c)) seen.push(c)
    }
    return seen.length > 0 ? ["Tous", ...seen] : []
  }, [items])

  const shown = category === "Tous" ? items : items.filter((i) => i.category?.trim() === category)

  if (items.length === 0) return null

  return (
    <section aria-labelledby="realisations-mobile" className="-mx-4">
      <h2 id="realisations-mobile" className="px-4 pb-2 text-[15px] font-bold text-foreground">
        Réalisations &amp; Portfolio <span className="font-normal text-muted-foreground">({items.length})</span>
      </h2>

      {/* Filtres : affichés seulement si l'artisan a classé ses réalisations. */}
      {categories.length > 0 && (
        <div
          role="tablist"
          aria-label="Filtrer les réalisations"
          className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-[13px] font-bold transition-colors",
                category === c ? "bg-contact-strong text-white" : "bg-muted text-muted-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-0.5 px-0.5">
        {shown.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setSelected(item)}
              aria-label={item.title ? `Voir « ${item.title} »` : "Voir la réalisation"}
              className="relative block aspect-square w-full overflow-hidden bg-muted active:opacity-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- photo de réalisation, hôte variable */}
              <img src={item.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              {item.price != null && (
                // Dégradé sous l'étiquette : un prix blanc sur une photo claire
                // serait illisible.
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-left text-[13px] font-black text-white">
                  {formatFcfa(item.price)}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <StoryViewer items={shown} current={selected} onChange={setSelected} messageIntent="same" />
    </section>
  )
}

export function MobileContactBar({ profile, isLoggedIn }: { profile: ProfileData; isLoggedIn: boolean }) {
  const contact = useContact(profile, isLoggedIn)

  return (
    <div
      className="lg:hidden fixed inset-x-0 z-30 border-t border-border bg-background/95 px-4 py-2.5 backdrop-blur-md"
      // Juste au-dessus de la barre de navigation (58 px + zone sûre).
      style={{ bottom: "calc(58px + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-md gap-2">
        <Link
          href={contact.messageHref}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-contact-strong text-sm font-bold text-white active:opacity-90"
        >
          <MessageCircle className="h-4 w-4" /> Écrire
        </Link>
        {contact.phone ? (
          <a
            href={`tel:+${contact.phone}`}
            onClick={() => { trackProfileMetric(profile.id, "call"); trackProfileContact(profile.id, "call") }}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border text-sm font-bold text-foreground active:bg-muted"
          >
            <Phone className="h-4 w-4" /> Appeler
          </a>
        ) : contact.phoneLocked ? (
          <Link
            href={loginHref()}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border text-sm font-bold text-foreground active:bg-muted"
          >
            <LogIn className="h-4 w-4" /> Voir le numéro
          </Link>
        ) : null}
      </div>
    </div>
  )
}
