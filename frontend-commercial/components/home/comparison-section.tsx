/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section comparative (Emiid vs LinkedIn vs WhatsApp)
 * @created 2026-06-12
 * @updated 2026-06-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const features = [
  {
    name: "Profils professionnels certifiés",
    whatsapp: "no",
    linkedin: "yes",
    emiid: "yes",
    details: "Vérification formelle et badges de certification officiels."
  },
  {
    name: "Conçu spécifiquement pour l'Afrique",
    whatsapp: "no",
    linkedin: "no",
    emiid: "yes",
    details: "Optimisé pour nos réalités : navigation ultra-fluide même avec une connexion instable, abonnements à moindre coût et Mobile Money."
  },
  {
    name: "Adapté aux Artisans & Indépendants",
    whatsapp: "partial",
    linkedin: "no",
    emiid: "yes",
    details: "Valorise l'informel et les métiers manuels en plus des profils tech corporatifs."
  },
  {
    name: "Tarifs locaux et accessibles",
    whatsapp: "yes", // gratuit
    linkedin: "no",  // très cher en devises étrangères
    emiid: "yes",  // Freemium avec tarifs locaux (ex: 9900 FCFA/mois)
    details: "Solutions de paiement mobile intégrées (Mobile Money, FedaPay)."
  },
  {
    name: "Messagerie temps réel + Sécurité",
    whatsapp: "yes", // messagerie mais pas de protection de profil pro
    linkedin: "no",  // messagerie classique lente
    emiid: "yes",  // chat instantané + sécurité RLS/PIN du profil
    details: "Protection renforcée par PIN et modération active."
  },
  {
    name: "Validation & Recommandation par les pairs",
    whatsapp: "no",
    linkedin: "partial",
    emiid: "yes",
    details: "Système de vote et d'endossement authentifié par l'écosystème local."
  },
  {
    name: "Paiement Mobile Money (Wave, Orange Money, MTN MoMo)",
    whatsapp: "no",
    linkedin: "no",
    emiid: "yes",
    details: "Abonnez-vous directement en FCFA via vos outils de paiement habituels. Zéro frais de change, zéro carte bancaire étrangère."
  },
  {
    name: "Support en langue locale & fuseau africain",
    whatsapp: "partial",
    linkedin: "no",
    emiid: "yes",
    details: "Équipe support basée en Afrique, disponible en français avec une connaissance réelle des réalités locales."
  }
];

export function ComparisonSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-[#050505]">
      {/* Background Subtle Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            Pourquoi choisir <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Emiid ?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 mx-auto"
          >
            Découvrez comment Emiid comble le vide laissé par les réseaux traditionnels en s'adaptant réellement aux réalités professionnelles du continent.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto relative group">
          {/* Outer glow for the table */}
          <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <div className="overflow-hidden rounded-[2rem] border border-gray-200/50 dark:border-gray-800/80 shadow-2xl bg-white/50 dark:bg-[#0a0a0a]/80 backdrop-blur-xl relative z-10">
            {/* Emiid Column Highlight Background */}
            <div className="absolute top-0 bottom-0 right-0 w-1/4 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 pointer-events-none border-l border-indigo-500/10 dark:border-indigo-500/20"></div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left relative z-10">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-800/50">
                    <th className="p-6 md:p-8 text-sm font-bold text-gray-900 dark:text-gray-100 w-[40%]">Fonctionnalités & Avantages</th>
                    <th className="p-6 md:p-8 text-xs font-bold tracking-widest uppercase text-center text-gray-400 dark:text-gray-500 w-[20%]">WhatsApp</th>
                    <th className="p-6 md:p-8 text-xs font-bold tracking-widest uppercase text-center text-gray-400 dark:text-gray-500 w-[20%]">LinkedIn</th>
                    <th className="p-6 md:p-8 text-sm font-black tracking-widest uppercase text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 w-[20%] relative">
                      Emiid
                      {/* Top highlight bar */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(1,63,244,0.5)]"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
                  {features.map((feature, index) => (
                    <motion.tr 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-300 group/row"
                    >
                      <td className="p-6 md:p-8">
                        <div className="font-bold text-gray-900 dark:text-gray-200 text-sm group-hover/row:text-indigo-600 dark:group-hover/row:text-indigo-400 transition-colors">{feature.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1.5 leading-relaxed pr-4 hidden sm:block">{feature.details}</div>
                      </td>
                      <td className="p-6 md:p-8 text-center">
                        <div className="flex justify-center">
                          {renderStatus(feature.whatsapp)}
                        </div>
                      </td>
                      <td className="p-6 md:p-8 text-center">
                        <div className="flex justify-center">
                          {renderStatus(feature.linkedin)}
                        </div>
                      </td>
                      <td className="p-6 md:p-8 text-center relative">
                        <div className="flex justify-center relative z-10">
                          {renderStatus(feature.emiid, true)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function renderStatus(status: string, isEmiid: boolean = false) {
  if (isEmiid) {
    if (status === "yes") {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/20 ring-1 ring-indigo-200 dark:ring-indigo-500/50 shadow-[0_0_15px_rgba(1,63,244,0.4)] transition-transform hover:scale-110 duration-300">
          <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      );
    }
  }

  // Competitors styling (cleaner, less aggressive than red X)
  if (status === "yes") {
    return <Check className="w-5 h-5 text-gray-400 dark:text-gray-600" />;
  }
  if (status === "no") {
    return <X className="w-5 h-5 text-red-400 dark:text-red-500/80" />;
  }
  
  // Partial
  return (
    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
      Partiel
    </div>
  );
}
