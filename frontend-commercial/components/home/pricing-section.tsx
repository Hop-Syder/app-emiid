"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Building2, Landmark, ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

interface Feature {
  text: string;
  key?: boolean;
}

interface Tier {
  name: string;
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  perMonthLabel: string;
  target: string;
  description: string;
  cta: string;
  href: string;
  featured: boolean;
  badge?: string;
  color: string;
  features: Feature[];
}

const tiers: Tier[] = [
  {
    name: "Gratuit",
    id: "tier-free",
    icon: Star,
    priceMonthly: 0,
    priceAnnual: 0,
    currency: "FCFA",
    perMonthLabel: "Pour toujours",
    target: "Pour débuter",
    description: "Créez votre présence en ligne et faites-vous découvrir dans l'annuaire africain.",
    cta: "Créer un profil gratuit",
    href: `${USER_APP_URL}/creer-profil`,
    featured: false,
    color: "from-gray-400 to-gray-500",
    features: [
      { text: "Profil public personnalisé (photo, bio, localisation)" },
      { text: "Apparaître dans l'annuaire EmiID" },
      { text: "Jusqu'à 3 compétences affichées" },
      { text: "Messagerie EmiID (10 messages/jour)" },
      { text: "Badge « Membre Vérifié »" },
    ],
  },
  {
    name: "Pro",
    id: "tier-pro",
    icon: Crown,
    priceMonthly: 2000,
    priceAnnual: 1600,
    currency: "FCFA",
    perMonthLabel: "/ mois",
    target: "Freelancers & Indépendants",
    description: "Un profil premium qui génère des opportunités et crédibilise votre expertise.",
    cta: "Devenir Pro",
    href: `${USER_APP_URL}/creer-profil`,
    featured: true,
    badge: "Le plus populaire",
    color: "from-indigo-500 to-cyan-400",
    features: [
      { text: "Tout ce qui est dans Gratuit, plus :" },
      { text: "Portfolio visuel illimité (photos, projets, réalisations)", key: true },
      { text: "Compétences illimitées + validation par les pairs", key: true },
      { text: "Lien personnalisé : emiid.com/votrenom", key: true },
      { text: "Messagerie illimitée + envoi de fichiers" },
      { text: "Bouton de contact direct (WhatsApp, email, tél.)" },
      { text: "Statistiques de visibilité (vues, clics profil)" },
      { text: "Position prioritaire dans les résultats de recherche", key: true },
      { text: "Badge Pro distinctif sur votre profil" },
    ],
  },
  {
    name: "Entreprise",
    id: "tier-entreprise",
    icon: Building2,
    priceMonthly: 5000,
    priceAnnual: 4000,
    currency: "FCFA",
    perMonthLabel: "/ mois",
    target: "PME, Startups & Sociétés",
    description: "Gérez votre équipe et renforcez la visibilité de toute votre structure.",
    cta: "Passer en Entreprise",
    href: `${USER_APP_URL}/creer-profil`,
    featured: false,
    color: "from-purple-500 to-pink-500",
    features: [
      { text: "Tout ce qui est dans Pro, plus :" },
      { text: "Page entreprise officielle avec logo vérifié", key: true },
      { text: "Gestion d'équipe centralisée (jusqu'à 20 profils)" },
      { text: "Publication d'offres d'emploi & appels à projets", key: true },
      { text: "CRM léger intégré (contacts, notes, rappels)" },
      { text: "Tableau de bord analytique équipe" },
      { text: "Badge « Entreprise Certifiée » sur tous les profils membres" },
      { text: "Support prioritaire (réponse sous 24h)" },
    ],
  },
  {
    name: "Entreprise+",
    id: "tier-entreprise-plus",
    icon: Landmark,
    priceMonthly: 10000,
    priceAnnual: 8000,
    currency: "FCFA",
    perMonthLabel: "/ mois",
    target: "Grandes Entreprises & Groupes",
    description: "Solution sur mesure pour les leaders (MTN, banques, grandes institutions).",
    cta: "Contacter les ventes",
    href: `mailto:contact@emiid.com`,
    featured: false,
    color: "from-amber-400 to-orange-500",
    features: [
      { text: "Tout ce qui est dans Entreprise, plus :" },
      { text: "Profils illimités pour l'équipe et partenaires", key: true },
      { text: "Distribution de badges d'accréditation externe", key: true },
      { text: "Intégration API (connexion à vos RH, ERP, CRM)", key: true },
      { text: "Account manager dédié" },
      { text: "Rapport mensuel de visibilité personnalisé" },
      { text: "Accès anticipé aux nouvelles fonctionnalités" },
      { text: "Contrat SLA + facturation sur mesure" },
    ],
  },
];

function formatPrice(amount: number): string {
  if (amount === 0) return "0";
  return amount.toLocaleString("fr-FR").replace(",", " ");
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="relative bg-white dark:bg-[#050505] py-24 sm:py-32 overflow-hidden border-t border-gray-100 dark:border-white/5">

      {/* Ambient glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 z-10">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-xs mb-4"
          >
            Tarification transparente
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4"
          >
            Un investissement pour votre{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">croissance</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
          >
            Commencez gratuitement, évoluez à votre rythme. Aucun engagement, annulation à tout moment.
          </motion.p>
        </div>

        {/* Monthly / Annual toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
            Mensuel
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${isAnnual ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700"}`}
            aria-label="Basculer facturation annuelle"
          >
            <motion.span
              animate={{ x: isAnnual ? 28 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 left-0 w-5 h-5 rounded-full bg-white shadow-md"
            />
          </button>
          <span className={`text-sm font-semibold transition-colors ${isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
            Annuel
          </span>
          {isAnnual && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800"
            >
              <Zap className="w-3 h-3" />
              Économisez 20%
            </motion.span>
          )}
        </motion.div>

        {/* Offre Fondateur Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-20 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[2rem] blur opacity-20 group-hover:opacity-35 transition-opacity duration-500" />
          <div className="relative bg-white/70 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-amber-500/30 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Crown className="text-white w-8 h-8" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
                <Sparkles className="w-3 h-3" />
                Offre de lancement · 1 000 places seulement
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">L'Offre Fondateur</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-lg">
                Inscrivez-vous maintenant parmi les 1 000 premiers et obtenez votre{" "}
                <strong className="text-amber-600 dark:text-amber-400">Badge Fondateur Numéroté à vie</strong> +
                <strong className="text-amber-600 dark:text-amber-400"> 1 an de Plan Pro OFFERT</strong>.
                Valeur totale : 24 000 FCFA. <span className="text-gray-500 dark:text-gray-400 font-semibold">Aucune carte requise.</span>
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href={USER_APP_URL}
                className="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all group/btn whitespace-nowrap"
              >
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                />
                <span className="relative">Débloquer mon badge</span>
                <ArrowRight className="w-4 h-4 relative" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const price = isAnnual ? tier.priceAnnual : tier.priceMonthly;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className={`relative flex flex-col rounded-[2rem] overflow-hidden transition-all duration-500 ${
                  tier.featured
                    ? "bg-gray-900 dark:bg-[#0d0d1a] border border-indigo-500/60 shadow-2xl shadow-indigo-500/20 md:-mt-8 md:mb-8 z-10"
                    : "bg-white/60 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-xl"
                }`}
              >
                {/* Featured top gradient bar */}
                {tier.featured && (
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                )}

                {/* Popular badge */}
                {tier.badge && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-xs font-black rounded-b-xl shadow-lg whitespace-nowrap tracking-wide">
                    <Sparkles className="w-3 h-3" />
                    {tier.badge}
                  </div>
                )}

                <div className="p-8 xl:p-9 flex flex-col flex-1">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 mt-3">
                    <div>
                      <h3 className={`text-xl font-black ${tier.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>
                        {tier.name}
                      </h3>
                      <p className={`text-xs font-semibold uppercase tracking-widest mt-1 ${tier.featured ? "text-indigo-400" : "text-gray-500 dark:text-gray-500"}`}>
                        {tier.target}
                      </p>
                    </div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${tier.color} p-0.5`}>
                      <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${tier.featured ? "bg-gray-800" : "bg-white dark:bg-gray-950"}`}>
                        <Icon className={`w-5 h-5 ${tier.featured ? "text-indigo-400" : "text-gray-700 dark:text-gray-300"}`} />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-6 ${tier.featured ? "text-gray-300" : "text-gray-500 dark:text-gray-400"}`}>
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-2">
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-black tracking-tight ${tier.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>
                        {formatPrice(price)}
                      </span>
                      {tier.priceMonthly > 0 && (
                        <span className={`text-sm font-semibold pb-1 ${tier.featured ? "text-gray-400" : "text-gray-400"}`}>
                          {tier.currency}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-medium mt-0.5 ${tier.featured ? "text-gray-500" : "text-gray-400"}`}>
                      {tier.priceMonthly === 0 ? "FCFA · " : ""}{tier.perMonthLabel}
                      {isAnnual && tier.priceMonthly > 0 && (
                        <span className="ml-1.5 text-emerald-500 font-bold">· –20%</span>
                      )}
                    </p>
                  </div>

                  {/* Annual total */}
                  {isAnnual && tier.priceAnnual > 0 && (
                    <p className={`text-xs mb-5 ${tier.featured ? "text-gray-500" : "text-gray-400"}`}>
                      soit{" "}
                      <strong className={tier.featured ? "text-gray-300" : "text-gray-600 dark:text-gray-300"}>
                        {formatPrice(tier.priceAnnual * 12)} FCFA/an
                      </strong>
                    </p>
                  )}

                  {/* CTA Button */}
                  <Link
                    href={tier.href}
                    className={`mt-4 mb-6 w-full py-3.5 px-6 rounded-2xl text-center font-bold text-sm transition-all duration-300 relative overflow-hidden group/btn flex items-center justify-center gap-2 ${
                      tier.featured
                        ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02]"
                        : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20"
                    }`}
                  >
                    {tier.featured && (
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      />
                    )}
                    <span className="relative">{tier.cta}</span>
                    <ArrowRight className="w-4 h-4 relative group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>

                  {/* Features list */}
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feature, i) => {
                      const isHeader = feature.text.endsWith(", plus :") || feature.text.endsWith(", plus :") || feature.text.includes(", plus :");
                      if (isHeader) {
                        return (
                          <li key={i} className={`text-xs font-bold uppercase tracking-widest pt-1 ${tier.featured ? "text-gray-500" : "text-gray-400 dark:text-gray-600"}`}>
                            {feature.text}
                          </li>
                        );
                      }
                      return (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                            feature.key
                              ? tier.featured ? "bg-indigo-500/30" : "bg-indigo-100 dark:bg-indigo-900/40"
                              : tier.featured ? "bg-white/10" : "bg-gray-100 dark:bg-white/8"
                          }`}>
                            <Check className={`w-2.5 h-2.5 ${
                              feature.key
                                ? tier.featured ? "text-indigo-300" : "text-indigo-500 dark:text-indigo-400"
                                : tier.featured ? "text-gray-400" : "text-gray-500 dark:text-gray-400"
                            }`} />
                          </div>
                          <span className={`text-sm leading-snug ${
                            feature.key
                              ? tier.featured ? "text-gray-100 font-semibold" : "text-gray-800 dark:text-gray-200 font-semibold"
                              : tier.featured ? "text-gray-300" : "text-gray-600 dark:text-gray-400"
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Fine print */}
                  <p className={`text-[10px] text-center mt-6 ${tier.featured ? "text-gray-600" : "text-gray-300 dark:text-gray-700"}`}>
                    {tier.priceMonthly === 0 ? "Aucune carte bancaire requise" : "Annulation possible à tout moment"}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom trust row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500"
        >
          {[
            "Paiement Mobile Money accepté (Wave, Orange Money, MTN MoMo)",
            "Facturation sécurisée via FedaPay",
            "Aucun frais cachés",
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              {item}
            </span>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
