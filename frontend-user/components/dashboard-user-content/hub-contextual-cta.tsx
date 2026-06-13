"use client"

import Link from "next/link"
import { ArrowRight, Crown, Sparkles, UserCircle } from "lucide-react"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { Button } from "@/components/ui/button"

export function HubContextualCta() {
  const { currentUser } = useCurrentUserProfile()

  const needsProfile = currentUser && (!currentUser.has_profile || currentUser.is_published === false)

  if (needsProfile) {
    return (
      <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-14 md:py-20 flex flex-col items-center text-center shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 mb-6 backdrop-blur-md">
            <UserCircle className="w-4 h-4" />
            <span className="text-sm font-bold tracking-wide uppercase">Profil Incomplet</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight max-w-xl leading-tight">
            Ton profil n'est pas encore{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              visible
            </span>
          </h2>
          <p className="text-slate-300/80 mb-8 max-w-lg font-medium leading-relaxed">
            Complète et publie ton profil pour apparaître dans l'annuaire et être contacté par des clients et partenaires.
          </p>
          <Link href="/parametre">
            <Button className="rounded-xl bg-white text-slate-900 hover:bg-slate-50 font-bold px-8 h-12 shadow-xl text-sm transition-all hover:scale-[1.02]">
              Compléter mon profil
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-8 py-14 md:py-20 flex flex-col items-center text-center shadow-2xl">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 mb-6 backdrop-blur-md">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-bold tracking-wide uppercase">Premium EmiID</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight max-w-xl leading-tight">
          Booste ta{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            visibilité
          </span>
        </h2>
        <p className="text-slate-300/80 mb-8 max-w-lg font-medium leading-relaxed">
          Passe Premium pour apparaître en tête des résultats, accéder aux statistiques avancées et débloquer toutes les fonctionnalités.
        </p>
        <Link href="/premium">
          <Button className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 hover:from-amber-300 hover:to-orange-300 font-bold px-8 h-12 shadow-xl shadow-amber-500/20 text-sm transition-all hover:scale-[1.02]">
            <Sparkles className="w-4 h-4 mr-2" />
            Passer Premium
          </Button>
        </Link>
      </div>
    </div>
  )
}
