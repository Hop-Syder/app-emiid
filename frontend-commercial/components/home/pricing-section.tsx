/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section Tarifs Emiid - 4 Tiers + Offre Fondateur
 * @created 2026-06-13
 * @updated 2026-06-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Building2, Landmark, ArrowRight } from "lucide-react";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

const tiers = [
  {
    name: "Gratuit",
    id: "tier-free",
    icon: Star,
    priceMonthly: "0",
    priceLabel: "FCFA / mois",
    target: "Tout le monde",
    description: "L'essentiel pour commencer votre présence en ligne.",
    features: [
      "Profil public basique",
      "Visibilité dans l'annuaire",
      "3 tags d'expertise maximum"
    ],
    featured: false,
    color: "from-gray-400 to-gray-500",
    buttonText: "Créer un profil",
  },
  {
    name: "Pro",
    id: "tier-pro",
    icon: Crown,
    priceMonthly: "2 000",
    priceLabel: "FCFA / mois",
    target: "Freelancers, indépendants",
    description: "Un profil premium pour maximiser vos opportunités.",
    features: [
      "Profil public complet",
      "Portfolio intégré",
      "Tags d'expertise illimités",
      "Bouton de contact direct",
      "Badges de certification"
    ],
    featured: true,
    color: "from-indigo-500 to-cyan-400",
    buttonText: "Devenir Pro",
  },
  {
    name: "Entreprise",
    id: "tier-entreprise",
    icon: Building2,
    priceMonthly: "5 000",
    priceLabel: "FCFA / mois",
    target: "PME, startups, sociétés",
    description: "Outils avancés pour gérer votre structure.",
    features: [
      "Tout du plan Pro",
      "CRM intégré",
      "Gestion d'équipe",
      "Profil entreprise vérifié",
      "Visibilité renforcée"
    ],
    featured: false,
    color: "from-purple-500 to-pink-500",
    buttonText: "Passer en Entreprise",
  },
  {
    name: "Entreprise+",
    id: "tier-entreprise-plus",
    icon: Landmark,
    priceMonthly: "10 000",
    priceLabel: "FCFA / mois",
    target: "Grandes entreprises",
    description: "Pour les leaders (Sobeyra, MTN, banques...).",
    features: [
      "Tout du plan Entreprise",
      "Badge Entreprise exclusif",
      "Distribution de badges aux employés",
      "Support dédié prioritaire"
    ],
    featured: false,
    color: "from-amber-400 to-orange-500",
    buttonText: "Contacter les ventes",
  },
];

export function PricingSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section id="pricing" className="relative bg-white dark:bg-[#050505] py-24 sm:py-32 overflow-hidden border-t border-gray-100 dark:border-white/5">
      
      {/* Magic Spotlight */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99,102,241,0.03), transparent 40%)`
        }}
      />

      {/* Background ambient glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 z-10">
        
        <div className="mx-auto max-w-4xl text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-sm mb-4"
          >
            Tarification Transparente
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            Un investissement pour votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">croissance</span>
          </motion.p>
        </div>

        {/* Offre Fondateur Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-20 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className="relative bg-white/60 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-amber-500/30 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
            <div className="w-20 h-20 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Crown className="text-white w-10 h-10" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
                1 000 places seulement
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">L'Offre Fondateur</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Inscrivez-vous maintenant pour obtenir votre <strong className="text-amber-600 dark:text-amber-400">Badge Fondateur à vie</strong> et bénéficier de <strong className="text-amber-600 dark:text-amber-400">1 an de Plan Pro OFFERT</strong>.
              </p>
            </div>
            <div className="shrink-0 mt-4 sm:mt-0">
              <a 
                href={USER_APP_URL}
                className="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-orange-500/25 hover:scale-105 transition-all group/btn"
              >
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                />
                <span className="relative">Débloquer mon badge</span>
                <ArrowRight className="w-5 h-5 relative" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Pricing Grid - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex flex-col rounded-[2rem] p-8 xl:p-10 transition-all duration-500 ${
                  tier.featured
                    ? "bg-gray-900 dark:bg-white/[0.05] border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 md:-mt-8 md:mb-8"
                    : "bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                {/* Highlight Glow for Featured */}
                {tier.featured && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-t-[2rem]"></div>
                )}

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-black ${tier.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>
                      {tier.name}
                    </h3>
                    <p className={`text-xs font-semibold uppercase tracking-widest mt-1 ${tier.featured ? "text-indigo-400" : "text-gray-500"}`}>
                      {tier.target}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${tier.color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${tier.featured ? "text-white" : "text-gray-900 dark:text-white"}`} />
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-8 h-10 ${tier.featured ? "text-gray-300" : "text-gray-600 dark:text-gray-400"}`}>
                  {tier.description}
                </p>

                <div className="mb-8">
                  <span className={`text-4xl font-black tracking-tight ${tier.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {tier.priceMonthly}
                  </span>
                  {tier.priceMonthly !== "Sur devis" && (
                    <span className={`text-sm font-semibold ml-2 ${tier.featured ? "text-gray-400" : "text-gray-500"}`}>
                      {tier.priceLabel}
                    </span>
                  )}
                </div>

                <a
                  href={USER_APP_URL}
                  className={`mt-auto w-full py-4 px-6 rounded-xl text-center font-bold transition-all duration-300 relative overflow-hidden group/btn ${
                    tier.featured
                      ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02]"
                      : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20"
                  }`}
                >
                  {tier.featured && (
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    />
                  )}
                  <span className="relative">{tier.buttonText}</span>
                </a>

                <ul className="mt-8 space-y-4 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${tier.featured ? "bg-indigo-500/20" : "bg-gray-200 dark:bg-white/10"}`}>
                        <Check className={`w-3 h-3 ${tier.featured ? "text-indigo-400" : "text-gray-700 dark:text-gray-300"}`} />
                      </div>
                      <span className={`text-sm ${tier.featured ? "text-gray-200" : "text-gray-700 dark:text-gray-300"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
