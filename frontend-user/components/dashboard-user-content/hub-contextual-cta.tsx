"use client"

import Link from "next/link"
import { ArrowRight, Crown, Sparkles, UserCircle } from "lucide-react"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { Button } from "@/components/ui/button"

export function HubContextualCta() {
  const { currentUser, session } = useCurrentUserProfile()

  // Wait for the backend data to load (has_profile becomes defined)
  // session === undefined means auth is still checking
  if (session === undefined || (currentUser && currentUser.has_profile === undefined)) {
    return <div className="h-40 md:h-60 rounded-[2.5rem] bg-slate-100/50 animate-pulse" />
  }

  const needsProfile = currentUser && (!currentUser.has_profile || currentUser.is_published === false)

  if (needsProfile) {
    return (
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#021124] px-8 py-14 md:py-20 flex flex-col items-center text-center shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20">
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/15 via-[#021124]/50 to-[#021124] pointer-events-none" />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-400/40 transition-colors duration-700" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 group-hover:border-indigo-500/30 transition-colors duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <UserCircle className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase">Profil Incomplet</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight max-w-2xl leading-tight">
            Ton profil n'est pas encore{" "}
            <span className="relative whitespace-nowrap">
              <span className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">
                visible
              </span>
            </span>
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl text-lg font-medium leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
            Complète et publie ton profil pour apparaître dans l'annuaire et être contacté par des clients et partenaires.
          </p>
          <Link href="/parametre">
            <Button className="group/btn relative overflow-hidden rounded-2xl bg-white text-slate-900 hover:text-white font-bold px-10 h-14 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all duration-300 hover:scale-105">
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Compléter mon profil
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#021124] px-8 py-14 md:py-20 flex flex-col items-center text-center shadow-2xl transition-all duration-500 hover:shadow-amber-500/10">
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-[#021124]/80 to-[#021124] pointer-events-none" />
      <div className="absolute -top-40 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-amber-400/30 transition-colors duration-700" />
      <div className="absolute -bottom-40 left-10 w-96 h-96 bg-orange-500/15 rounded-full blur-[100px] pointer-events-none group-hover:bg-orange-500/25 transition-colors duration-700" />
      
      {/* Sparkles Decoration */}
      <div className="absolute top-10 left-10 text-amber-500/20 animate-pulse"><Sparkles className="w-6 h-6" /></div>
      <div className="absolute bottom-20 right-16 text-orange-500/20 animate-pulse" style={{ animationDelay: '1s' }}><Sparkles className="w-8 h-8" /></div>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 group-hover:border-amber-500/20 transition-colors duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold tracking-widest uppercase">Premium EmiID</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight max-w-2xl leading-tight">
          Booste ta{" "}
          <span className="relative whitespace-nowrap">
            <span className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
              visibilité
            </span>
          </span>
        </h2>
        <p className="text-slate-400 mb-10 max-w-xl text-lg font-medium leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
          Passe Premium pour apparaître en tête des résultats, accéder aux statistiques avancées et débloquer toutes les fonctionnalités.
        </p>
        <Link href="/premium">
          <Button className="group/btn relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold px-10 h-14 shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.6)] transition-all duration-300 hover:scale-105 border-0">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Passer Premium
            </span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
