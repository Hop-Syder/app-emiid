"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Qu'est-ce qu'Emiid exactement ?",
    answer: "Emiid est le premier réseau professionnel B2B conçu spécifiquement pour l'Afrique. Nous connectons les talents tech, les fondateurs, les entreprises et les artisans avec les meilleures opportunités du marché, tout en proposant un système de vérification par les pairs robuste."
  },
  {
    question: "Comment obtenir le Badge Fondateur Numéroté ?",
    answer: "Le Badge Fondateur est strictement réservé aux 1000 premiers inscrits (700 en Afrique, 300 à l'international) qui complètent leur profil à 80% et qui invitent 3 personnes actives. En plus du prestige, il vous donne droit à 1 an d'abonnement PRO totalement gratuit."
  },
  {
    question: "Est-ce qu'Emiid est gratuit ?",
    answer: "Oui, la création d'un profil et l'accès à l'annuaire de base sont 100% gratuits. Pour ceux qui veulent accélérer leur croissance, nous proposons des plans Pro et Entreprise (à partir de 2000 FCFA/mois) qui débloquent des fonctionnalités avancées comme le portfolio illimité et le contact direct."
  },
  {
    question: "En quoi êtes-vous différents de LinkedIn ?",
    answer: "Contrairement aux réseaux traditionnels occidentaux, Emiid est pensé pour nos réalités. Notre architecture est ultra-légère pour fonctionner même avec une connexion instable, nos tarifs sont adaptés et payables en monnaie locale (Mobile Money), et nous valorisons l'économie informelle et les artisans au même titre que la tech."
  },
  {
    question: "Comment fonctionne le système de vérification (Confiance) ?",
    answer: "Pour éviter les faux profils et les arnaques, Emiid utilise un système de 'Social Proof'. Votre profil gagne en crédibilité lorsqu'il est endossé (recommandé) par vos pairs. De plus, nos équipes vérifient manuellement l'identité légale des entreprises pour leur attribuer un badge certifié."
  }
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
              isOpen 
                ? "bg-white/60 dark:bg-white/[0.05] border-indigo-500/50 shadow-lg shadow-indigo-500/10" 
                : "bg-white/20 dark:bg-[#0a0a0a]/50 border-gray-200/50 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
            } backdrop-blur-xl`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none"
            >
              <span className={`text-lg font-bold ${isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
                {faq.question}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`flex-shrink-0 ml-4 p-2 rounded-full ${isOpen ? "bg-indigo-500/10 text-indigo-500" : "bg-gray-100 dark:bg-white/5 text-gray-500"}`}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
