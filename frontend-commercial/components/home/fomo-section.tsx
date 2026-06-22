"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Crown, Users, Globe2, MapPin, X, Trophy, Percent, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef, MouseEvent } from "react";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

const benefits = [
  {
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    title: "Badge \"Fondateur Numéroté\" à vie",
  },
  {
    icon: <Shield className="w-5 h-5 text-indigo-500" />,
    title: "Abonnement Pro offert (1 an)",
  },
  {
    icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
    title: "Top 5% dans les résultats",
  },
  {
    icon: <Users className="w-5 h-5 text-purple-500" />,
    title: "Accès prioritaire aux nouveautés",
  }
];

export function FomoSection() {
  // Segmentation des places
  const africaTotal = 700;
  const intlTotal = 300;
  
  // Données simulées (places déjà prises)
  const africaTaken = 124; 
  const intlTaken = 33;

  const africaRemaining = africaTotal - africaTaken;
  const intlRemaining = intlTotal - intlTaken;

  // Optimisation: ne rendre la grille complexe qu'une fois monté côté client
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Spotlight Effect Logic
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gridRef.current.style.setProperty("--mouse-x", `${x}px`);
    gridRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-[#050505]">
      {/* Background noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* Global Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Copy & Urgency */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 font-bold mb-6 text-sm backdrop-blur-sm shadow-sm"
            >
              <Crown className="w-4 h-4" />
              Cercle des Fondateurs Emiid
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight"
            >
              Le Mur des <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">1 000 Fondateurs</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed"
            >
              L'écosystème parfait exige un équilibre parfait. Nous avons réservé <strong className="text-gray-900 dark:text-gray-200">700 places pour les leaders en Afrique</strong> et <strong className="text-gray-900 dark:text-gray-200">300 places exclusives pour l'International</strong>. Les fondateurs obtiennent le badge Numéroté à vie, 1 an d'abonnement Pro et une visibilité maximale garantie.
            </motion.p>

            {/* Counters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <div className="group flex-1 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-900/50 p-5 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-2">
                  <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" /> Zone Afrique
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {africaRemaining} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/ 700 libres</span>
                </div>
              </div>
              <div className="group flex-1 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 p-5 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold mb-2">
                  <Globe2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> International
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {intlRemaining} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/ 300 libres</span>
                </div>
              </div>
            </motion.div>

            {/* Benefits Micro-interactions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
            >
              {benefits.map((benefit, idx) => (
                <div 
                  key={idx} 
                  className="group relative flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <div className="shrink-0 group-hover:scale-110 transition-transform">{benefit.icon}</div>
                  <span className="font-semibold text-gray-900 dark:text-gray-200 text-sm relative z-10">{benefit.title}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link
                href={USER_APP_URL}
                className="relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl text-white bg-gray-900 dark:bg-white dark:text-gray-900 transition-all shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] group overflow-hidden"
              >
                {/* Glow behind button */}
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center group-hover:text-white">
                  Réserver ma place de Fondateur
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                Débloquer le badge
              </button>
            </motion.div>
          </div>

          {/* Right Column: The Dual Grid with Magnetic Spotlight */}
          <motion.div 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div 
              ref={gridRef}
              onMouseMove={handleMouseMove}
              className="group bg-gray-50/50 dark:bg-[#0a0a0a] p-6 sm:p-8 rounded-[2rem] border border-gray-200/50 dark:border-gray-800/80 shadow-2xl relative overflow-hidden flex flex-col gap-6"
            >
              {/* Magnetic Spotlight Gradient */}
              <div 
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(99,102,241,0.08), transparent 40%)`
                }}
              />
              
              {mounted ? (
                <>
                  {/* ZONE AFRIQUE (700) */}
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      Afrique ({africaTotal} places)
                    </h3>
                    <div className="grid grid-cols-20 sm:grid-cols-25 md:grid-cols-30 gap-1 sm:gap-[3px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10px, 1fr))'}}>
                      {Array.from({ length: africaTotal }).map((_, i) => {
                        const isTaken = i < africaTaken;
                        const isCurrent = i === africaTaken; 
                        
                        return (
                          <div 
                            key={`a-${i}`}
                            className={`
                              aspect-square rounded-[2px] transition-all duration-300
                              ${isTaken 
                                  ? "bg-emerald-500 dark:bg-emerald-400/90 shadow-[0_0_5px_rgba(16,185,129,0.3)] animate-[fadeIn_0.5s_ease-out_forwards]" 
                                  : isCurrent
                                    ? "bg-white border-[1.5px] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] animate-pulse z-10 relative scale-125"
                                    : "bg-gray-200 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-800/80 opacity-40 hover:opacity-100 hover:bg-emerald-500/20"
                              }
                            `}
                            style={{ 
                              // Staggered delay logic based on index to create a wave effect
                              animationDelay: isTaken ? `${(i % 30) * 25}ms` : '0ms' 
                            }}
                          >
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ZONE INTERNATIONAL (300) */}
                  <div className="pt-6 border-t border-gray-200/50 dark:border-gray-800/50 relative z-10">
                    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                      International ({intlTotal} places)
                    </h3>
                    <div className="grid grid-cols-20 sm:grid-cols-25 md:grid-cols-30 gap-1 sm:gap-[3px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10px, 1fr))'}}>
                      {Array.from({ length: intlTotal }).map((_, i) => {
                        const isTaken = i < intlTaken;
                        const isCurrent = i === intlTaken;
                        
                        return (
                          <div 
                            key={`i-${i}`}
                            className={`
                              aspect-square rounded-[2px] transition-all duration-300
                              ${isTaken 
                                  ? "bg-indigo-500 dark:bg-indigo-400/90 shadow-[0_0_5px_rgba(99,102,241,0.3)] animate-[fadeIn_0.5s_ease-out_forwards]" 
                                  : isCurrent
                                    ? "bg-white border-[1.5px] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-pulse z-10 relative scale-125"
                                    : "bg-gray-200 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-800/80 opacity-40 hover:opacity-100 hover:bg-indigo-500/20"
                              }
                            `}
                            style={{ 
                              animationDelay: isTaken ? `${(i % 30) * 35}ms` : '0ms' 
                            }}
                          >
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-[400px] animate-pulse bg-gray-200 dark:bg-gray-800/50 rounded-xl"></div>
              )}

              {/* Fog effect */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* MODAL CONDITIONS */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
              >
                {/* Modal Header */}
                <div className="relative p-5 sm:p-6 pb-0 shrink-0">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3">
                    <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Comment débloquer le badge Fondateur ?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Complétez ces conditions pour obtenir votre numéro unique à vie et débloquer 1 an d'abonnement Pro.
                  </p>
                </div>

                {/* Conditions List */}
                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-200">1. Être dans les 1 000 premiers</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Le compteur est global et en temps réel. Seuls les 1000 premiers profils validés recevront le badge.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-200">2. Profil complété à 80% minimum</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Remplissez votre bio, ajoutez votre expérience et vos compétences. Notre assistant vous guidera étape par étape.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-200">3. Parrainer 3 amis (actifs)</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Invitez 3 talents ou entreprises de votre réseau. Ils doivent s'inscrire et compléter leur profil à au moins 30%.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 opacity-75">
                    <div className="shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-200">4. Ancienneté &gt; 48h</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Afin d'éviter le spam, votre compte doit avoir plus de 48h pour que l'attribution soit confirmée.
                      </p>
                    </div>
                  </div>

                  {/* Bonus */}
                  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 rounded-2xl p-3 sm:p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Action Bonus Recommandée</h4>
                        <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-1">
                          Faites valider au moins 1 compétence par un pair. Cela boostera massivement la crédibilité de votre profil dès le départ.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-5 sm:p-6 pt-0 mt-2 shrink-0">
                  <Link
                    href={USER_APP_URL}
                    className="flex w-full items-center justify-center px-6 py-4 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
                  >
                    Je relève le défi
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
