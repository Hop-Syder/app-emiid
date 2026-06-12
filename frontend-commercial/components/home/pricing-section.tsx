/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section Tarifs du site commercial avec offres gratuites et premium
 * @created 2026-06-12
 * @updated 2026-06-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

const tiers = [
  {
    name: "Gratuit",
    id: "tier-free",
    href: "/creer-profil",
    priceMonthly: "0 FCFA",
    description: "L'essentiel pour commencer votre présence en ligne.",
    features: [
      "Profil public basique",
      "Visibilité dans l'annuaire",
      "Ajout de 3 tags d'expertise",
    ],
    featured: false,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "/creer-profil",
    priceMonthly: "9 900 FCFA",
    description: "Un profil premium pour maximiser vos opportunités.",
    features: [
      "Profil public complet avec portfolio",
      "Mise en avant dans les résultats de recherche",
      "Tags d'expertise illimités",
      "Bouton de contact direct",
      "Badges de certification",
    ],
    featured: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Tarification</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Un investissement pour votre croissance
          </p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                tier.featured
                  ? "bg-gray-900 ring-gray-900 text-white shadow-2xl"
                  : "ring-gray-200 bg-white dark:bg-gray-900 text-gray-900"
              }`}
            >
              <h3
                id={tier.id}
                className={`text-lg font-semibold leading-8 ${
                  tier.featured ? "text-indigo-400" : "text-gray-900"
                }`}
              >
                {tier.name}
              </h3>
              <p className={`mt-4 text-sm leading-6 ${tier.featured ? "text-gray-300" : "text-gray-600"}`}>
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight">{tier.priceMonthly}</span>
                <span className={`text-sm font-semibold leading-6 ${tier.featured ? "text-gray-300" : "text-gray-600"}`}>/mois</span>
              </p>
              <a
                href={`${USER_APP_URL}${tier.href}`}
                aria-describedby={tier.id}
                className={`mt-6 block rounded-xl px-3 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                  tier.featured
                    ? "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-indigo-500 shadow-md"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200"
                }`}
              >
                Commencer maintenant
              </a>
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 xl:mt-10 ${
                  tier.featured ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      className={`h-6 w-5 flex-none ${tier.featured ? "text-indigo-400" : "text-indigo-600"}`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
