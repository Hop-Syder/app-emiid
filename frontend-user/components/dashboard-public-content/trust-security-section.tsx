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

const TRUST_ITEMS = [
  {
    icon: Lock,
    title: "Authentification sécurisée",
    text: "Connexion par email + OTP, protégée par un code PIN sur les données sensibles.",
  },
  {
    icon: ShieldCheck,
    title: "Données protégées",
    text: "Row Level Security au niveau base de données : chacun n'accède qu'à ce qui lui est destiné.",
  },
  {
    icon: UserCheck,
    title: "Profils vérifiés",
    text: "Badge attribué après contrôle d'identité et de compétences par l'équipe EmiID.",
  },
  {
    icon: CreditCard,
    title: "Paiement sécurisé",
    text: "FedaPay Mobile Money (MTN, Moov, Orange) et Stripe pour les abonnements et boosts.",
  },
]

/** Logos de partenaires réels — vide tant qu'aucun fichier de marque n'est fourni. */
const PARTNER_LOGOS: { name: string; logoUrl: string; href?: string }[] = []

export function TrustSecuritySection() {
  return (
    <section className="space-y-6 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-black tracking-tight text-slate-900">{item.title}</h3>
              <p className="text-xs font-medium leading-relaxed text-slate-600">{item.text}</p>
            </div>
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
