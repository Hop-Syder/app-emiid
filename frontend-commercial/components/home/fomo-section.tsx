/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section FOMO (Mur des 1 000 Fondateurs) avec jauge d'urgence unifiée et Dark Mode #000616
 * @created 2026-06-12
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Crown, Users, X, Trophy, Percent, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef, MouseEvent } from "react";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

const benefits = [
  {
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    title: "Badge « Fondateur Numéroté » à vie",
  },
  {
    icon: <Shield className="w-5 h-5 text-blue-500" />,
    title: "Abonnement Pro offert (1 an)",
  },
  {
    icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
    title: "Top 5% dans les résultats de recherche",
  },
  {
    icon: <Users className="w-5 h-5 text-blue-400" />,
    title: "Accès prioritaire aux nouveautés & réseau",
  },
];

export function FomoSection() {
  // Segmentation des places
  const africaTotal = 700;
  const intlTotal = 300;
  const totalPlaces = africaTotal + intlTotal;

  // Données simulées (places déjà prises)
  const africaTaken = 124;
  const intlTaken = 33;
  const totalTaken = africaTaken + intlTaken;
  const totalRemaining = totalPlaces - totalTaken;

  const africaRemaining = africaTotal - africaTaken;
  const intlRemaining = intlTotal - intlTaken;
  const takenPercentage = Math.round((totalTaken / totalPlaces) * 100);

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    gridRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    gridRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-background border-t border-gray-100 dark:border-white/5">
      {/* Glows d'ambiance charte */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[130px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[130px] opacity-40 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* ── Colonne Gauche : Pitch & Urgence FOMO ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-bold mb-6 text-xs backdrop-blur-sm"
            >
              <Crown className="w-4 h-4" />
              <span>Cercle des Fondateurs EmiID</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-5 tracking-tight"
            >
              Le Mur des <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">1 000 Fondateurs</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
            >
              Nous réservons <strong className="text-gray-900 dark:text-white">700 places pour les leaders en Afrique</strong> et <strong className="text-gray-900 dark:text-white">300 places exclusives pour l&apos;International</strong>. Chaque fondateur reçoit le badge numéroté à vie, 1 an de plan Pro offert et une priorité algorithmique sur l&apos;annuaire.
            </motion.p>

            {/* Jauge de progression unifiée */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22 }}
              className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 mb-6"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-2.5">
                <span className="text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {totalTaken} / {totalPlaces} places attribuées
                </span>
                <span className="text-amber-600 dark:text-amber-400">
                  {totalRemaining} places restantes ({100 - takenPercentage}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{ width: `${(africaTaken / totalPlaces) * 100}%` }}
                  title="Afrique"
                />
                <div
                  className="h-full bg-blue-600 transition-all duration-1000"
                  style={{ width: `${(intlTaken / totalPlaces) * 100}%` }}
                  title="International"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Zone Afrique ({africaRemaining} libres)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> International ({intlRemaining} libres)
                </span>
              </div>
            </motion.div>

            {/* Avantages exclusifs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.28 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            >
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="group relative flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 hover:border-blue-500/30 dark:hover:border-cyan-500/30 transition-all duration-200 shadow-sm"
                >
                  <div className="shrink-0 group-hover:scale-105 transition-transform">{benefit.icon}</div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">{benefit.title}</span>
                </div>
              ))}
            </motion.div>

            {/* Actions CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center gap-3.5"
            >
              <Link
                href={`${USER_APP_URL}/creer-profil`}
                className="relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98] group"
              >
                <span>Réserver ma place de Fondateur</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
              >
                Conditions d&apos;attribution ↗
              </button>
            </motion.div>
          </div>

          {/* ── Colonne Droite : Grille Duale avec Spotlight ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div
              ref={gridRef}
              onMouseMove={handleMouseMove}
              className="group bg-gray-50/80 dark:bg-white/[0.03] p-6 sm:p-8 rounded-[2rem] border border-gray-200/80 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col gap-6"
            >
              {/* Spotlight interactif */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(1,63,244,0.08), transparent 45%)",
                }}
              />

              {mounted ? (
                <>
                  {/* ZONE AFRIQUE (700 places) */}
                  <div className="relative z-10">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      Zone Afrique ({africaTotal} places · {africaRemaining} disponibles)
                    </h3>
                    <div
                      className="grid gap-[3px]"
                      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(11px, 1fr))" }}
                    >
                      {Array.from({ length: africaTotal }).map((_, i) => {
                        const isTaken = i < africaTaken;
                        const isCurrent = i === africaTaken;

                        return (
                          <div
                            key={`a-${i}`}
                            className={`
                              aspect-square rounded-[2px] transition-all duration-200
                              ${
                                isTaken
                                  ? "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                                  : isCurrent
                                  ? "bg-white border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)] animate-pulse z-10 scale-125"
                                  : "bg-gray-200 dark:bg-white/[0.08] border border-gray-300 dark:border-white/5 opacity-50 hover:opacity-100 hover:bg-emerald-500/30"
                              }
                            `}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* ZONE INTERNATIONAL (300 places) */}
                  <div className="pt-6 border-t border-gray-200/60 dark:border-white/10 relative z-10">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(1,63,244,0.6)]" />
                      International ({intlTotal} places · {intlRemaining} disponibles)
                    </h3>
                    <div
                      className="grid gap-[3px]"
                      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(11px, 1fr))" }}
                    >
                      {Array.from({ length: intlTotal }).map((_, i) => {
                        const isTaken = i < intlTaken;
                        const isCurrent = i === intlTaken;

                        return (
                          <div
                            key={`i-${i}`}
                            className={`
                              aspect-square rounded-[2px] transition-all duration-200
                              ${
                                isTaken
                                  ? "bg-blue-600 dark:bg-cyan-400 shadow-[0_0_4px_rgba(1,63,244,0.3)]"
                                  : isCurrent
                                  ? "bg-white border-2 border-blue-600 shadow-[0_0_12px_rgba(1,63,244,1)] animate-pulse z-10 scale-125"
                                  : "bg-gray-200 dark:bg-white/[0.08] border border-gray-300 dark:border-white/5 opacity-50 hover:opacity-100 hover:bg-blue-500/30"
                              }
                            `}
                          />
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-[360px] animate-pulse bg-gray-200 dark:bg-white/5 rounded-2xl" />
              )}

              {/* Voile de dégradé inférieur */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 dark:from-[#000616] to-transparent z-20 pointer-events-none" />
            </div>
          </motion.div>

        </div>
      </div>

      {/* MODALE D'EXPLICATION DU BADGE */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#000616] border border-gray-200 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
              >
                {/* En-tête de la modale */}
                <div className="relative p-6 pb-0 shrink-0">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 text-amber-600 dark:text-amber-400">
                    <Crown className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
                    Comment débloquer le badge Fondateur ?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Validez ces 4 critères pour obtenir votre numéro unique à vie et débloquer 1 an de Plan Pro gratuit (valeur 24 000 FCFA).
                  </p>
                </div>

                {/* Liste des critères */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div className="flex gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">1. Être dans les 1 000 premiers</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Le compteur est horodaté en temps réel. Seuls les 1 000 premiers profils recevront le badge numéroté officiel.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">2. Profil complété à 80% minimum</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Photo, biographie, localisation et compétences requises pour assurer la qualité du réseau.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">3. Parrainer 3 pairs actifs</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Invitez 3 professionnels ou entreprises de votre écosystème à créer leur empreinte numérique.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">4. Compte vérifié sous 48h</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Mesure anti-fraude garantissant que chaque membre fondateur est un acteur économique authentique.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer de la modale */}
                <div className="p-6 pt-0 shrink-0">
                  <Link
                    href={`${USER_APP_URL}/creer-profil`}
                    className="flex w-full items-center justify-center px-6 py-3.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-colors shadow-lg shadow-amber-500/25"
                  >
                    Je réserve ma place maintenant
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
