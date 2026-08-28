"use client";

import { motion } from "framer-motion";
import { User, CheckCircle2, XCircle, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

export function FomoSectionConcept3() {
  const remainingSpots = 843;

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-gray-950 border-t-8 border-emerald-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-b-xl font-bold z-50 shadow-lg">
        CONCEPT 3 : LE CONTRASTE AVANT/APRÈS
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Ne soyez pas une goutte d'eau. <br />
            <span className="text-emerald-600 dark:text-emerald-400">Soyez le phare.</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Une fois les 1 000 places attribuées, le cercle sera scellé. Voyez par vous-même la différence de traitement entre un membre standard et un Fondateur Emiid.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Standard Profile */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
          >
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Membre Standard</h3>
                <p className="text-gray-500 text-sm">Visibilité algorithmique : Faible</p>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">Abonnement mensuel requis (15€/mois)</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">Noyé dans la masse des profils</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">Accès limité aux entreprises</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">Aucun signe de distinction</span>
              </li>
            </ul>
          </motion.div>

          {/* Founder Profile */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/40 dark:to-gray-900 rounded-3xl p-8 shadow-2xl shadow-emerald-500/10 border-2 border-emerald-500 relative transform md:-translate-y-4"
          >
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              Place {1000 - remainingSpots + 1} / 1000
            </div>

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-emerald-100 dark:border-emerald-900/50">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-emerald-500">
                  <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-400 rounded-full p-1 border-2 border-white dark:border-gray-900">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Membre Fondateur
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">Visibilité algorithmique : Maximale</p>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-gray-900 dark:text-gray-200 font-medium">Gratuit à vie. Pas d'abonnement. Jamais.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-gray-900 dark:text-gray-200 font-medium">Top 1% dans les résultats de recherche</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-gray-900 dark:text-gray-200 font-medium">Accès direct au cercle des entreprises</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-gray-900 dark:text-gray-200 font-medium">Badge "Fondateur Numéroté" de prestige</span>
              </li>
            </ul>

            <Link
              href={`${USER_APP_URL}/creer-profil`}
              className="flex items-center justify-center w-full px-8 py-4 text-base font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02]"
            >
              Réclamer ce profil
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
