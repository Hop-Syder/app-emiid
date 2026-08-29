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

import { CreditCard, MessageCircle, Search, TrendingUp } from "lucide-react"

const STEPS = [
  {
    icon: CreditCard,
    title: "Créez votre carte numérique",
    text: "Bio, spécialité, portfolio en galerie Bento, QR code et vCard — votre vitrine professionnelle en quelques minutes.",
  },
  {
    icon: Search,
    title: "Soyez trouvé",
    text: "Annuaire géolocalisé et recherche intelligente (sémantique + dictée vocale) : les bonnes personnes vous trouvent au bon moment.",
  },
  {
    icon: MessageCircle,
    title: "Échangez en confiance",
    text: "Messagerie temps réel, appel et WhatsApp en un clic — réservés aux membres, pour protéger vos coordonnées du démarchage.",
  },
  {
    icon: TrendingUp,
    title: "Développez votre activité",
    text: "Badge vérifié, abonnement Pro et boosts de visibilité communaux ou départementaux pour sortir du lot.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="space-y-6 py-4">
      <div className="space-y-2 px-1 sm:px-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf1ff] px-3.5 py-1.5 text-xs font-bold text-[#013ff4] shadow-xs">
          Comment ça marche
        </div>
        <h2 className="font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Tout le parcours, avant de vous inscrire
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="relative flex flex-col gap-3 rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)]"
            >
              <span className="text-xs font-black text-slate-300">{`0${i + 1}`}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#013ff4]/10 text-[#013ff4]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-black tracking-tight text-slate-900">{step.title}</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-600">{step.text}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
