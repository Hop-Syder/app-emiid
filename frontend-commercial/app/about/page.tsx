/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page À propos (Vision, Fondateur, Valeurs & Recrutement) avec Dark Mode #000616
 * @created 2026-06-13
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Lightbulb, Users, Rocket, Globe2, ArrowRight, Linkedin, Twitter, CheckCircle2, ShieldCheck, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

const founder = {
  name: "Daouda Abassi Ismael Christian",
  handle: "@hopsyder",
  role: "Fondateur & CEO",
  bio: "Entrepreneur tech et bâtisseur d'écosystèmes numériques en Afrique. Fondateur de Nexus Partners. Obsédé par la création d'infrastructures souveraines, durables et à haute valeur ajoutée permettant aux talents du continent d'accéder aux marchés mondiaux.",
  initials: "DC",
  image: "/ceo.jpg",
  links: {
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    website: "https://ceo.nexuspartners.xyz",
  },
};

const openRoles = [
  {
    role: "Lead Fullstack Engineer",
    type: "CDI / Partenariat",
    location: "Cotonou / Remote Afrique",
    description: "Next.js 15, TypeScript, Supabase, architectures distribuées et sécurité RLS.",
  },
  {
    role: "Head of Growth & Partenariats",
    type: "Plein temps",
    location: "Abidjan / Dakar / Remote",
    description: "Expansion écosystèmes PME, partenariats institutionnels et adoption Mobile Money.",
  },
  {
    role: "Product & Brand Designer",
    type: "Freelance ou CDI",
    location: "Remote Afrique & Diaspora",
    description: "Design system mobile-first, micro-interactions, ergonomie adaptée aux réseaux 3G.",
  },
];

const values = [
  {
    icon: Globe2,
    title: "Africanité Souveraine",
    description: "Chaque choix d'architecture respecte les réalités locales : connectivité frugale, Mobile Money natif, tarification en FCFA et support local.",
    gradient: "from-[#013ff4] to-[#03b3f8]",
  },
  {
    icon: ShieldCheck,
    title: "Confiance & Traçabilité",
    description: "La réputation ne doit pas dépendre d'un algorithme opaque, mais de validations réelles par les pairs et d'une vérification d'identité infalsifiable.",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: Lightbulb,
    title: "Inclusion Radicale",
    description: "Un artisan ferronnier d'art ou un couturier d'Abidjan a autant droit à une empreinte numérique prestigieuse qu'un ingénieur IA de Paris ou Dakar.",
    gradient: "from-amber-400 to-amber-600",
  },
];

const roadmap = [
  { quarter: "Q2 2026", label: "Lancement public & Mur des Fondateurs", done: true, description: "Profils certifiables, annuaire public, messagerie directe, intégration FedaPay." },
  { quarter: "Q3 2026", label: "Application Mobile Native", done: false, description: "Expérience ultra-rapide iOS & Android avec notifications push et mode hors-ligne." },
  { quarter: "Q4 2026", label: "Pages Entreprises & Multi-comptes", done: false, description: "Gestion d'équipes, annuaires corporate et publication de missions B2B." },
  { quarter: "Q1 2027", label: "Matchmaking Intelligent & IA", done: false, description: "Recommandation d'opportunités d'affaires basée sur la complémentarité des expertises." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden py-24 sm:py-32">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[1000px] h-[600px] bg-[#013ff4]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[#03b3f8]/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 relative z-10">

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 sm:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#013ff4]/10 dark:bg-[#013ff4]/20 border border-[#013ff4]/25 text-[#013ff4] dark:text-[#03b3f8] text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Notre Mission & Engagement</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-6"
          >
            Bâtir l&apos;empreinte numérique du{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] to-[#03b3f8]">
              professionnel africain
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            <span className="font-wordmark font-bold text-gray-900 dark:text-white">EmiID</span> est né d&apos;un constat sans appel : les talents et entreprises d&apos;Afrique méritent une vitrine crédible, certifiée et connectée aux réalités de leur marché.
          </motion.p>

          {/* 3 Métriques clés */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12"
          >
            {[
              { value: "2026", label: "Lancement Officiel", icon: Rocket, color: "from-[#013ff4] to-[#03b3f8]" },
              { value: "500+", label: "Membres Vérifiés", icon: Users, color: "from-blue-600 to-cyan-400" },
              { value: "14+", label: "Pays Couverts", icon: Globe2, color: "from-[#03b3f8] to-teal-400" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 shadow-sm text-center"
              >
                <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-r ${stat.color} text-white flex items-center justify-center mb-3 shadow-sm`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Genèse & Vision */}
        <section className="py-16 sm:py-24 border-t border-gray-100 dark:border-white/5">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#013ff4]/10 text-[#013ff4] dark:text-[#03b3f8] text-xs font-bold uppercase tracking-wider">
                <Target className="w-4 h-4" /> La Genèse
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Une infrastructure conçue par et pour l&apos;Afrique
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Pendant trop longtemps, les indépendants, créateurs et entreprises du continent ont dû se contenter de plateformes occidentales inaccessibles, facturées en dollars sans intégration Mobile Money, ou d&apos;échanges informels non vérifiés sur WhatsApp.
              </p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Incubé chez <strong>Nexus Partners</strong>, EmiID offre la réponse : une identité numérique vérifiée, infalsifiable, consultable via un lien court ou un QR Code officiel, protégée par des normes de sécurité rigoureuses et accessible à tous les budgets.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#000616] border border-gray-200/80 dark:border-white/10 shadow-xl relative">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#013ff4]/10 text-[#013ff4] dark:text-[#03b3f8] flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </span>
                Les 4 piliers EmiID
              </h3>
              <ul className="space-y-4">
                {[
                  "Certification d'identité réelle anti-usurpation",
                  "Paiement Mobile Money natif en FCFA (Wave, MTN, Orange, Moov)",
                  "Vitrine ultra-rapide optimisée pour les débits mobiles 3G/4G",
                  "Protection des coordonnées confidentielles par code PIN",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Nos Valeurs */}
        <section className="py-16 sm:py-24 border-t border-gray-100 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              Ce qui nous guide
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Des principes inébranlables pour créer un produit d&apos;utilité publique à fort impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${v.gradient} text-white flex items-center justify-center mb-6 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{v.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Le Fondateur (Spotlight CEO Nexus Partners) */}
        <section className="py-16 sm:py-24 border-t border-gray-100 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#013ff4]/10 text-[#013ff4] dark:text-[#03b3f8] text-xs font-bold uppercase tracking-wider mb-4">
              <Users className="w-4 h-4" /> Leadership
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              À la barre du projet
            </h2>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-[#000616] border border-gray-200/80 dark:border-white/10 p-8 sm:p-12 shadow-xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Photo ou initiales */}
              <div className="relative shrink-0">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-lg border-2 border-[#013ff4]/20 relative">
                  {founder.image ? (
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 144px, 176px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#013ff4] to-[#03b3f8] flex items-center justify-center text-white font-black text-4xl">
                      {founder.initials}
                    </div>
                  )}
                </div>
              </div>

              {/* Infos */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {founder.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#013ff4]/10 text-[#013ff4] dark:text-[#03b3f8] text-xs font-bold">
                    {founder.role}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#013ff4] dark:text-[#03b3f8] uppercase tracking-wider mb-4">
                  Nexus Partners · {founder.handle}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {founder.bio}
                </p>

                <div className="flex items-center justify-center md:justify-start gap-3">
                  <a
                    href={founder.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-xs font-bold text-gray-800 dark:text-white transition-colors"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>ceo.nexuspartners.xyz</span>
                  </a>
                  <a
                    href="mailto:daoudaabassichristian@gmail.com"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#013ff4]/10 text-[#013ff4] dark:text-[#03b3f8] hover:bg-[#013ff4]/20 text-xs font-bold transition-colors"
                  >
                    <span>Contacter le CEO</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nous Recrutons / Rejoindre l'aventure */}
        <section className="py-16 sm:py-24 border-t border-gray-100 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Briefcase className="w-4 h-4" /> Talents recherchés
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              Rejoindre l&apos;aventure EmiID
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Nous réunissons les meilleurs bâtisseurs pour accélérer la révolution de l&apos;identité professionnelle africaine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
            {openRoles.map((role, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                      {role.type}
                    </span>
                    <span className="text-[11px] text-gray-500">{role.location}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{role.role}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{role.description}</p>
                </div>

                <a
                  href={`mailto:contact@emiid.com?subject=Candidature - ${encodeURIComponent(role.role)}`}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-[#013ff4] hover:text-white dark:hover:bg-[#013ff4] text-xs font-bold transition-all text-gray-800 dark:text-white"
                >
                  <span>Postuler pour ce rôle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="py-16 sm:py-24 border-t border-gray-100 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              Feuille de Route
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Nos étapes de déploiement pour les prochains trimestres.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {roadmap.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 shadow-sm"
              >
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.done ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400"
                }`}>
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-2 h-2 rounded-full bg-gray-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-[#013ff4] dark:text-[#03b3f8] uppercase tracking-wider">
                      {step.quarter}
                    </span>
                    {step.done && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Opérationnel
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{step.label}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
