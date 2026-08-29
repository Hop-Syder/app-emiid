/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Network Ticker — Bandeau d'actualités et garanties de la plateforme EmiID.
 *              Design 2026 : sobre, ultra-lisible, fond #000616, défilement fluide avec masques de fondu.
 * @created 2026-08-20
 * @updated 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Zap, Globe2, CheckCircle2, Sparkles } from "lucide-react"

const TICKER_ITEMS = [
  { icon: CheckCircle2, text: "Empreinte numérique certifiée et vérifiée", accent: "text-[#03b3f8]" },
  { icon: ShieldCheck, text: "Chiffrement et protection des données conformes", accent: "text-emerald-400" },
  { icon: Zap, text: "Mise en relation directe avec les décideurs et talents", accent: "text-[#03b3f8]" },
  { icon: Globe2, text: "Écosystème actif au Bénin et à l'international", accent: "text-emerald-400" },
  { icon: Sparkles, text: "Carte de visite digitale déployable en 2 minutes", accent: "text-[#03b3f8]" },
]

export function LiveNetworkTicker() {
  return (
    <div className="relative w-full overflow-hidden border-y border-white/[0.06] bg-[#000616] py-3 select-none">
      {/* Masques de fondu progressif sur les côtés gauche et droit */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#000616] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#000616] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center max-w-7xl mx-auto px-4">
        {/* Badge indicateur sobre */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-1 mr-4 z-20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium tracking-wider uppercase text-[#A8B0C7]">EmiID Live</span>
        </div>

        {/* Défilement continu fluide */}
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 35,
            }}
            className="flex items-center gap-10 whitespace-nowrap"
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13px] font-normal text-[#C8D1E6]">
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${item.accent}`} />
                  <span>{item.text}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20 ml-6 shrink-0" />
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
