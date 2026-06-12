"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export function FomoSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 md:px-12 lg:px-16">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400 font-bold mb-6"
          >
            🏛️ Cercle des Fondateurs Emiid
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Réservé aux 1 000 premiers
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            Une opportunité qui <strong className="text-gray-900 dark:text-white">ne se rouvrira jamais</strong>. Obtenez votre badge numéroté <strong className="text-gray-900 dark:text-white">"Fondateur #XXX"</strong> à vie sur votre profil, et profitez du pack <strong className="text-indigo-600 dark:text-indigo-400">Pro à vie</strong> (tant que la plateforme existe).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Ce que vous gagnez */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-indigo-50"
          >
            <h3 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center">
              <span className="bg-indigo-100 p-2 rounded-lg mr-3">
                <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              </span>
              En rejoignant Emiid
            </h3>
            <ul className="space-y-4">
              {[
                "Visibilité premium auprès d'investisseurs qualifiés",
                "Mise en réseau avec les leaders de l'écosystème",
                "Accès prioritaire aux opportunités de marché",
                "Crédibilité renforcée par un profil certifié",
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Ce que vous ratez */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg border border-red-50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10 opacity-50"></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-red-50 p-2 rounded-lg mr-3">
                <XCircle className="w-6 h-6 text-red-500" />
              </span>
              En restant isolé
            </h3>
            <ul className="space-y-4">
              {[
                "Perte d'opportunités de financement cruciales",
                "Isolement face aux dynamiques du marché africain",
                "Manque de visibilité auprès des partenaires clés",
                "Difficulté à prouver votre légitimité",
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-400 mr-3 shrink-0 mt-0.5" />
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
