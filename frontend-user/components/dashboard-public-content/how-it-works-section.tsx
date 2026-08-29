/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section "Comment ça marche" du hub public — déroule le parcours
 *              produit complet en 4 étapes avant les CTA de conversion, pour
 *              qu'un visiteur comprenne toute la valeur d'EmiID sans avoir à
 *              deviner ce qu'il y a après l'inscription. Contenu strictement
 *              descriptif de fonctionnalités déjà livrées (cf.
 *              docs/PROJECT_OVERVIEW.md) — aucune promesse non tenue.
 * @created 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import Link from "next/link"
import { CreditCard, MessageCircle, Search, TrendingUp, ArrowRight } from "lucide-react"

const STEPS = [
  {
    icon: CreditCard,
    title: "Créez votre carte",
    text: "Vitrine digitale, portfolio, QR code et lien unique en 2 minutes.",
  },
  {
    icon: Search,
    title: "Soyez visible",
    text: "Annuaire géolocalisé et recherche IA pour être trouvé facilement.",
  },
  {
    icon: MessageCircle,
    title: "Échangez en direct",
    text: "Messagerie sécurisée et opportunités qualifiées sans intermédiaire.",
  },
  {
    icon: TrendingUp,
    title: "Développez vos affaires",
    text: "Badge certifié et visibilité boostée pour accélérer votre croissance.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="space-y-6 py-4">
      {/* En-tête avec titre et CTA rapide */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1 sm:px-2">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf1ff] px-3 py-1 text-xs font-bold text-[#013ff4]">
            Comment ça marche
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Rejoignez le réseau en 4 étapes
          </h2>
        </div>

        <Link
          href="/creer-profil"
          className="inline-flex items-center justify-center gap-2 self-center sm:self-auto px-5 py-2.5 rounded-xl bg-[#013ff4] hover:bg-[#0134d1] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#013ff4]/20 transition-all active:scale-95"
        >
          <span>Créer mon profil</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grille des 4 étapes connectées — 2 cartes par ligne sur mobile (grid-cols-2), 4 sur grand écran (lg:grid-cols-4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const isNotLast = i < STEPS.length - 1

          return (
            <div key={step.title} className="relative group">
              <div className="relative flex flex-col gap-2 sm:gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 lg:p-6 shadow-[0_8px_24px_rgba(15,23,42,0.03)] hover:shadow-xl hover:shadow-[#013ff4]/5 hover:border-[#013ff4]/40 hover:-translate-y-1 transition-all duration-300 h-full">
                {/* En-tête de la carte : Icône avec dégradé + Badge étape */}
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-[#013ff4]/10 via-[#013ff4]/5 to-[#03b3f8]/15 text-[#013ff4] group-hover:from-[#013ff4] group-hover:to-[#03b3f8] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-[#013ff4]/25 group-hover:scale-105">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300" />
                  </span>
                  <span className="flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black bg-slate-100 text-slate-400 group-hover:bg-[#013ff4]/10 group-hover:text-[#013ff4] transition-colors">
                    {`0${i + 1}`}
                  </span>
                </div>

                {/* Titre & Description */}
                <div className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1">
                  <h3 className="text-xs sm:text-base font-black tracking-tight text-slate-900 group-hover:text-[#013ff4] transition-colors leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs lg:text-[13px] font-medium leading-snug sm:leading-relaxed text-slate-600 line-clamp-3 sm:line-clamp-none">
                    {step.text}
                  </p>
                </div>
              </div>

              {/* Connecteur de progression subtil entre les étapes (Visible uniquement sur Desktop) */}
              {isNotLast && (
                <div
                  aria-hidden="true"
                  className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:border-[#013ff4]/40 group-hover:text-[#013ff4]"
                >
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
