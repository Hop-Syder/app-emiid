/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hero Section avec titre d'accroche et simulateur de profil interactif (Fondateur, Investisseur, Talent)
 * @created 2026-06-12
 * @updated 2026-06-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Github, Briefcase, TrendingUp, Layers, CheckCircle2, User, Sparkles, Shield, Plus, MessageSquare } from "lucide-react";
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
  },
  investor: {
    name: "Amina Diop",
    role: "Managing Partner",
    category: "Investisseur",
    followers: "840",
    following: 120,
    verified: true,
  },
  talent: {
    name: "Moussa Traoré",
    role: "Full Stack Senior",
    category: "Top Talent",
    followers: "420",
    following: 38,
    verified: true,
  }
};

type ProfileKey = keyof typeof simulatorProfiles;

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<ProfileKey>("founder");
  const profile = simulatorProfiles[activeTab];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background px-8 md:px-12 lg:px-16 pt-28 pb-16">
      {/* Background grid */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Background light glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="relative z-10 max-w-[1440px] mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Heading and copy */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6 border border-indigo-100/60 dark:border-indigo-900/30">
                <Sparkles className="w-3.5 h-3.5" />
                L'infrastructure de confiance de l'Afrique tech
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              L'empreinte numérique <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-500">
                certifiée
              </span>
            </motion.h1>

            <motion.p
              className="max-w-2xl mx-auto lg:mx-0 text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Emiid est la plateforme de référence qui valide vos compétences, certifie vos expériences, et vous connecte directement avec l'écosystème d'investisseurs et d'entreprises.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a
                href={`${USER_APP_URL}/creer-profil`}
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20"
              >
                Créer mon profil
              </a>
              <a
                href="/explore"
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 dark:border-gray-800 text-base font-semibold rounded-2xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm"
              >
                Découvrir l'annuaire
              </a>
            </motion.div>
          </div>

          {/* Right Column: Interactive Profile Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center">

            {/* Tabs Selector */}
            <div className="flex bg-gray-100/80 dark:bg-gray-900/60 backdrop-blur-sm p-1 rounded-2xl mb-6 w-full max-w-[280px] border border-gray-200/50 dark:border-gray-800/50 relative">
              {(Object.keys(simulatorProfiles) as ProfileKey[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-xl relative transition-colors capitalize z-10",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabGlow"
                        className="absolute inset-0 bg-white dark:bg-gray-950 rounded-xl shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    {tab === "founder" ? "Fondateur" : tab === "investor" ? "Investisseur" : "Talent Tech"}
                  </button>
                );
              })}
            </div>

            {/* Profile Card Container */}
            <div className="w-full max-w-[280px] relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[32px] blur-xl -z-10"></div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] hover:border-white rounded-[32px] overflow-hidden p-6 sm:p-8 transition-colors duration-300 relative group"
                >
                  {/* Subtle Glow Effect inside card matching glass-blue */}
                  <div 
                    className="absolute top-0 inset-x-0 h-48 opacity-40 blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-80"
                    style={{ background: `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.8), transparent)` }}
                  />

                  {/* Top Banner Area */}
                  <div className="pt-2 pb-2 px-6 flex justify-between items-start z-10 relative">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border text-blue-600 bg-blue-50 border-blue-100">
                      {profile.category}
                    </span>
                  </div>

                  {/* Avatar Section */}
                  <div className="flex flex-col items-center mt-2 z-10 px-6 relative">
                    <div className="relative">
                      <div className="h-24 w-24 border-4 shadow-xl ring-1 ring-white/10 border-white rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-2xl overflow-hidden">
                        {profile.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      {profile.verified && (
                        <div className="absolute bottom-0 right-0 rounded-full p-1 shadow-lg border-2 bg-white border-slate-100">
                          <Shield className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 flex flex-col items-center text-center px-6 pt-4 pb-2 z-10 relative">
                    <h3 className="text-xl font-bold tracking-tight mb-1 w-full text-slate-900">
                      {profile.name}
                    </h3>
                    <p className="text-xs font-medium uppercase tracking-widest w-full mb-4 text-slate-500">
                      {profile.role}
                    </p>

                    {/* Minimal Stats */}
                    <div className="flex items-center justify-center gap-6 mb-6">
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold text-slate-900">{profile.followers}</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Abonnés</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200/60" />
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold text-slate-900">{profile.following}</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Suivis</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex gap-2 mt-auto">
                      <button 
                        className="flex-1 h-10 px-2 rounded-2xl font-bold text-[11px] transition-all border-none shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1 shrink-0" /> <span className="truncate">Suivre</span>
                      </button>
                      <button
                        className="flex-1 h-10 px-2 rounded-2xl border transition-all flex items-center justify-center gap-1.5 text-[11px] font-semibold bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <span className="truncate">Message</span>
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
