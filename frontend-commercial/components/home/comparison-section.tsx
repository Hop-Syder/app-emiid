/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section comparative (EmiID vs LinkedIn vs WhatsApp) adaptée mobile et Dark Mode #000616
 * @created 2026-06-12
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { motion } from "framer-motion";
import { Check, X, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

interface ComparisonFeature {
  name: string;
  whatsapp: "yes" | "no" | "partial";
  linkedin: "yes" | "no" | "partial";
  emiid: "yes" | "no" | "partial";
  details: string;
}

const features: ComparisonFeature[] = [
  {
    name: "Profils professionnels certifiés",
    whatsapp: "no",
    linkedin: "yes",
    emiid: "yes",
    details: "Vérification d'identité formelle et badges de certification officiels anti-usurpation.",
  },
  {
    name: "Conçu spécifiquement pour l'Afrique",
    whatsapp: "no",
    linkedin: "no",
    emiid: "yes",
    details: "Navigation ultra-légère même en 3G, intégration des devises locales et réalités économiques du continent.",
  },
  {
    name: "Adapté aux Artisans & Indépendants",
    whatsapp: "partial",
    linkedin: "no",
    emiid: "yes",
    details: "Met en valeur les corps de métiers manuels, commerçants et freelances, sans exiger de CV corporate standard.",
  },
  {
    name: "Tarifs locaux et transparents",
    whatsapp: "yes",
    linkedin: "no",
    emiid: "yes",
    details: "Formule gratuite complète et plan Pro accessible dès 1 000 FCFA/mois sans surprise de change.",
  },
  {
    name: "Messagerie instantanée & Sécurité RLS",
    whatsapp: "yes",
    linkedin: "no",
    emiid: "yes",
    details: "Messagerie instantanée directe couplée à la protection des coordonnées par code PIN.",
  },
  {
    name: "Recommandation par les pairs",
    whatsapp: "no",
    linkedin: "partial",
    emiid: "yes",
    details: "Endossement communautaire vérifié pour bâtir une réputation authentique et traçable.",
  },
  {
    name: "Paiement Mobile Money natif",
    whatsapp: "no",
    linkedin: "no",
    emiid: "yes",
    details: "Souscription directe par Wave, Orange Money, MTN MoMo et Moov Money via FedaPay.",
  },
  {
    name: "Support réactif sur le fuseau africain",
    whatsapp: "partial",
    linkedin: "no",
    emiid: "yes",
    details: "Assistance dédiée en français, accessible par WhatsApp et email avec des équipes locales.",
  },
];

export function ComparisonSection() {
  const [mobileCompetitor, setMobileCompetitor] = useState<"whatsapp" | "linkedin">("linkedin");

  return (
    <section className="py-24 relative overflow-hidden bg-background border-t border-gray-100 dark:border-white/5">
      {/* Glows d'ambiance Bleu Roi & Cyan */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#013ff4]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#03b3f8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#013ff4]/10 dark:bg-[#013ff4]/20 border border-[#013ff4]/25 text-[#013ff4] dark:text-[#03b3f8] font-bold text-xs mb-4"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Comparatif Objectif</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
          >
            Pourquoi choisir <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] to-[#03b3f8] font-wordmark">EmiID</span> ?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-400 mx-auto"
          >
            Découvrez comment EmiID comble le vide laissé par les réseaux traditionnels en s&apos;adaptant concrètement aux réalités des professionnels du continent.
          </motion.p>
        </div>

        {/* ── Version Mobile (< md) : Switcher interactif ── */}
        <div className="block md:hidden">
          <div className="flex p-1.5 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-2xl mb-6">
            <button
              onClick={() => setMobileCompetitor("linkedin")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
                mobileCompetitor === "linkedin"
                  ? "bg-white dark:bg-[#000616] text-[#013ff4] dark:text-[#03b3f8] shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              EmiID vs LinkedIn
            </button>
            <button
              onClick={() => setMobileCompetitor("whatsapp")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
                mobileCompetitor === "whatsapp"
                  ? "bg-white dark:bg-[#000616] text-[#013ff4] dark:text-[#03b3f8] shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              EmiID vs WhatsApp
            </button>
          </div>

          <div className="space-y-3">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">{feature.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{feature.details}</p>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
                  {/* Concurrent sélectionné */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.02]">
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 capitalize">
                      {mobileCompetitor}
                    </span>
                    {renderStatus(feature[mobileCompetitor])}
                  </div>

                  {/* EmiID */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#013ff4]/10 dark:bg-[#013ff4]/20 border border-[#013ff4]/20">
                    <span className="text-[11px] font-bold text-[#013ff4] dark:text-[#03b3f8] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> EmiID
                    </span>
                    {renderStatus(feature.emiid, true)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Version Desktop (>= md) : Tableau comparatif illuminé ── */}
        <div className="hidden md:block max-w-5xl mx-auto relative group">
          {/* Lueur extérieure hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#013ff4]/20 via-[#03b3f8]/20 to-[#013ff4]/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="overflow-hidden rounded-[2rem] border border-gray-200/80 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-[#000616]/90 backdrop-blur-xl relative z-10">
            {/* Colonne EmiID mise en surbrillance */}
            <div className="absolute top-0 bottom-0 right-0 w-[24%] bg-gradient-to-b from-[#013ff4]/5 to-[#03b3f8]/5 dark:from-[#013ff4]/10 dark:to-[#03b3f8]/10 pointer-events-none border-l border-[#013ff4]/15 dark:border-[#03b3f8]/20" />

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left relative z-10">
                <thead>
                  <tr className="border-b border-gray-200/80 dark:border-white/10">
                    <th className="p-6 md:p-7 text-sm font-bold text-gray-900 dark:text-gray-100 w-[42%]">
                      Fonctionnalités & Avantages
                    </th>
                    <th className="p-6 md:p-7 text-xs font-bold tracking-widest uppercase text-center text-gray-400 dark:text-gray-500 w-[17%]">
                      WhatsApp
                    </th>
                    <th className="p-6 md:p-7 text-xs font-bold tracking-widest uppercase text-center text-gray-400 dark:text-gray-500 w-[17%]">
                      LinkedIn
                    </th>
                    <th className="p-6 md:p-7 text-sm font-black tracking-widest uppercase text-center text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] to-[#03b3f8] w-[24%] relative">
                      <span className="font-wordmark">EmiID</span>
                      {/* Barre d'accentuation supérieure */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#013ff4] to-[#03b3f8] shadow-[0_0_12px_rgba(1,63,244,0.6)]" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {features.map((feature, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: index * 0.04 }}
                      className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors duration-200 group/row"
                    >
                      <td className="p-6 md:p-7">
                        <div className="font-bold text-gray-900 dark:text-gray-200 text-sm group-hover/row:text-[#013ff4] dark:group-hover/row:text-[#03b3f8] transition-colors">
                          {feature.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed pr-4">
                          {feature.details}
                        </div>
                      </td>
                      <td className="p-6 md:p-7 text-center">
                        <div className="flex justify-center">{renderStatus(feature.whatsapp)}</div>
                      </td>
                      <td className="p-6 md:p-7 text-center">
                        <div className="flex justify-center">{renderStatus(feature.linkedin)}</div>
                      </td>
                      <td className="p-6 md:p-7 text-center relative">
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

function renderStatus(status: "yes" | "no" | "partial", isEmiid: boolean = false) {
  if (isEmiid) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#013ff4]/10 dark:bg-[#013ff4]/25 ring-1 ring-[#013ff4]/30 dark:ring-[#03b3f8]/50 shadow-[0_0_12px_rgba(1,63,244,0.35)] transition-transform hover:scale-110 duration-200">
        <Check className="w-4 h-4 text-[#013ff4] dark:text-[#03b3f8] stroke-[3]" />
      </div>
    );
  }

  if (status === "yes") {
    return (
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Check className="w-4 h-4 stroke-[2.5]" />
      </div>
    );
  }
  if (status === "no") {
    return (
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500/10 text-red-500/80 dark:text-red-400">
        <X className="w-4 h-4 stroke-[2]" />
      </div>
    );
  }

  return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
      Partiel
    </span>
  );
}
