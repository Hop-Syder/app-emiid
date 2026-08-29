/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Bandeau confiance & sécurité du hub public — rend visibles les
 *              garanties déjà implémentées (cf. docs/PROJECT_OVERVIEW.md,
 *              section Authentification & Sécurité) plutôt que de les laisser
 *              tacites. Badges texte+icône : aucun logo de marque partenaire
 *              n'existe dans le repo (Logo+charte/ ne contient que les logos
 *              EmiID) — `PARTNER_LOGOS` reste vide et prêt à être rempli si
 *              des fichiers de marque (FedaPay, Stripe...) sont fournis, sans
 *              réécrire le composant.
 * @created 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import { CreditCard, Lock, ShieldCheck, UserCheck } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

import type { Variants } from "framer-motion"

const TRUST_ITEMS = [
  {
    icon: Lock,
    title: "Authentification sécurisée",
    text: "Connexion par Provider + OTP + Code PIN",
  },
  {
    icon: ShieldCheck,
    title: "Données protégées",
    text: "Vos données sont protégées",
  },
  {
    icon: UserCheck,
    title: "Profils vérifiés",
    text: "Contrôle d'identité et de compétences.",
  },
  {
    icon: CreditCard,
    title: "Paiement sécurisé",
    text: "FedaPay Mobile Money et Stripe",
  },
]

/** Animation douce et progressive à l'entrée dans le viewport */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1] as const, // Transition soyeuse et progressive
      delay: i * 0.14,
    },
  }),
}

/** Logos de partenaires réels — vide tant qu'aucun fichier de marque n'est fourni. */
const PARTNER_LOGOS: { name: string; logoUrl: string; href?: string }[] = []

export function TrustSecuritySection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="space-y-6 py-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {TRUST_ITEMS.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              custom={i}
              variants={cardVariants}
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.15 }}
              className="flex flex-col gap-2 sm:gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 lg:p-6 shadow-[0_8px_24px_rgba(15,23,42,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full"
            >
              <span className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div className="space-y-1 mt-0.5">
                <h3 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-[11px] sm:text-xs font-medium leading-snug sm:leading-relaxed text-slate-600 line-clamp-3 sm:line-clamp-none">{item.text}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {PARTNER_LOGOS.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-8 rounded-[2rem] border border-slate-200/90 bg-white px-8 py-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
          {PARTNER_LOGOS.map((partner) => (
            // eslint-disable-next-line @next/next/no-img-element -- logos externes, dimensions variables
            <img key={partner.name} src={partner.logoUrl} alt={partner.name} className="h-8 w-auto grayscale opacity-70 transition-opacity hover:opacity-100" />
          ))}
        </div>
      )}
    </section>
  )
}
