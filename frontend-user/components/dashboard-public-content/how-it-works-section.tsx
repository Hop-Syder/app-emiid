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

      {/* Grille des 4 étapes compactes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="relative flex flex-col gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#013ff4]/10 text-[#013ff4]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-black text-slate-300">{`0${i + 1}`}</span>
              </div>
              <h3 className="text-base font-black tracking-tight text-slate-900 mt-1">{step.title}</h3>
              <p className="text-xs sm:text-[13px] font-medium leading-relaxed text-slate-600">{step.text}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
