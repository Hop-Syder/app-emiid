/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hero Section de prestige avec simulateur de profil interactif, recherche rapide Cmd+K et Dark Mode irréprochable
 * @created 2026-06-12
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, TrendingUp, Plus, MessageSquare, Shield, ArrowRight, Eye, Search, Sparkles, Command } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

const simulatorProfiles = {
  founder: {
    name: "Koffi Mensah",
    role: "CEO & Co-fondateur · FinTech",
    category: "Fondateur Tech",
    followers: "1.2k",
    following: 45,
    verified: true,
    badge: "🏆 Fondateur #147",
    views: "86 vues cette semaine",
    skills: ["FinTech", "Levée de fonds", "AgriTech"],
  },
  investor: {
    name: "Amina Diop",
    role: "Managing Partner · Seed Capital",
    category: "Entreprise & VC",
    followers: "2.1k",
    following: 120,
    verified: true,
    badge: "💼 Entreprise Certifiée",
    views: "124 vues cette semaine",
    skills: ["Impact Africa", "Seed", "SaaS B2B"],
  },
  talent: {
    name: "Moussa Traoré",
    role: "Lead Full Stack & Cloud Architect",
    category: "Top Talent",
    followers: "640",
    following: 38,
    verified: true,
    badge: "⭐ Top 5% Talents",
    views: "54 vues cette semaine",
    skills: ["React 19", "Next.js", "Supabase"],
  },
};

type ProfileKey = keyof typeof simulatorProfiles;

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<ProfileKey>("founder");
  const profile = simulatorProfiles[activeTab];
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    sectionRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    sectionRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative group min-h-[92vh] flex items-center justify-center overflow-hidden bg-background px-6 md:px-12 lg:px-16 pt-28 pb-20"
    >
      {/* Grille d'arrière-plan technique */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

      {/* Spotlights d'ambiance charte (Bleu roi & Cyan) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[130px] -z-10 pointer-events-none" />

      {/* Halo interactif au curseur */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: "radial-gradient(700px circle at var(--mouse-x) var(--mouse-y), rgba(1,63,244,0.08), transparent 45%)",
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── Colonne Gauche : Proposition de Valeur ── */}
          <div className="lg:col-span-7 text-center lg:text-left">
            
            {/* Badge de réassurance pré-titre */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-white/5 border border-blue-500/20 dark:border-white/10 text-xs font-bold text-blue-600 dark:text-cyan-400 mb-6 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>La première plateforme d&apos;identité certifiée d&apos;Afrique</span>
            </motion.div>

            {/* Titre Principal H1 */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Construisez votre réputation.
              <br />
              <span className="text-brand-gradient">
                Créez vos opportunités.
              </span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 font-normal leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              EmiID certifie l&apos;expertise des professionnels et talents du continent, met en lumière leurs réalisations et les connecte directement aux entreprises, recruteurs et partenaires.
            </motion.p>

            {/* Signaux de confiance */}
            <motion.div
              className="flex flex-wrap gap-2.5 justify-center lg:justify-start mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {[
                { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, text: "Profil vérifié par les pairs" },
                { icon: <Shield className="w-4 h-4 text-blue-500" />, text: "Données protégées par PIN" },
                { icon: <TrendingUp className="w-4 h-4 text-cyan-400" />, text: "Référencement prioritaire" },
              ].map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/10 px-3 py-1.5 rounded-full shadow-sm"
                >
                  {item.icon}
                  {item.text}
                </span>
              ))}
            </motion.div>

            {/* Call To Actions */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href={`${USER_APP_URL}/creer-profil`}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98]"
              >
                Créer mon profil gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold rounded-xl text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/10 hover:bg-gray-100/80 dark:hover:bg-white/[0.08] transition-all shadow-sm"
              >
                Explorer le réseau
              </Link>
            </motion.div>

            {/* Barre de recherche d'exploration interactive (Cmd+K Teaser) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="max-w-xl mx-auto lg:mx-0"
            >
              <Link
                href="/explore"
                className="group flex items-center justify-between p-3 pl-4 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-cyan-500/40 transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
                  <Search className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Rechercher un profil vérifié (ex: Dev Cotonou, Designer Dakar...)</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-300">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </Link>
            </motion.div>

          </div>

          {/* ── Colonne Droite : Simulateur de Profil Interactif ── */}
          <div className="lg:col-span-5 flex flex-col items-center">

            {/* Sélecteur d'onglets (Fondateur / Entreprise / Talent) */}
            <div className="flex bg-gray-100/90 dark:bg-white/[0.05] backdrop-blur-md p-1 rounded-2xl mb-6 w-full max-w-[360px] border border-gray-200/80 dark:border-white/10 relative">
              {(Object.keys(simulatorProfiles) as ProfileKey[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-xl relative transition-colors capitalize z-10",
                      isActive
                        ? "text-blue-600 dark:text-cyan-300"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeHeroTab"
                        className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    {tab === "founder" ? "Fondateur" : tab === "investor" ? "Entreprise" : "Talent"}
                  </button>
                );
              })}
            </div>

            {/* Carte Simulateur avec badges flottants */}
            <div className="w-full max-w-[360px] sm:max-w-[380px] relative mx-auto">

              {/* Badge flottant — Haut droit */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="flex absolute -top-3.5 right-2 sm:-right-4 z-30 items-center gap-1.5 bg-white/95 dark:bg-[#000616]/95 backdrop-blur-xl border border-emerald-500/30 rounded-xl px-3 py-1.5 shadow-lg"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  Profil vérifié
                </span>
              </motion.div>

              {/* Badge flottant — Gauche */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="flex absolute top-[36%] -left-2 sm:-left-6 z-30 items-center gap-1.5 bg-white/95 dark:bg-[#000616]/95 backdrop-blur-xl border border-blue-500/30 rounded-xl px-3 py-1.5 shadow-lg"
              >
                <TrendingUp className="w-4 h-4 text-blue-500 dark:text-cyan-400 shrink-0" />
                <span className="text-[11px] font-bold text-blue-600 dark:text-cyan-300 whitespace-nowrap">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {profile.badge}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.div>

              {/* Badge flottant — Bas */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                className="flex absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-30 items-center gap-1.5 bg-white/95 dark:bg-[#000616]/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl px-3.5 py-1.5 shadow-lg"
              >
                <Eye className="w-4 h-4 text-cyan-500 shrink-0" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[11px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap"
                  >
                    {profile.views}
                  </motion.span>
                </AnimatePresence>
              </motion.div>

              {/* Carte principale */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white/85 dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200/90 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-[2rem] overflow-hidden p-6 sm:p-7 relative group"
                >
                  {/* Halo interne supérieur */}
                  <div
                    className="absolute top-0 inset-x-0 h-40 opacity-40 blur-2xl pointer-events-none"
                    style={{ background: "radial-gradient(circle at 50% 0%, rgba(3,179,248,0.25), transparent 70%)" }}
                  />

                  {/* Catégorie & wordmark */}
                  <div className="pb-3 px-1 flex items-center justify-between z-10 relative">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border text-blue-600 dark:text-cyan-400 bg-blue-500/10 border-blue-500/20">
                      {profile.category}
                    </span>
                    <span className="font-wordmark text-[11px] font-bold text-gray-400 tracking-wider">
                      emiid.com
                    </span>
                  </div>

                  {/* Avatar avec badge vérifié */}
                  <div className="flex flex-col items-center mt-2 z-10 relative">
                    <div className="relative">
                      <div className="h-20 w-20 border-4 shadow-xl border-white dark:border-[#000616] ring-2 ring-blue-500/30 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-300 font-black text-2xl">
                        {profile.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      {profile.verified && (
                        <div className="absolute bottom-0 right-0 rounded-full p-1 shadow-md border-2 bg-white dark:bg-[#000616] border-gray-100 dark:border-white/20">
                          <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nom, Titre & Bio */}
                  <div className="flex flex-col items-center text-center px-1 pt-3 pb-1 z-10 relative">
                    <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-0.5">
                      {profile.name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4">
                      {profile.role}
                    </p>

                    {/* Statistiques */}
                    <div className="flex items-center justify-center gap-6 mb-4 py-2 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 w-full">
                      <div className="flex flex-col items-center">
                        <span className="text-base font-black text-gray-900 dark:text-white">{profile.followers}</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">Abonnés</span>
                      </div>
                      <div className="h-7 w-px bg-gray-200 dark:bg-white/10" />
                      <div className="flex flex-col items-center">
                        <span className="text-base font-black text-gray-900 dark:text-white">{profile.following}</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">Suivis</span>
                      </div>
                    </div>

                    {/* Compétences certifiées */}
                    <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/15"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Boutons d'interaction */}
                    <div className="w-full flex gap-2">
                      <button className="flex-1 h-9 px-3 rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-95 transition-all flex items-center justify-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> Suivre
                      </button>
                      <button className="flex-1 h-9 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-semibold bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-white/10">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" /> Message
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
