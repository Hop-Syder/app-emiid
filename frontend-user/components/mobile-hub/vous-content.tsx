/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet « Vous » — carte de visite instantanée pour le face-à-face.
 *              L'artisan tend son téléphone, le prospect scanne le QR code avec
 *              son appareil photo et ouvre la fiche EmiID (vCard incluse) : plus
 *              besoin de cartes papier.
 *              - En-tête : photo, nom, badge vérifié.
 *              - QR code généré localement (fonctionne hors connexion, l'URL du
 *                profil n'est envoyée à aucun service tiers).
 *              - Menu en lignes avec chevrons, façon réglages WhatsApp.
 * @created 2026-10-09
 */

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import {
  BadgeCheck, ChevronRight, Coins, Download, HeartHandshake, HelpCircle, LayoutGrid,
  Lock, LogOut, Settings, Share2, Store, Wallet,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"
import { SITE_URL } from "@/lib/seo"
import { MobileTopBar } from "./mobile-top-bar"
import { initialsOf } from "./format"

/** Numéro WhatsApp du support (format international sans « + »), optionnel. */
const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, "") || ""

interface Me {
  user_id?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  slug?: string
  role?: string
  is_verified?: boolean
  is_premium?: boolean
}

function MenuRow({ href, icon: Icon, label, desc, external = false }: {
  href: string; icon: React.ElementType; label: string; desc?: string; external?: boolean
}) {
  const content = (
    <>
      <Icon className="h-[22px] w-[22px] shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-foreground">{label}</span>
        {desc && <span className="block truncate text-[13px] text-muted-foreground">{desc}</span>}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/60" />
    </>
  )
  const cls = "flex min-h-[56px] items-center gap-4 px-4 py-2.5 active:bg-muted"
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{content}</a>
  ) : (
    <Link href={href} className={cls}>{content}</Link>
  )
}

export function VousContent() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [me, setMe] = useState<Me | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)

  useEffect(() => {
    void fetchWithAuth("/api/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d))
      .catch(() => setMe(null))
  }, [])

  const name = [me?.first_name, me?.last_name].filter(Boolean).join(" ") || "Mon compte"
  const profilePath = me?.slug ? `/profil/${me.slug}` : me?.user_id ? `/profil/${me.user_id}` : null
  const profileUrl = profilePath ? `${SITE_URL}${profilePath}` : null

  useEffect(() => {
    if (!profileUrl) return
    // Niveau de correction « M » : reste lisible sur un écran un peu sale ou
    // sous un reflet, sans densifier inutilement le motif.
    void QRCode.toString(profileUrl, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setQrSvg)
      .catch(() => setQrSvg(null))
  }, [profileUrl])

  const share = async () => {
    if (!profileUrl) return
    if (navigator.share) {
      await navigator.share({ title: `${name} sur EmiID`, url: profileUrl }).catch(() => undefined)
    } else {
      await navigator.clipboard.writeText(profileUrl).catch(() => undefined)
      toast.success("Lien du profil copié")
    }
  }

  const downloadPng = async () => {
    if (!profileUrl) return
    const dataUrl = await QRCode.toDataURL(profileUrl, { errorCorrectionLevel: "M", margin: 2, width: 720 })
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `emiid-qr-${me?.slug || "profil"}.png`
    a.click()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("emiid_pin_verified")
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-[100dvh] bg-muted/50 pb-8">
      <MobileTopBar title="Vous" centered />

      <div className="mx-auto max-w-xl lg:py-8">
        {/* Identité */}
        <section className="flex items-center gap-4 bg-background px-4 py-4 lg:rounded-2xl">
          <Avatar className="h-16 w-16">
            <AvatarImage src={me?.avatar_url || undefined} alt="" className="object-cover" />
            <AvatarFallback className="bg-muted text-lg font-bold text-muted-foreground">{initialsOf(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-xl font-black text-foreground">{name}</p>
            {me?.role && <p className="truncate text-sm text-muted-foreground">{me.role}</p>}
            {me?.is_verified && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#25D366]/10 px-2 py-0.5 text-xs font-bold text-[#1DA851]">
                <BadgeCheck className="h-3.5 w-3.5" /> Vérifié
              </span>
            )}
          </div>
        </section>

        {/* QR code */}
        <section className="mt-2 flex flex-col items-center gap-3 bg-background px-4 py-6 text-center lg:mt-4 lg:rounded-2xl" aria-labelledby="mon-qr">
          <div className="h-56 w-56 rounded-2xl border border-border bg-white p-3 shadow-sm">
            {qrSvg ? (
              <div
                className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                role="img"
                aria-label="QR code de votre profil EmiID"
                // SVG produit localement par la bibliothèque qrcode, à partir de
                // l'URL du profil : aucune donnée utilisateur brute n'y est injectée.
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
            )}
          </div>
          <div>
            <h2 id="mon-qr" className="text-lg font-black text-foreground">Mon QR EmiID</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Faites-le scanner en face-à-face : votre carte s&apos;ouvre en un geste.
            </p>
          </div>
          <div className="flex w-full max-w-xs gap-2">
            <button
              type="button"
              onClick={() => void share()}
              disabled={!profileUrl}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold text-white active:opacity-90 disabled:opacity-50"
            >
              <Share2 className="h-4 w-4" /> Partager
            </button>
            <button
              type="button"
              onClick={() => void downloadPng()}
              disabled={!profileUrl}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border text-sm font-bold text-foreground active:bg-muted disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Télécharger
            </button>
          </div>
        </section>

        {/* Menu principal */}
        <nav aria-label="Mon espace" className="mt-2 divide-y divide-border/60 bg-background lg:mt-4 lg:overflow-hidden lg:rounded-2xl">
          {profilePath && <MenuRow href={profilePath} icon={Store} label="Ma vitrine" desc="Votre carte telle que les clients la voient" />}
          <MenuRow href="/parametres?tab=horaires" icon={LayoutGrid} label="Mon catalogue" desc="Prestations, tarifs et horaires" />
          <MenuRow href="/credits" icon={Coins} label="Abonnement Pro" desc={me?.is_premium ? "Offre Pro active" : "Offre et boosts de visibilité"} />
          <MenuRow href="/parametres?tab=securite" icon={Lock} label="Sécurité" desc="Code PIN et double authentification" />
          {SUPPORT_WHATSAPP && (
            <MenuRow href={`https://wa.me/${SUPPORT_WHATSAPP}`} external icon={HelpCircle} label="Aide & support" desc="Écrire à l'équipe sur WhatsApp" />
          )}
        </nav>

        <nav aria-label="Plus" className="mt-2 divide-y divide-border/60 bg-background lg:mt-4 lg:overflow-hidden lg:rounded-2xl">
          <MenuRow href="/portefeuille" icon={Wallet} label="Portefeuille & réalisations" desc="Statistiques, gains et photos de chantiers" />
          <MenuRow href="/parrainage" icon={HeartHandshake} label="Parrainage" desc="Cooptez des professionnels" />
          <MenuRow href="/parametres" icon={Settings} label="Paramètres" desc="Profil, préférences et compte" />
        </nav>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-2 flex min-h-[56px] w-full items-center gap-4 bg-background px-4 text-rose-600 active:bg-rose-50 lg:mt-4 lg:rounded-2xl dark:active:bg-rose-950/30"
        >
          <LogOut className="h-[22px] w-[22px]" />
          <span className="text-[15px] font-semibold">Se déconnecter</span>
        </button>
      </div>
    </div>
  )
}
