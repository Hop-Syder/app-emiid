/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section Tarification (Gratuit, Pro, Entreprise, Entreprise+) avec Dark Mode #000616 et tokens EmiID
 * @created 2026-06-12
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Building2, Landmark, ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
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
  comingSoon?: boolean;
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
    description: "Créez votre empreinte en ligne et faites-vous découvrir dans l'annuaire africain.",
    cta: "Créer un profil gratuit",
    href: `${USER_APP_URL}/creer-profil`,
    featured: false,
    color: "from-gray-400 to-gray-500",
    features: [
      { text: "Profil public certifiable (bio, photo, coordonnées)" },
      { text: "Référencement dans l'annuaire ouvert EmiID" },
      { text: "Jusqu'à 3 compétences clés affichées" },
      { text: "Messagerie directe sécurisée (10 msg/jour)" },
      { text: "Badge de base « Membre Vérifié »" },
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
    target: "Freelances & Indépendants",
    description: "Un profil premium qui convertit vos visiteurs en clients et certifie votre expertise.",
    cta: "Passer au Plan Pro",
    href: `${USER_APP_URL}/creer-profil`,
    featured: true,
    badge: "Le plus populaire",
    color: "from-[#013ff4] to-[#03b3f8]",
    features: [
      { text: "Tout ce qui est dans Gratuit, plus :" },
      { text: "Portfolio visuel illimité (projets & réalisations)", key: true },
      { text: "Compétences illimitées + validation par les pairs", key: true },
      { text: "Lien court direct : emiid.com/votrenom", key: true },
      { text: "Messagerie illimitée & échange de documents" },
      { text: "Bouton WhatsApp direct & coordonnées complètes" },
      { text: "Statistiques d'audience (visites, clics, recherches)" },
      { text: "Top 5% prioritaire dans les résultats de l'annuaire", key: true },
      { text: "Badge Pro distinctif avec lueur dorée" },
    ],
  },
  {
    name: "Entreprise",
    id: "tier-entreprise",
    comingSoon: true,
    icon: Building2,
    priceMonthly: 5000,
    priceAnnual: 4000,
    currency: "FCFA",
    perMonthLabel: "/ mois",
    target: "PME, Startups & Agences",
    description: "Gérez votre équipe et mutualisez la réputation de tous vos collaborateurs.",
    cta: "Rejoindre la liste d'attente",
    href: `${USER_APP_URL}/creer-profil`,
    featured: false,
    color: "from-blue-600 to-indigo-600",
    features: [
      { text: "Tout ce qui est dans Pro, plus :" },
      { text: "Page Entreprise officielle avec logo vérifié", key: true },
      { text: "Gestion multi-comptes (jusqu'à 20 profils membres)" },
      { text: "Publication d'offres d'emploi & missions", key: true },
      { text: "CRM léger de contacts et prospects qualifiés" },
      { text: "Tableau de bord d'impact d'équipe" },
      { text: "Badge « Entreprise Enregistrée »" },
      { text: "Support prioritaire par WhatsApp dédié" },
    ],
  },
  {
    name: "Entreprise+",
    id: "tier-entreprise-plus",
    comingSoon: true,
    icon: Landmark,
    priceMonthly: 10000,
    priceAnnual: 8000,
    currency: "FCFA",
    perMonthLabel: "/ mois",
    target: "Grands Groupes & Institutions",
    description: "Solution sur mesure pour les opérateurs, banques et fédérations professionnelles.",
    cta: "Contacter l'équipe",
    href: `mailto:contact@emiid.com`,
    featured: false,
    color: "from-amber-500 to-orange-600",
    features: [
      { text: "Tout ce qui est dans Entreprise, plus :" },
      { text: "Nombre de profils et filiales illimité", key: true },
      { text: "Émission de badges d'accréditation certifiés", key: true },
      { text: "Intégration API (SIRH, annuaires internes)", key: true },
      { text: "Account manager dédié basé en Afrique" },
      { text: "Rapport d'audit de réputation mensuel" },
      { text: "Contrat SLA d'engagement de service 99.9%" },
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
    <section id="pricing" className="relative bg-background py-24 sm:py-32 overflow-hidden border-t border-gray-100 dark:border-white/5">
      {/* Ambient glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#013ff4]/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#03b3f8]/8 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 z-10">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#013ff4]/10 dark:bg-[#013ff4]/20 border border-[#013ff4]/25 text-[#013ff4] dark:text-[#03b3f8] font-bold text-xs mb-4"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Tarification Directe en FCFA</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4"
          >
            Un investissement direct pour votre{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] to-[#03b3f8]">visibilité</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto"
          >
            Commencez gratuitement, accélérez quand vous le souhaitez. Zéro engagement, résiliation en 1 clic.
          </motion.p>
        </div>

        {/* Sélecteur Mensuel / Annuel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-3.5 mb-14"
        >
          <span className={`text-sm font-bold transition-colors ${!isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
            Facturation Mensuelle
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
              isAnnual ? "bg-[#013ff4]" : "bg-gray-300 dark:bg-white/20"
            }`}
            aria-label="Basculer vers la facturation annuelle"
          >
            <motion.span
              animate={{ x: isAnnual ? 28 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 left-0 w-5 h-5 rounded-full bg-white shadow-md"
            />
          </button>
          <span className={`text-sm font-bold transition-colors ${isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
            Facturation Annuelle
          </span>
          {isAnnual && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20"
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
          className="max-w-4xl mx-auto mb-16 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative bg-white dark:bg-[#000616] border border-amber-500/30 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 text-white">
              <Crown className="w-7 h-7" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                Cercle Fondateurs · 1 000 places uniques
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Offre de Lancement Fondateur</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Inscrivez-vous maintenant pour obtenir votre <strong className="text-amber-600 dark:text-amber-400">Badge Fondateur Numéroté à vie</strong> + <strong className="text-amber-600 dark:text-amber-400">1 an de Plan Pro gratuit</strong> (valeur 24 000 FCFA). <span className="font-semibold text-gray-500 dark:text-gray-400">Aucune carte bancaire requise.</span>
              </p>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href={`${USER_APP_URL}/creer-profil`}
                className="relative overflow-hidden inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-amber-500/25 hover:scale-[1.02] transition-all"
              >
                <span>Débloquer mon badge</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Grille des Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const price = isAnnual ? tier.priceAnnual : tier.priceMonthly;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`relative flex flex-col rounded-[2rem] overflow-hidden transition-all duration-300 ${
                  tier.featured
                    ? "bg-white dark:bg-[#000616] border-2 border-[#013ff4] dark:border-[#03b3f8] shadow-xl shadow-[#013ff4]/10 lg:-mt-4 lg:mb-4 z-10"
                    : "bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm"
                }`}
              >
                {/* Ligne accentuation supérieure pour le plan Pro */}
                {tier.featured && (
                  <div className="h-1.5 bg-gradient-to-r from-[#013ff4] to-[#03b3f8] shadow-[0_0_12px_rgba(1,63,244,0.6)]" />
                )}

                {/* Badge populaire */}
                {tier.badge && (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-[#013ff4] to-[#03b3f8] text-white text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    {tier.badge}
                  </div>
                )}

                <div className="p-7 xl:p-8 flex flex-col flex-1">

                  {/* Header carte */}
                  <div className="flex items-start justify-between mb-4 mt-2">
                    <div>
                      {tier.comingSoon && (
                        <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                          Bientôt disponible
                        </div>
                      )}
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
                        {tier.name}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-wider mt-1 text-[#013ff4] dark:text-[#03b3f8]">
                        {tier.target}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${tier.color} text-white shadow-sm shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm leading-relaxed mb-6 text-gray-600 dark:text-gray-400 min-h-[40px]">
                    {tier.description}
                  </p>

                  {/* Prix */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                        {formatPrice(price)}
                      </span>
                      {tier.priceMonthly > 0 && (
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {tier.currency}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                      {tier.priceMonthly === 0 ? "FCFA · " : ""}{tier.perMonthLabel}
                      {isAnnual && tier.priceMonthly > 0 && (
                        <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-bold">· Économie 20%</span>
                      )}
                    </p>
                  </div>

                  {/* Total annuel */}
                  {isAnnual && tier.priceAnnual > 0 && (
                    <p className="text-[11px] mb-4 text-gray-500 dark:text-gray-400">
                      Soit <strong className="text-gray-900 dark:text-white">{formatPrice(tier.priceAnnual * 12)} FCFA</strong> facturés par an
                    </p>
                  )}

                  {/* Bouton d'action */}
                  <Link
                    href={tier.href}
                    className={`mt-4 mb-6 w-full py-3 px-5 rounded-xl text-center font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      tier.featured
                        ? "bg-gradient-to-r from-[#013ff4] to-[#03b3f8] text-white hover:shadow-lg hover:shadow-[#013ff4]/25 hover:scale-[1.01]"
                        : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/15"
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Liste des fonctionnalités */}
                  <ul className="space-y-3 flex-1 border-t border-gray-100 dark:border-white/10 pt-4">
                    {tier.features.map((feature, i) => {
                      const isHeader = feature.text.includes(", plus :");
                      if (isHeader) {
                        return (
                          <li key={i} className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-1">
                            {feature.text}
                          </li>
                        );
                      }
                      return (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                            feature.key
                              ? "bg-[#013ff4]/10 dark:bg-[#03b3f8]/20 text-[#013ff4] dark:text-[#03b3f8]"
                              : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                          }`}>
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className={`text-xs leading-snug ${
                            feature.key
                              ? "text-gray-900 dark:text-white font-bold"
                              : "text-gray-600 dark:text-gray-400"
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Mention bas de carte */}
                  <p className="text-[10px] text-center mt-6 text-gray-400 dark:text-gray-600">
                    {tier.priceMonthly === 0 ? "Aucune carte bancaire requise" : "Paiement Mobile Money ou CB"}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Badges de confiance bas de section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-500 dark:text-gray-400"
        >
          {[
            "Paiement Mobile Money accepté (Wave, MTN MoMo, Moov, Orange Money)",
            "Sécurité de transaction 256-bit par FedaPay",
            "Tarification transparente sans frais cachés",
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
