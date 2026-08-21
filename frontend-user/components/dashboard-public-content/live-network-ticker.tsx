/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Live Network Ticker — Bandeau défilant d'activité réseau en direct pour le Hub EmiID.
 * @created 2026-08-20
 * @updated 2026-08-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion } from "framer-motion"
import { Sparkles, ShieldCheck, Zap, Globe2 } from "lucide-react"

const TICKER_ITEMS = [
  { icon: Sparkles, text: "Nouveau profil certifié à Cotonou", color: "text-[#03b3f8]" },
  { icon: ShieldCheck, text: "Empreinte numérique vérifiée à Abidjan", color: "text-emerald-400" },
  { icon: Zap, text: "12 nouvelles connexions professionnelles aujourd'hui", color: "text-amber-400" },
  { icon: Globe2, text: "Réseau actif dans 18+ pays en Afrique et Diaspora", color: "text-[#03b3f8]" },
  { icon: Sparkles, text: "Nouveau portfolio publié en Développement Web", color: "text-[#03b3f8]" },
]

export function LiveNetworkTicker() {
  return (
    <div className="w-full overflow-hidden border-y border-white/10 bg-slate-950/70 backdrop-blur-xl py-3 shadow-inner">
      <div className="flex items-center gap-2 max-w-7xl mx-auto px-4">
        {/* Badge Live Indicator */}
        <div className="flex items-center gap-2 shrink-0 bg-[#013ff4]/10 border border-[#013ff4]/30 rounded-full px-3 py-1 mr-2 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#03b3f8] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#013ff4]" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#03b3f8]">EN DIRECT</span>
        </div>

        {/* Ticker Animation Container */}
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 28,
            }}
            className="flex items-center gap-12 whitespace-nowrap"
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.text}</span>
                  <span className="text-slate-700 ml-4">•</span>
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
