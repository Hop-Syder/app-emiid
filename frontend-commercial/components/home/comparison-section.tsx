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
import { Check, X, HelpCircle } from "lucide-react";

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
    details: "Adapté aux réalités de connectivité, de devises (FCFA) et d'usages du continent."
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
    linkedin: "partial", // compétences recommandées mais pas certifiées
    emiid: "yes",
    details: "Système de vote et d'endossement authentifié par l'écosystème local."
  }
];

export function ComparisonSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-8 md:px-12 lg:px-16">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight"
          >
            Pourquoi choisir Emiid ?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto"
          >
            Une comparaison claire pour comprendre comment Emiid répond réellement aux besoins professionnels sur le continent.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto overflow-hidden rounded-[32px] border border-gray-200/80 shadow-2xl bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200/60">
                  <th className="p-6 text-sm font-bold text-gray-900">Fonctionnalité</th>
                  <th className="p-6 text-sm font-semibold text-center text-gray-400">WhatsApp</th>
                  <th className="p-6 text-sm font-semibold text-center text-gray-400">LinkedIn</th>
                  <th className="p-6 text-sm font-bold text-center text-indigo-600 bg-indigo-50/40 relative">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    Emiid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {features.map((feature, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="p-6">
                      <div className="font-bold text-gray-900 text-sm">{feature.name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 hidden sm:block">{feature.details}</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center">
                        {renderStatus(feature.whatsapp)}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center">
                        {renderStatus(feature.linkedin)}
                      </div>
                    </td>
                    <td className="p-6 text-center bg-indigo-50/10 font-medium border-l border-r border-indigo-100/30">
                      <div className="flex justify-center">
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
    </section>
  );
}

function renderStatus(status: string, isEmiid: boolean = false) {
  if (isEmiid) {
    switch (status) {
      case "yes":
        return <Check className="w-5 h-5 text-indigo-600 bg-indigo-100 rounded-full p-1" />;
      case "no":
        return <X className="w-5 h-5 text-red-500 bg-red-50 rounded-full p-1" />;
      case "partial":
      default:
        return <HelpCircle className="w-5 h-5 text-yellow-500 bg-yellow-50 rounded-full p-1" />;
    }
  }

  switch (status) {
    case "yes":
      return <Check className="w-4 h-4 text-gray-400 bg-gray-100 rounded-full p-0.5" />;
    case "no":
      return <X className="w-4 h-4 text-gray-400 bg-gray-100 rounded-full p-0.5" />;
    case "partial":
    default:
      return <HelpCircle className="w-4 h-4 text-gray-400 bg-gray-100 rounded-full p-0.5" />;
  }
}
