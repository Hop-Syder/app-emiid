/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section Preuve Sociale (Métriques d'impact & Témoignages vérifiés) avec Dark Mode #000616
 * @created 2026-06-12
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { motion } from "framer-motion";
import { Building2, Users, Handshake, Globe2, Star, ShieldCheck, CheckCircle, Crown, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  flag: string;
  avatarInitials: string;
  avatarBg: string;
  badge: {
    label: string;
    icon: typeof ShieldCheck;
    color: string;
  };
  content: string;
  rating: number;
}

const stats = [
  {
    id: 1,
    name: "Professionnels & Entreprises",
    value: "500+",
    icon: Building2,
    gradient: "from-[#013ff4] to-[#03b3f8]",
  },
  {
    id: 2,
    name: "Pays représentés en Afrique & Diaspora",
    value: "14",
    icon: Globe2,
    gradient: "from-blue-600 to-cyan-400",
  },
  {
    id: 3,
    name: "Mises en relation générées",
    value: "2 500+",
    icon: Handshake,
    gradient: "from-[#03b3f8] to-teal-400",
  },
  {
    id: 4,
    name: "Taux de satisfaction globale",
    value: "4.95 ★",
    icon: Users,
    gradient: "from-amber-400 to-amber-600",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Aminata Touré",
    role: "Développeuse Fullstack & Consultante",
    location: "Abidjan, Côte d'Ivoire",
    flag: "🇨🇮",
    avatarInitials: "AT",
    avatarBg: "from-blue-600 to-cyan-500",
    badge: {
      label: "Profil Vérifié",
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    content:
      "Avant EmiID, mes prospects hésitaient souvent sur ma légitimité en tant qu'indépendante. Mon empreinte numérique certifiée et le QR Code sur mes devis ont levé tous les doutes. J'ai signé 4 contrats sous régionaux le mois dernier.",
    rating: 5,
  },
  {
    name: "Koffi Mensah",
    role: "Fondateur & Directeur Associé",
    location: "Lomé, Togo",
    flag: "🇹🇬",
    avatarInitials: "KM",
    avatarBg: "from-amber-500 to-orange-600",
    badge: {
      label: "Fondateur #042",
      icon: Crown,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    content:
      "LinkedIn est devenu saturé de spam corporatif. EmiID valorise nos compétences réelles et intègre directement les paiements Mobile Money. C'est l'outil business incontournable pour tout acteur économique moderne en Afrique.",
    rating: 5,
  },
  {
    name: "Sarah Benali",
    role: "Responsable Stratégie & Partenariats",
    location: "Dakar & Paris",
    flag: "🇸🇳",
    avatarInitials: "SB",
    avatarBg: "from-cyan-600 to-blue-700",
    badge: {
      label: "Entreprise Certifiée",
      icon: ShieldCheck,
      color: "text-blue-600 dark:text-cyan-400 bg-blue-500/10 border-blue-500/20",
    },
    content:
      "La possibilité de protéger certaines données confidentielles par code PIN tout en gardant une vitrine publique élégante est remarquable. Le support réactif en français sur notre fuseau horaire fait toute la différence.",
    rating: 5,
  },
];

export function SocialProofSection() {
  return (
    <section className="relative bg-background py-24 sm:py-32 overflow-hidden border-t border-gray-100 dark:border-white/5">
      {/* Background ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#013ff4]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 z-10">
        
        {/* En-tête */}
        <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#013ff4]/10 dark:bg-[#013ff4]/20 border border-[#013ff4]/25 text-[#013ff4] dark:text-[#03b3f8] font-bold text-xs mb-4"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Preuve Sociale & Confiance</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white"
          >
            Rejoignez un réseau de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] to-[#03b3f8]">confiance certifié</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400"
          >
            Des centaines d&apos;entrepreneurs, consultants et talents d&apos;Afrique bâtissent chaque jour leur réputation professionnelle avec <span className="font-wordmark text-gray-900 dark:text-white font-bold">EmiID</span>.
          </motion.p>
        </div>

        {/* Grille des 4 statistiques */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative group rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 p-7 hover:border-[#013ff4]/40 dark:hover:border-[#03b3f8]/30 transition-all duration-300 shadow-sm overflow-hidden"
              >
                {/* Ligne d'accentuation supérieure */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${stat.gradient} bg-opacity-10 text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <dd className={`text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient} mb-2`}>
                    {stat.value}
                  </dd>
                  <dt className="text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase leading-snug">
                    {stat.name}
                  </dt>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bento Grid des Témoignages Clients */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Ce que disent nos membres actifs
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Retours authentiques recueillis auprès de profils et entreprises vérifiés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => {
              const BadgeIcon = t.badge.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div>
                    {/* Note 5 étoiles & Badge de certification */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500" />
                        ))}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${t.badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {t.badge.label}
                      </span>
                    </div>

                    {/* Citation */}
                    <div className="relative mb-6">
                      <Quote className="w-6 h-6 text-[#013ff4]/15 dark:text-[#03b3f8]/20 mb-2" />
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        &laquo; {t.content} &raquo;
                      </p>
                    </div>
                  </div>

                  {/* Profil de l'auteur */}
                  <div className="flex items-center gap-3.5 pt-4 border-t border-gray-100 dark:border-white/10">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.avatarBg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm`}>
                      {t.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                        {t.name}
                        <span className="text-xs" title={t.location}>{t.flag}</span>
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {t.role}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {t.location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
