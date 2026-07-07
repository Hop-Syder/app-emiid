"use client";

import { motion } from "framer-motion";
import { Lock, Unlock, EyeOff, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

export function FomoSectionConcept2() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const remainingSpots = 843;

  return (
    <section className="py-24 relative overflow-hidden bg-gray-50 dark:bg-black border-t-8 border-purple-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-6 py-2 rounded-b-xl font-bold z-50 shadow-lg">
        CONCEPT 2 : LE COFFRE-FORT / DÉVERROUILLAGE
      </div>
      
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/0 to-black/0 pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-6"
          >
            <Lock className="w-8 h-8" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            L'Écosystème <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Fermé</span> Emiid
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Il existe un réseau caché où les entreprises et les leaders échangent hors de la vue du grand public. Les 1 000 premiers inscrits reçoivent la clé d'or pour y accéder à vie.
          </p>
        </div>

        {/* The Vault Interaction */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(3,179,248,0.15)] border border-gray-200 dark:border-gray-800"
          onMouseEnter={() => setIsUnlocked(true)}
          onMouseLeave={() => setIsUnlocked(false)}
        >
          {/* Background Content (The "Secret" Network) */}
          <div className="bg-white dark:bg-gray-900 p-8 grid md:grid-cols-2 gap-8 h-full min-h-[400px]">
            <div className="space-y-6">
              <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mb-3"></div>
                  <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Frosted Glass Overlay (The Lock) */}
          <div 
            className={`absolute inset-0 z-20 backdrop-blur-xl bg-white/60 dark:bg-black/60 transition-all duration-700 flex flex-col items-center justify-center
              ${isUnlocked ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100 scale-100'}
            `}
          >
            <div className="text-center p-8 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 shadow-2xl">
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                {/* Glowing ring */}
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-[spin_4s_linear_infinite]"></div>
                <div className="absolute inset-2 rounded-full border border-purple-500/50 animate-[spin_3s_linear_infinite_reverse]"></div>
                <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contenu Verrouillé</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                Survolez pour voir un aperçu des avantages réservés aux {remainingSpots} fondateurs restants.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-full">
                <EyeOff className="w-4 h-4" />
                Accès restreint
              </div>
            </div>
          </div>

          {/* Revealed Overlay (When Hovered/Unlocked) */}
          <div 
            className={`absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-700 flex flex-col justify-end p-8 md:p-12
              ${isUnlocked ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className={`transition-all duration-500 transform ${isUnlocked ? 'translate-y-0' : 'translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 text-amber-400 font-bold mb-4">
                <Unlock className="w-5 h-5" />
                Accès Fondateur Déverrouillé
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Le réseau est à vous.</h3>
              <p className="text-gray-300 mb-8 max-w-xl">
                En devenant Fondateur, ce coffre-fort restera ouvert pour vous à vie. Pas d'abonnement. Juste de la pure valeur et des opportunités d'investissement.
              </p>
              <Link
                href={`${USER_APP_URL}/creer-profil`}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-black bg-white hover:bg-gray-100 transition-all"
              >
                Prendre l'une des {remainingSpots} places
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
