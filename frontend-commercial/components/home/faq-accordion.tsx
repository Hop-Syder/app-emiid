/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Accordéon FAQ dynamique avec recherche en temps réel et Dark Mode #000616
 * @created 2026-06-13
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe2, UserCircle2, CreditCard, ShieldCheck, Search, HelpCircle, X } from "lucide-react";

interface Faq {
  question: string;
  answer: string;
}

interface Category {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  faqs: Faq[];
}

const categories: Category[] = [
  {
    id: "general",
    title: "Comprendre EmiID",
    icon: Globe2,
    faqs: [
      {
        question: "Qu'est-ce qu'EmiID exactement ?",
        answer:
          "EmiID est la plateforme de référence pour l'identité numérique professionnelle en Afrique. Elle vous permet de créer une vitrine professionnelle certifiée — vérifiée par vos pairs et accessible aux recruteurs, partenaires et clients d'affaires. Contrairement aux réseaux saturés, EmiID valorise aussi bien les experts tech que les artisans d'art, consultants et entrepreneurs, avec une accessibilité technique adaptée au continent.",
      },
      {
        question: "Pour qui est conçu EmiID ?",
        answer:
          "EmiID s'adresse à 3 profils clés :\n• Les Talents & Freelances — développeurs, designers, juristes, artisans — désireux d'être découverts sans intermédiaires prédateurs.\n• Les Fondateurs & PME — qui souhaitent certifier leur entreprise, partager une vitrine moderne et asseoir leur crédibilité commerciale.\n• Les Institutions & Recruteurs — qui recherchent des compétences authentiques et vérifiées en Afrique sans faux comptes.",
      },
      {
        question: "En quoi êtes-vous différents de LinkedIn ou WhatsApp ?",
        answer:
          "LinkedIn facture des abonnements coûteux en devises étrangères sans intégrer le Mobile Money, et pénalise les connexions mobiles lentes.\n\nWhatsApp permet l'échange direct mais n'offre aucune vérification formelle, aucun annuaire public et aucune protection de profil.\n\nEmiID réunit le meilleur des deux mondes : profil vérifié, lien court, QR Code professionnel, messagerie sécurisée, paiement natif en FCFA par Mobile Money (Wave, MTN, Orange, Moov) et support en français sur fuseau africain.",
      },
      {
        question: "Dans quels pays EmiID est-il disponible ?",
        answer:
          "EmiID est accessible dans le monde entier, avec une priorité pour l'Afrique subsaharienne : Côte d'Ivoire, Sénégal, Bénin, Togo, Mali, Cameroun, Burkina Faso, Guinée, Gabon, Congo. Les membres de la diaspora en Europe et Amérique du Nord l'utilisent également pour collaborer avec des partenaires du continent.",
      },
    ],
  },
  {
    id: "profile",
    title: "Profil & Compte",
    icon: UserCircle2,
    faqs: [
      {
        question: "Comment créer mon profil EmiID ?",
        answer:
          "La création prend moins de 3 minutes :\n1. Identité — Nom, titre professionnel et photo de profil.\n2. Catégorie — Talent, Fondateur ou Entreprise.\n3. Histoire & Lien — Biographie synthétique et choix de votre lien (emiid.com/votrenom).\n4. Localisation & Métier — Ville, pays et tags de compétences pour être indexé dans l'annuaire.\n\nAucune carte bancaire n'est exigée à l'inscription.",
      },
      {
        question: "Comment fonctionne le lien court personnalisé ?",
        answer:
          "Avec la formule Gratuite, vous bénéficiez d'une URL directe. Avec le plan Pro (2 000 FCFA/mois), vous réservez votre pseudo exclusif (ex: emiid.com/amadou-traore). Ce lien est idéal pour vos cartes de visite, signatures d'email et bio WhatsApp.",
      },
      {
        question: "Comment obtenir le Badge Fondateur Numéroté ?",
        answer:
          "Le Badge Fondateur est strictement réservé aux 1 000 premiers inscrits (700 en Afrique, 300 à l'international) qui satisfont 4 critères :\n1. Être dans les 1 000 premiers inscrits horodatés.\n2. Profil complété à 80% minimum.\n3. Parrainer 3 confrères actifs sur la plateforme.\n4. Compte vérifié sous 48h.\n\nCe badge offre à vie la gratuité pendant 1 an sur le plan Pro (valeur 24 000 FCFA) et une priorité dans l'annuaire.",
      },
    ],
  },
  {
    id: "pricing",
    title: "Abonnements & Paiements",
    icon: CreditCard,
    faqs: [
      {
        question: "EmiID est-il gratuit ?",
        answer:
          "Oui, la version de base est gratuite et sans limitation de durée. Elle inclut votre profil certifiable, l'apparition dans l'annuaire et la messagerie directe.\n\nLe plan Pro à 2 000 FCFA/mois débloque le portfolio illimité, le lien personnalisé, les statistiques d'audience et le référencement prioritaire.",
      },
      {
        question: "Quels sont les moyens de paiement acceptés ?",
        answer:
          "Nous intégrons directement FedaPay pour les paiements locaux :\n• Wave (Côte d'Ivoire, Sénégal...)\n• MTN Mobile Money & Moov Money\n• Orange Money\n• Cartes Visa & Mastercard sécurisées\n\nTous les paiements sont libellés en FCFA sans frais de conversion bancaire.",
      },
      {
        question: "Puis-je annuler mon abonnement à tout moment ?",
        answer:
          "Absolument. Aucun engagement de durée : vous pouvez suspendre ou résilier votre abonnement Pro directement depuis vos paramètres de compte en un clic.",
      },
    ],
  },
  {
    id: "security",
    title: "Sécurité & Protection des Données",
    icon: ShieldCheck,
    faqs: [
      {
        question: "Mes données personnelles sont-elles protégées ?",
        answer:
          "Oui. EmiID utilise Supabase avec une politique stricte de Row-Level Security (RLS). Vos coordonnées sensibles peuvent être protégées par code PIN, et aucune donnée n'est cédée à des régies publicitaires.",
      },
      {
        question: "Comment fonctionne la médiation en cas de litige ?",
        answer:
          "Directement dans la messagerie, chaque membre peut cliquer sur « Demander une médiation ». Un modérateur EmiID intervient alors en tiers neutre pour clarifier la situation et assurer la traçabilité des engagements professionnels.",
      },
    ],
  },
];

export function FaqAccordion() {
  const [openKey, setOpenKey] = useState<string | null>("general-0");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggle = (key: string) => setOpenKey(openKey === key ? null : key);

  // Filtrage combiné recherche + catégorie
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => selectedCategory === "all" || cat.id === selectedCategory)
      .map((cat) => {
        if (!searchQuery.trim()) return cat;
        const q = searchQuery.toLowerCase();
        const filteredFaqs = cat.faqs.filter(
          (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
        );
        return { ...cat, faqs: filteredFaqs };
      })
      .filter((cat) => cat.faqs.length > 0);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      
      {/* Barre de recherche en direct */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une réponse (ex: Mobile Money, Badge Fondateur, Sécurité, Prix...)"
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-[#000616] border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#013ff4] shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            selectedCategory === "all"
              ? "bg-[#013ff4] text-white shadow-sm"
              : "bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.08]"
          }`}
        >
          Toutes ({categories.reduce((acc, c) => acc + c.faqs.length, 0)})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedCategory === cat.id
                ? "bg-[#013ff4] text-white shadow-sm"
                : "bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.08]"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Résultat vide */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12 px-6 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10">
          <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-900 dark:text-white">Aucune réponse ne correspond à votre recherche.</p>
          <p className="text-xs text-gray-500 mt-1">Essayez avec d&apos;autres mots-clés ou écrivez-nous directement.</p>
        </div>
      )}

      {/* Liste des catégories & questions */}
      {filteredCategories.map((cat) => {
        const Icon = cat.icon;
        return (
          <div key={cat.id} className="space-y-4">
            <div className="flex items-center gap-2.5 pt-2">
              <div className="p-1.5 rounded-lg bg-[#013ff4]/10 text-[#013ff4] dark:text-[#03b3f8]">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {cat.title}
              </h3>
              <div className="flex-1 h-px bg-gray-200/60 dark:bg-white/10 ml-2" />
            </div>

            <div className="space-y-2.5">
              {cat.faqs.map((faq, faqIdx) => {
                const key = `${cat.id}-${faqIdx}`;
                const isOpen = openKey === key;

                return (
                  <div
                    key={key}
                    className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                      isOpen
                        ? "bg-white dark:bg-[#000616] border-[#013ff4]/40 dark:border-[#03b3f8]/40 shadow-sm"
                        : "bg-white dark:bg-white/[0.02] border-gray-200/80 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                    }`}
                  >
                    <button
                      onClick={() => toggle(key)}
                      className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <span className={`text-sm sm:text-base font-bold leading-snug pr-4 ${isOpen ? "text-[#013ff4] dark:text-[#03b3f8]" : "text-gray-900 dark:text-white"}`}>
                        {faq.question}
                      </span>
                      <div className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-[#013ff4] dark:text-[#03b3f8] bg-[#013ff4]/10" : "text-gray-400"}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-5 sm:px-6 pb-5 text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line border-t border-gray-100 dark:border-white/5 pt-3">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bloc de contact */}
      <div className="text-center py-8 px-6 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/[0.01]">
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 font-medium">
          Vous avez une question spécifique ou un besoin d&apos;accompagnement ?
        </p>
        <a
          href="mailto:contact@emiid.com"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#013ff4] dark:text-[#03b3f8] hover:underline"
        >
          Écrire directement à notre équipe à contact@emiid.com →
        </a>
      </div>

    </div>
  );
}
