/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section Preuve Sociale (Chiffres clés)
 * @created 2026-06-12
 * @updated 2026-06-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion"
import Image from "next/image";
import { Building2, Users, Handshake, Globe2 } from "lucide-react";

const stats = [
  { id: 1, name: "Professionnels inscrits", value: "500+", icon: Building2, color: "from-blue-500 to-cyan-400" },
  { id: 2, name: "Pays d'Afrique représentés", value: "12", icon: Globe2, color: "from-indigo-500 to-purple-500" },
  { id: 3, name: "Connexions créées", value: "2 000+", icon: Handshake, color: "from-fuchsia-500 to-pink-500" },
  { id: 4, name: "Satisfaction utilisateurs", value: "4.9 ★", icon: Users, color: "from-amber-400 to-orange-500" },
];

export function SocialProofSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative bg-white dark:bg-[#050505] py-24 sm:py-32 overflow-hidden border-t border-gray-100 dark:border-white/5">
      
      {/* Magic Spotlight */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99,102,241,0.05), transparent 40%)`
        }}
      />
      
      {/* Background ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Subtle Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      ></div>

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 z-10">
        
        {/* Header content */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          
          {/* Avatar Group representing trust */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center -space-x-4 mb-8"
          >
            {[12, 32, 45, 68, 54].map((avatarId, i) => (
              <div key={i} className="w-14 h-14 rounded-full border-4 border-white dark:border-[#050505] overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-xl relative z-[1] hover:z-10 hover:scale-110 transition-transform duration-300">
                <Image src={`https://i.pravatar.cc/150?img=${avatarId}`} alt="Utilisateur vérifié" className="w-full h-full object-cover" width={56} height={56} unoptimized />
              </div>
            ))}
            <div className="w-14 h-14 rounded-full border-4 border-white dark:border-[#050505] bg-gray-900/90 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-xs font-extrabold text-white z-[2] shadow-xl">
              +10k
            </div>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
          >
            Rejoignez l'écosystème de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">confiance</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg md:text-xl leading-relaxed text-gray-600 dark:text-gray-400"
          >
            Des milliers d'acteurs de la tech africaine font déjà confiance à Emiid pour étendre leur réseau et propulser leur croissance.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring" }}
                className="relative group rounded-[2rem] bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl border border-gray-200/50 dark:border-white/5 p-8 hover:bg-white/60 dark:hover:bg-white/[0.04] transition-colors duration-500 shadow-xl overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${stat.color} rounded-[2rem] opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none`}></div>
                
                {/* Top highlight line */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div 
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${stat.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}
                  >
                    {/* Dark mode semi-transparent background for icon */}
                    <div className="absolute inset-0 bg-white/90 dark:bg-[#0a0a0a]/80 rounded-2xl"></div>
                    <Icon className="w-8 h-8 text-gray-900 dark:text-white relative z-10" />
                  </motion.div>
                  
                  <dd className={`text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br ${stat.color} mb-3`}>
                    {stat.value}
                  </dd>
                  <dt className="text-sm font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
                    {stat.name}
                  </dt>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
