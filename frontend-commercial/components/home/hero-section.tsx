"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, TrendingUp, Users, Plus, MessageSquare, Shield, Sparkles, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

const simulatorProfiles = {
  founder: {
    name: "Koffi Mensah",
    role: "CEO & Co-fondateur",
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
    role: "Managing Partner",
    category: "Entreprise",
    followers: "2.1k",
    following: 120,
    verified: true,
    badge: "💼 Entreprise Certifiée",
    views: "124 vues cette semaine",
    skills: ["Impact Africa", "Seed", "SaaS"],
  },
  talent: {
    name: "Moussa Traoré",
    role: "Full Stack Senior",
    category: "Top Talent",
    followers: "640",
    following: 38,
    verified: true,
    badge: "⭐ Top 5% Talents",
    views: "54 vues cette semaine",
    skills: ["React", "Node.js", "Supabase"],
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
      className="relative group min-h-[90vh] flex items-center justify-center overflow-hidden bg-background px-6 md:px-12 lg:px-16 pt-28 pb-16"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none z-0"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Magnetic spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{ background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(1,63,244,0.06), transparent 40%)` }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── Left Column ── */}
          <div className="lg:col-span-7 text-center lg:text-left">



            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Construisez votre réputation.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">
                Créez vos opportunités.
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              className="max-w-xl mx-auto lg:mx-0 text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Emiid est la première plateforme africaine qui valide votre expertise, met en valeur vos réalisations et vous connecte aux entreprises, recruteurs et partenaires qui vous cherchent.
            </motion.p>

            {/* Trust signals */}
            <motion.div
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {[
                { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, text: "Profil certifié" },
                { icon: <Shield className="w-4 h-4 text-indigo-500" />, text: "Données sécurisées" },
                { icon: <TrendingUp className="w-4 h-4 text-purple-500" />, text: "Visibilité garantie" },
              ].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-full">
                  {item.icon}
                  {item.text}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href={`${USER_APP_URL}/creer-profil`}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
              >
                Créer mon profil gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm"
              >
                Voir les tarifs
              </Link>
            </motion.div>


          </div>

          {/* ── Right Column: Interactive Profile Simulator ── */}
          <div className="lg:col-span-5 flex flex-col items-center">

            {/* Tab selector */}
            <div className="flex bg-gray-100/80 dark:bg-gray-900/60 backdrop-blur-sm p-1 rounded-2xl mb-8 w-full max-w-[300px] border border-gray-200/50 dark:border-gray-800/50 relative">
              {(Object.keys(simulatorProfiles) as ProfileKey[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-xl relative transition-colors capitalize z-10",
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabGlow"
                        className="absolute inset-0 bg-white dark:bg-gray-950 rounded-xl shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    {tab === "founder" ? "Fondateur" : tab === "investor" ? "Entreprise" : "Talent"}
                  </button>
                );
              })}
            </div>

            {/* Card with floating badges */}
            <div className="w-full max-w-[300px] relative mx-auto">

              {/* Floating badge — top right */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="flex absolute -top-4 -right-3 sm:-right-6 z-30 items-center gap-1.5 bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg scale-90 sm:scale-100 origin-bottom-right"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Profil certifié</span>
              </motion.div>

              {/* Floating badge — left */}
              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                className="flex absolute top-[38%] -left-4 sm:-left-8 z-30 items-center gap-1.5 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg scale-90 sm:scale-100 origin-center"
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  <AnimatePresence mode="wait">
                    <motion.span key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      {profile.badge}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.div>

              {/* Floating badge — bottom */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                className="flex absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 items-center gap-1.5 bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg scale-90 sm:scale-100 origin-top"
              >
                <Eye className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <AnimatePresence mode="wait">
                  <motion.span key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-[10px] sm:text-[11px] font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                    {profile.views}
                  </motion.span>
                </AnimatePresence>
              </motion.div>

              {/* Card glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[32px] blur-xl -z-10" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-white/70 backdrop-blur-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] rounded-[32px] overflow-hidden p-6 transition-all duration-300 relative group"
                >
                  {/* Inner glow */}
                  <div className="absolute top-0 inset-x-0 h-48 opacity-40 blur-3xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8), transparent)` }} />

                  {/* Category badge */}
                  <div className="pb-2 px-2 flex items-center justify-between z-10 relative">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border text-blue-600 bg-blue-50 border-blue-100">
                      {profile.category}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">emiid.com</span>
                  </div>

                  {/* Avatar */}
                  <div className="flex flex-col items-center mt-2 z-10 relative">
                    <div className="relative">
                      <div className="h-20 w-20 border-4 shadow-xl ring-1 ring-white/10 border-white rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-black text-xl">
                        {profile.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      {profile.verified && (
                        <div className="absolute bottom-0 right-0 rounded-full p-1 shadow-lg border-2 bg-white border-slate-100">
                          <Shield className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name + role */}
                  <div className="flex flex-col items-center text-center px-2 pt-3 pb-1 z-10 relative">
                    <h3 className="text-lg font-black tracking-tight mb-0.5 text-slate-900">{profile.name}</h3>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{profile.role}</p>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6 mb-4">
                      <div className="flex flex-col items-center">
                        <span className="text-base font-black text-slate-900">{profile.followers}</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Abonnés</span>
                      </div>
                      <div className="h-7 w-px bg-slate-200/60" />
                      <div className="flex flex-col items-center">
                        <span className="text-base font-black text-slate-900">{profile.following}</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Suivis</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Buttons */}
                    <div className="w-full flex gap-2">
                      <button className="flex-1 h-9 px-2 rounded-xl font-bold text-[11px] shadow-md shadow-blue-500/25 bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-1">
                        <Plus className="h-3 w-3" /> Suivre
                      </button>
                      <button className="flex-1 h-9 px-2 rounded-xl border transition-all flex items-center justify-center gap-1 text-[11px] font-semibold bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50">
                        <MessageSquare className="h-3 w-3 text-blue-500" /> Message
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
