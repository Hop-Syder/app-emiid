/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description CTA contextuel du Hub — Design simple, épuré et texte court à fort impact.
 * @created 2026-07-10
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { ArrowRight, ShieldCheck, UserCircle } from "lucide-react"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { Button } from "@/components/ui/button"

export function HubContextualCta() {
  const { currentUser, session } = useCurrentUserProfile()

  if (session === undefined || (currentUser && currentUser.has_profile === undefined)) {
    return <div className="h-28 rounded-3xl bg-muted/50 animate-pulse" />
  }

  const hasNoProfile = currentUser && !currentUser.has_profile
  const isUnpublished = currentUser && currentUser.has_profile && currentUser.is_published === false
  const needsProfile = hasNoProfile || isUnpublished

  if (needsProfile) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-[#000616] border border-white/10 p-6 sm:p-8 shadow-xl">
        {/* Lueur d'ambiance bleue */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#013ff4]/15 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#03b3f8]/10 rounded-full blur-[90px] pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#013ff4]/15 border border-[#013ff4]/30 text-sky-400 text-xs font-semibold">
              <UserCircle className="w-3.5 h-3.5" />
              <span>Visibilité</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              {hasNoProfile ? "Créez votre carte de visite" : "Rendez votre profil visible"}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-normal">
              {hasNoProfile
                ? "Configurez votre profil professionnel en 2 minutes pour intégrer l'annuaire."
                : "Publiez votre carte pour recevoir des opportunités et être contacté."}
            </p>
          </div>

          <Link href={hasNoProfile ? "/creer-profil" : "/parametres"} className="shrink-0">
            <Button className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-gradient-to-r from-[#013ff4] to-[#03b3f8] hover:from-[#0135d0] hover:to-[#029ad7] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]">
              {hasNoProfile ? "Créer mon profil" : "Publier mon profil"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#000616] border border-white/10 p-6 sm:p-8 shadow-xl">
      {/* Lueur d'ambiance cyan & bleue */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#03b3f8]/15 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#013ff4]/10 rounded-full blur-[90px] pointer-events-none -ml-16 -mb-16" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#03b3f8]/15 border border-[#03b3f8]/30 text-sky-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confiance</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            Les personnes de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] via-[#03b3f8] to-sky-300">
              confiance
            </span>{" "}
            sont ici
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-normal">
            Contactez un professionnel vérifié et avancez votre projet dès aujourd&apos;hui.
          </p>
        </div>

        <Link href="/annuaire?filter=verified" className="shrink-0">
          <Button className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-gradient-to-r from-[#013ff4] to-[#03b3f8] hover:from-[#0135d0] hover:to-[#029ad7] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]">
            Trouver un talent vérifié
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
