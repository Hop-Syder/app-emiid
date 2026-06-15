"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Target, Lightbulb, Users, Rocket, Globe2, ArrowRight, Linkedin, Twitter, Github, ChevronRight, CheckCircle2, Trophy, Eye, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

const team = [
  {
    name: "Daouda Abassi Christian",
    role: "CEO & Co-fondateur",
    bio: "Entrepreneur tech passionné par l'Afrique numérique. Fondateur de Nexus Partners. Vision : faire d'Emiid la référence du profil professionnel africain.",
    initials: "DC",
    gradient: "from-indigo-500 to-purple-600",
    links: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      website: "https://ceo.nexus-partners.xyz",
    },
  },
  {
    name: "Votre nom ici",
    role: "CTO & Co-fondateur",
    bio: "Architecture backend, scalabilité et sécurité. Passionné par les systèmes distribués et les produits qui tiennent sous charge.",
    initials: "??",
    gradient: "from-cyan-500 to-blue-600",
    links: {},
    placeholder: true,
  },
  {
    name: "Votre nom ici",
    role: "Lead Design & Produit",
    bio: "UX centré utilisateur, design system et expérience mobile-first. Conçoit des interfaces qui parlent à l'Afrique.",
    initials: "??",
    gradient: "from-pink-500 to-rose-600",
    links: {},
    placeholder: true,
  },
  {
    name: "Votre nom ici",
    role: "Business Development",
    bio: "Partenariats, croissance et développement commercial. Ouvre les portes des écosystèmes francophones.",
    initials: "??",
    gradient: "from-amber-500 to-orange-600",
    links: {},
    placeholder: true,
  },
];

const values = [
  {
    icon: Globe2,
    title: "Africanité d'abord",
    description: "Chaque décision produit tient compte des réalités locales : connexion instable, paiement Mobile Money, diversité des langues et des cultures.",
    color: "from-indigo-500 to-purple-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400"
  },
  {
    icon: Users,
    title: "Communauté avant tout",
    description: "Emiid n'est pas un outil. C'est un écosystème vivant où la confiance se construit par les pairs, pas par les algorithmes.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400"
  },
  {
    icon: Lightbulb,
    title: "Accessibilité radicale",
    description: "Un artisan de Bouaké doit pouvoir créer un profil aussi crédible qu'un développeur de Dakar. L'excellence n'a pas de code postal.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400"
  },
];

const roadmap = [
  { quarter: "Q2 2026", label: "Lancement public", done: true, description: "Profils, annuaire, messagerie, offre Fondateur." },
  { quarter: "Q3 2026", label: "Application mobile", done: false, description: "iOS & Android — expérience native optimisée pour l'Afrique." },
  { quarter: "Q4 2026", label: "Plans Entreprise", done: false, description: "Pages entreprise vérifiées, gestion d'équipe et CRM." },
  { quarter: "Q1 2027", label: "Matchmaking IA", done: false, description: "Suggestions intelligentes de connexions et d'opportunités." },
  { quarter: "Q2 2027", label: "Paiements intégrés", done: false, description: "Facturation entre membres et contrats sécurisés on-platform." },
];

export default function AboutPage() {
  const containerRef = useRef(null);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#fafafa] dark:bg-[#050505] overflow-hidden selection:bg-indigo-500/30">

      {/* ── Background Elements ── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center">
        <div className="absolute top-[-20%] w-[1000px] h-[600px] rounded-full bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent blur-[100px] opacity-50 dark:opacity-20 animate-pulse-slow" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-24 sm:pt-48 sm:pb-32 z-10 border-b border-gray-200/50 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-gray-200 shadow-sm mb-8 hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-default">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Notre vision pour l'Afrique</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white mb-8"
          >
            Façonner l&apos;avenir du<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              professionnel africain
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-16"
          >
            Emiid est né d&apos;un constat simple : l&apos;Afrique regorge de talents extraordinaires, mais leur visibilité reste trop souvent confinée à des cercles restreints. Nous construisons l&apos;infrastructure qui change ça.
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
          >
            {[
              { value: "2026", label: "Lancement", icon: Rocket, color: "text-indigo-500", bg: "bg-indigo-500/10" },
              { value: "500+", label: "Profils vérifiés", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
              { value: "12+", label: "Pays", icon: Globe2, color: "text-cyan-500", bg: "bg-cyan-500/10" },
            ].map((stat, i) => (
              <div key={i} className="group relative p-8 rounded-3xl bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl border border-gray-200/50 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/[0.04] transition-all duration-300 overflow-hidden text-left shadow-sm">
                <div className={`absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${stat.bg}`} />
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">{stat.value}</p>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Histoire & Défis ── */}
      <section className="relative py-24 sm:py-32 z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-bold uppercase tracking-widest border border-rose-100 dark:border-rose-500/20">
                <Target className="w-4 h-4" /> Genèse
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                Une solution née d'une <span className="text-transparent bg-clip-text bg-gradient-to-br from-rose-500 to-orange-500">frustration</span>.
              </h2>
              <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-400">
                <p>
                  Emiid est né à Abidjan en 2026, dans un bureau de Nexus Partners. Le fondateur, après avoir cherché pendant des semaines un développeur senior de confiance pour un projet, réalise que le problème n&apos;est pas l&apos;absence de talents — c&apos;est l&apos;absence d&apos;un lieu pour les trouver, les vérifier et les contacter sans friction.
                </p>
                <p>
                  En six mois de développement intensif, la première version d&apos;Emiid est lancée avec un objectif clair : devenir le réseau de confiance que l&apos;Afrique aurait construit pour elle-même.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-[2.5rem] blur-3xl opacity-20 dark:opacity-30" />
              <div className="relative bg-white/60 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                    <Lightbulb className="w-6 h-6" />
                  </span>
                  Les défis que nous relevons
                </h3>
                <ul className="space-y-6">
                  {[
                    "Manque de vitrine crédible pour les talents.",
                    "Difficulté pour les recruteurs de vérifier les compétences.",
                    "Plateformes occidentales inadaptées aux réalités locales.",
                    "L'économie informelle totalement ignorée.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 group">
                      <div className="mt-1 w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <ChevronRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Nos valeurs ── */}
      <section className="relative py-24 sm:py-32 z-10 border-t border-b border-gray-200/50 dark:border-white/5 bg-white/30 dark:bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
              Ce qui nous guide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Nos principes fondateurs, pensés pour répondre aux réalités de notre continent.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] p-10 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm hover:shadow-xl"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${value.bg} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="relative text-xl font-black text-gray-900 dark:text-white mb-4">{value.title}</h3>
                  <p className="relative text-base text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Notre équipe (Alternate Design) ── */}
      <section className="relative py-24 sm:py-32 z-10 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-widest border border-purple-100 dark:border-purple-500/20 mb-6">
                <Users className="w-4 h-4" /> L'équipe
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                Les <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">visages</span> derrière Emiid
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-sm">
              Une équipe compacte, ambitieuse et profondément convaincue que l'Afrique mérite ses propres outils.
            </p>
          </motion.div>

          <div className="flex flex-col gap-8">
            {/* CEO Card - Full width premium showcase */}
            {team.filter(m => m.name === "Daouda Abassi Christian").map((ceo, i) => (
              <motion.div
                key={`ceo-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-gray-200/50 dark:border-white/10 shadow-2xl overflow-hidden"
              >
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-indigo-500/5 to-purple-500/5 opacity-50" />
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl group-hover:from-indigo-500/20 transition-colors duration-700 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-10">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-amber-400 to-indigo-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 animate-pulse-slow transition-opacity" />
                    <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br ${ceo.gradient} flex items-center justify-center text-white font-black text-6xl sm:text-8xl shadow-2xl relative z-10 ring-4 ring-white dark:ring-[#0a0a0a] group-hover:scale-105 transition-transform duration-500`}>
                      {ceo.initials}
                    </div>

                    {/* Floating Badges (Visible on mobile too) */}
                    <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md rounded-xl p-2 shadow-xl border border-gray-100 dark:border-white/10 z-20 flex items-center gap-2 hover:scale-110 transition-transform cursor-default">
                      <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 p-1.5 rounded-lg">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap pr-2">Fondateur #147</span>
                    </div>

                    <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md rounded-xl p-2 shadow-xl border border-gray-100 dark:border-white/10 z-20 flex items-center gap-2 hover:scale-110 transition-transform cursor-default">
                      <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <div className="flex flex-col pr-2">
                        <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium uppercase leading-none mb-0.5">Cette semaine</span>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap leading-none">86 vues</span>
                      </div>
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-6 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md rounded-xl p-2 shadow-xl border border-gray-100 dark:border-white/10 z-20 flex items-center gap-2 hover:scale-110 transition-transform cursor-default">
                      <div className="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 p-1 rounded-full">
                        <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap pr-2">Profil certifié</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-4">
                      <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                        {ceo.name}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest shadow-sm">
                        Fondateur & CEO
                      </span>
                    </div>
                    <p className="text-xl font-medium text-indigo-600 dark:text-indigo-400 mb-6">
                      L'architecte de la vision
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-8">
                      {ceo.bio}
                    </p>

                    {/* Socials */}
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      {ceo.links.linkedin && (
                        <a href={ceo.links.linkedin} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-[#0A66C2] hover:bg-white dark:hover:bg-[#0a0a0a] hover:shadow-md transition-all"><Linkedin className="w-5 h-5" /></a>
                      )}
                      {ceo.links.twitter && (
                        <a href={ceo.links.twitter} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-[#1DA1F2] hover:bg-white dark:hover:bg-[#0a0a0a] hover:shadow-md transition-all"><Twitter className="w-5 h-5" /></a>
                      )}
                      {ceo.links.website && (
                        <a href={ceo.links.website} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:bg-white dark:hover:bg-[#0a0a0a] hover:shadow-md transition-all"><Globe2 className="w-5 h-5" /></a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Rest of the team - 3 columns */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {team.filter(m => m.name !== "Daouda Abassi Christian").map((member, i) => (
                <motion.div
                  key={`member-${i}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${member.gradient} rounded-[2rem] blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                  <div className={`relative h-full flex flex-col p-8 rounded-[2rem] border transition-all duration-300 ${member.placeholder
                      ? "bg-white/30 dark:bg-[#0a0a0a]/30 border-dashed border-gray-200 dark:border-white/10"
                      : "bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-gray-200/50 dark:border-white/10 shadow-lg hover:-translate-y-2 hover:border-gray-300 dark:hover:border-white/20"
                    }`}>
                    <div className="flex items-center gap-5 mb-6">
                      <div className={`shrink-0 w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-black text-xl shadow-inner group-hover:rotate-6 group-hover:scale-105 transition-transform duration-500`}>
                        {member.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">{member.name}</h3>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{member.role}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                      {member.bio}
                    </p>

                    {member.placeholder && (
                      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                          Poste à pourvoir
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Join the team CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <a
              href="mailto:contact@emiid.com"
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all bg-indigo-50 dark:bg-indigo-500/10 px-6 py-3 rounded-full hover:scale-105 border border-indigo-100 dark:border-indigo-500/20"
            >
              Vous voulez rejoindre l'équipe ? Écrivez-nous <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="relative py-24 sm:py-32 z-10 border-t border-gray-200/50 dark:border-white/5 bg-white/30 dark:bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
              Où nous allons
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Notre feuille de route pour les prochains mois.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800 rounded-full" />

            <div className="space-y-12">
              {roadmap.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex items-start gap-8 group"
                >
                  <div className={`relative z-10 mt-1 w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${item.done
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-400"
                    }`}>
                    {item.done
                      ? <CheckCircle2 className="w-5 h-5" />
                      : <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                    }
                  </div>
                  <div className="flex-1 bg-white/60 dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl p-6 md:p-8 hover:border-gray-300 dark:hover:border-white/20 transition-colors shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={`text-sm font-black uppercase tracking-widest ${item.done ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}>
                        {item.quarter}
                      </span>
                      {item.done && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Lancé
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-white text-xl mb-2">{item.label}</h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative py-24 sm:py-32 z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[3rem] overflow-hidden bg-gray-900 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 opacity-90" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

            <div className="relative p-12 md:p-24 text-center z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                Faites partie de l&apos;histoire
              </h2>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                Rejoignez les 500+ professionnels qui construisent déjà leur réputation sur Emiid. C&apos;est gratuit pour commencer.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`${USER_APP_URL}/creer-profil`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-900 font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                >
                  Créer mon profil gratuit
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="mailto:contact@emiid.com"
                  className="w-full sm:w-auto inline-flex items-center justify-center text-white font-bold py-4 px-8 rounded-full border border-indigo-400/30 bg-indigo-800/20 hover:bg-indigo-800/40 backdrop-blur-md transition-colors"
                >
                  Contacter l&apos;équipe
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
