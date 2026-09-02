/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section "Rejoindre nos communautés" du Hub Dashboard utilisateur.
 * @created 2026-05-10
 * @updated 2026-07-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Image from "next/image"
import { ExternalLink, Users } from "lucide-react"

const COMMUNITIES = [
  {
    name: "WhatsApp",
    role: "Discussions de groupe",
    desc: "Échangez en direct avec des professionnels de votre secteur.",
    href: "https://chat.whatsapp.com/G8chvOhoky5BPw9QFcLJEI",
    soon: false,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
    logo: "/logo/whatsapp.svg",
  },
  {
    name: "Telegram",
    role: "Publications & Programmes",
    desc: "Suivez nos annonces, opportunités et calendriers de formation.",
    href: null,
    soon: true,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    hoverBorder: "",
    glow: "",
    logo: "/logo/telegram.svg",
  },
  {
    name: "Microsoft Teams",
    role: "Formations en ligne",
    desc: "Participez à nos sessions de formation et ateliers interactifs.",
    href: null,
    soon: true,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    hoverBorder: "",
    glow: "",
    logo: "/logo/microsoft-team.svg",
  },
  {
    name: "Podcast EmiID",
    role: "Écouter nos épisodes",
    desc: "Témoignages, conseils d'experts et actualités du réseau en audio.",
    href: null,
    soon: true,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    hoverBorder: "",
    glow: "",
    logo: "/logo/podcast.svg",
  },
]

export function HubCommunities() {
  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-muted-foreground mb-3">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide uppercase">Réseau</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Rejoindre nos communautés
          </h3>
          <p className="text-base text-muted-foreground mt-2 font-medium max-w-xl">
            Échangez, apprenez et grandissez avec notre réseau de professionnels. Plongez au cœur de l&apos;écosystème EmiID.
          </p>
        </div>
      </div>

      {/* Cards grid — 2 cartes par ligne sur mobile (grid-cols-2), 4 sur grand écran (lg:grid-cols-4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {COMMUNITIES.map(c => {
          const card = (
            <>
              {/* Background Glow */}
              <div className={`absolute -inset-px rounded-2xl sm:rounded-3xl opacity-0 ${c.glow} transition-opacity duration-300 pointer-events-none`} />
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-bl from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-tr-2xl sm:rounded-tr-3xl" />

              {/* Icon */}
              <div className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <Image
                  src={c.logo}
                  alt={c.name}
                  width={28}
                  height={28}
                  className={`w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-md ${c.soon ? "opacity-50" : ""}`}
                />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1 relative z-10">
                <p className={`text-[11px] sm:text-sm font-black tracking-wide uppercase ${c.color}`}>{c.name}</p>
                <p className="text-xs sm:text-base font-extrabold text-foreground mt-0.5 sm:mt-1 leading-snug">{c.role}</p>
              </div>

              {/* Join CTA */}
              {c.soon ? (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-400 mt-1 sm:mt-2 relative z-10">
                  <span className="rounded-full bg-muted px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                    Bientôt
                  </span>
                </div>
              ) : (
                <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold ${c.color} mt-1 sm:mt-2 relative z-10`}>
                  <span>Rejoindre</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </div>
              )}
            </>
          )

          return c.soon ? (
            <div
              key={c.name}
              aria-disabled="true"
              className={`group relative overflow-hidden bg-card border ${c.border} rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col gap-3 sm:gap-5 shadow-[0_4px_24px_rgb(15,23,42,0.05)] opacity-75 cursor-not-allowed select-none`}
            >
              {card}
            </div>
          ) : (
            <a
              key={c.name}
              href={c.href ?? "#"}
              target="_blank"
              rel="noopener noreferrer ugc nofollow"
              className={`group relative overflow-hidden bg-card border ${c.border} ${c.hoverBorder} rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col gap-3 sm:gap-5 shadow-[0_4px_24px_rgb(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]`}
            >
              {card}
            </a>
          )
        })}
      </div>

    </div>
  )
}
