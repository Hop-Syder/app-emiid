"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Lightbulb, Users, Rocket, Globe2, ArrowRight, Linkedin, Twitter, Github } from "lucide-react";
import Link from "next/link";

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
      website: "https://ceo.nexuspartners.xyz",
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
  },
  {
    icon: Users,
    title: "Communauté avant tout",
    description: "Emiid n'est pas un outil. C'est un écosystème vivant où la confiance se construit par les paires, pas par les algorithmes.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Lightbulb,
    title: "Accessibilité radicale",
    description: "Un artisan de Bouaké doit pouvoir créer un profil aussi crédible qu'un développeur de Dakar. L'excellence n'a pas de code postal.",
    color: "from-amber-500 to-orange-500",
  },
];

const roadmap = [
  { quarter: "Q2 2026", label: "Lancement public", done: true, description: "Profils, annuaire, messagerie, offre Fondateur." },
  { quarter: "Q3 2026", label: "Application mobile", done: false, description: "iOS & Android — expérience native optimisée pour l'Afrique." },
  { quarter: "Q4 2026", label: "Plans Entreprise", done: false, description: "Pages entreprise vérifiées, gestion d'équipe et CRM." },
  { quarter: "Q1 2027", label: "Matchmaking IA", done: false, description: "Suggestions intelligentes de connexions et d'opportunités." },
  { quarter: "Q2 2027", label: "Paiements intégrés", done: false, description: "Facturation entre membres et contrats sécurisés on-platform." },
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay },
  };
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative py-32 sm:py-40 border-b border-gray-100 dark:border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-[100%] blur-[100px] pointer-events-none" />
        <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 text-center z-10">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Notre histoire
            </span>
          </motion.div>
          <motion.h1 {...fadeUp(0.07)} className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
            Façonner l&apos;avenir du<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
              professionnel africain
            </span>
          </motion.h1>
          <motion.p {...fadeUp(0.14)} className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
            Emiid est né d&apos;un constat simple : l&apos;Afrique regorge de talents extraordinaires, mais leur visibilité reste trop souvent confinée à des cercles restreints. Nous construisons l&apos;infrastructure qui change ça.
          </motion.p>
          <motion.div {...fadeUp(0.2)} className="flex flex-wrap justify-center gap-8">
            {[
              { value: "2026", label: "Année de lancement" },
              { value: "500+", label: "Profils créés" },
              { value: "12", label: "Pays représentés" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Histoire & Défis ── */}
      <section className="py-24 border-b border-gray-100 dark:border-white/5">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div {...fadeUp(0)} className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 md:p-10">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Notre histoire</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Emiid est né à Abidjan en 2026, dans un bureau de Nexus Partners. Le fondateur, après avoir cherché pendant des semaines un développeur senior de confiance pour un projet, réalise que le problème n&apos;est pas l&apos;absence de talents — c&apos;est l&apos;absence d&apos;un lieu pour les trouver, les vérifier et les contacter sans friction.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                En six mois de développement intensif, la première version d&apos;Emiid est lancée avec un objectif clair : devenir le LinkedIn que l&apos;Afrique aurait construit pour elle-même.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 md:p-10">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-6">
                <Target className="w-5 h-5 text-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Les défis que nous relevons</h2>
              <ul className="space-y-4">
                {[
                  "Les talents africains n'ont pas de vitrine crédible à montrer aux clients internationaux.",
                  "Les investisseurs peinent à identifier des profils vérifiés au-delà des réseaux personnels.",
                  "Les plateformes occidentales sont hors de prix et inadaptées aux réalités locales.",
                  "L'économie informelle — artisans, prestataires — est totalement ignorée par les outils existants.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Nos valeurs ── */}
      <section className="py-24 border-b border-gray-100 dark:border-white/5">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Ce qui nous guide
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div key={i} {...fadeUp(i * 0.1)} className="relative group bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 hover:border-gray-300 dark:hover:border-white/20 transition-all">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3">{value.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Notre équipe ── */}
      <section className="py-24 border-b border-gray-100 dark:border-white/5">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Users className="w-3.5 h-3.5" />
              Notre équipe
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Les visages derrière Emiid
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
              Une équipe compacte, ambitieuse et profondément convaincue que l&apos;Afrique mérite ses propres outils.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className={`relative flex flex-col items-center text-center rounded-3xl p-8 border transition-all duration-300 ${
                  member.placeholder
                    ? "bg-white/30 dark:bg-[#0a0a0a]/30 border-dashed border-gray-200 dark:border-white/10 opacity-60"
                    : "bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-xl"
                }`}
              >
                {/* Avatar */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-black text-xl mb-5 shadow-lg`}>
                  {member.initials}
                </div>

                <h3 className="font-black text-gray-900 dark:text-white text-base mb-1">
                  {member.name}
                </h3>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                  {member.role}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                  {member.bio}
                </p>

                {/* Social links */}
                {!member.placeholder && Object.keys(member.links).length > 0 && (
                  <div className="flex items-center gap-3 mt-6">
                    {member.links.linkedin && (
                      <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-500 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.links.twitter && (
                      <a href={member.links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-500 transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.links.website && (
                      <a href={member.links.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-500 transition-colors">
                        <Globe2 className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {member.placeholder && (
                  <p className="mt-6 text-[10px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest">
                    Poste à pourvoir
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Join the team CTA */}
          <motion.div {...fadeUp(0.3)} className="mt-12 text-center">
            <a
              href="mailto:contact@emiid.com"
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Vous voulez rejoindre l&apos;équipe ? Écrivez-nous →
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="py-24 border-b border-gray-100 dark:border-white/5">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Où nous allons
            </h2>
          </motion.div>
          <div className="max-w-2xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />
            <div className="space-y-8">
              {roadmap.map((item, i) => (
                <motion.div key={i} {...fadeUp(i * 0.08)} className="flex items-start gap-5">
                  <div className={`relative z-10 mt-0.5 w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${
                    item.done
                      ? "bg-indigo-600 shadow-lg shadow-indigo-500/30"
                      : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700"
                  }`}>
                    {item.done
                      ? <Rocket className="w-4 h-4 text-white" />
                      : <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    }
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs font-black uppercase tracking-widest ${item.done ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}>
                        {item.quarter}
                      </span>
                      {item.done && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Lancé ✓
                        </span>
                      )}
                    </div>
                    <p className="font-black text-gray-900 dark:text-white text-base mb-0.5">{item.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
          <motion.div {...fadeUp(0)} className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2.5rem] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Faites partie de l&apos;histoire
              </h2>
              <p className="text-indigo-200 mb-10 text-lg max-w-xl mx-auto">
                Rejoignez les 500+ professionnels qui construisent déjà leur réputation sur Emiid. C&apos;est gratuit pour commencer.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`${USER_APP_URL}/creer-profil`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-900 font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                >
                  Créer mon profil gratuit
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="mailto:contact@emiid.com"
                  className="w-full sm:w-auto text-white font-bold py-4 px-8 rounded-2xl border border-indigo-400/40 bg-indigo-800/40 hover:bg-indigo-800/70 transition-colors"
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
