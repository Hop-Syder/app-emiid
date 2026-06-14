"use client"

import { ExternalLink, Mic, Users } from "lucide-react"

const COMMUNITIES = [
  {
    name: "WhatsApp",
    role: "Discussions de groupe",
    desc: "Échangez en direct avec des professionnels de votre secteur.",
    href: "https://chat.whatsapp.com/",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7 drop-shadow-md" aria-hidden="true">
        <circle cx="16" cy="16" r="16" fill="#25D366" />
        <path
          d="M23.3 8.7A10.2 10.2 0 0 0 5.8 20.3L4 28l7.9-2.1a10.2 10.2 0 0 0 4.9 1.2h.1c5.7 0 10.3-4.6 10.3-10.2 0-2.7-1-5.2-2.9-7.2zM16 25.7h-.1a8.4 8.4 0 0 1-4.4-1.2l-.3-.2-3.3.9.9-3.2-.2-.3A8.6 8.6 0 0 1 16 7.3a8.5 8.5 0 0 1 8.5 8.5c0 4.7-3.8 8.5-8.5 8.5zm4.7-6.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.5-.6.2-.4v-.4c-.1-.3-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3.6 3.6 0 0 0-1.1 2.6c0 1.5 1 3 1.2 3.2.2.2 2 3.1 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.7.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.5-.3z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    name: "Telegram",
    role: "Publications & Programmes",
    desc: "Suivez nos annonces, opportunités et calendriers de formation.",
    href: "https://t.me/",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    hoverBorder: "hover:border-sky-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)]",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7 drop-shadow-md" aria-hidden="true">
        <circle cx="16" cy="16" r="16" fill="#2AABEE" />
        <path
          d="M23.5 8.5l-3 14.2c-.2.9-.8 1.1-1.6.7l-4.4-3.3-2.1 2.1c-.2.2-.5.3-.9.3l.3-4.5 8.1-7.3c.3-.3-.1-.5-.5-.2L9.2 17.2 5 15.9c-.9-.3-.9-.9.2-1.3l16.8-6.5c.7-.3 1.4.2 1.5 1.4z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    name: "Microsoft Teams",
    role: "Formations en ligne",
    desc: "Participez à nos sessions de formation et ateliers interactifs.",
    href: "https://teams.microsoft.com/",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    hoverBorder: "hover:border-violet-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7 drop-shadow-md" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#6264A7" />
        <path d="M20 10h-3v3h3v-3z" fill="#fff" opacity=".6" />
        <path
          d="M22 13h-5v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h6v-1a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1h-1z"
          fill="#fff"
        />
        <rect x="9" y="14" width="8" height="7" rx="1" fill="#6264A7" opacity=".3" />
        <path d="M10 16h6M10 18.5h4" stroke="#6264A7" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Podcast EmiID",
    role: "Écouter nos épisodes",
    desc: "Témoignages, conseils d'experts et actualités du réseau en audio.",
    href: "#",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    hoverBorder: "hover:border-orange-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]",
    icon: (
      <div className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-orange-400 to-rose-500 rounded-full shadow-lg">
        <Mic className="w-4 h-4 text-white" />
      </div>
    ),
  },
]

export function HubCommunities() {
  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide uppercase">Réseau</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Rejoindre nos communautés
          </h3>
          <p className="text-base text-slate-500 mt-2 font-medium max-w-xl">
            Échangez, apprenez et grandissez avec notre réseau de professionnels. Plongez au cœur de l'écosystème EmiID.
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {COMMUNITIES.map(c => (
          <a
            key={c.name}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative overflow-hidden bg-white/60 backdrop-blur-xl border ${c.border} ${c.hoverBorder} rounded-[2rem] p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]`}
          >
            {/* Background Glow */}
            <div className={`absolute -inset-px rounded-[2rem] opacity-0 ${c.glow} transition-opacity duration-300 pointer-events-none`} />
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-tr-[2rem]`} />
            
            {/* Icon */}
            <div className={`relative w-14 h-14 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              {c.icon}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1 relative z-10">
              <p className={`text-sm font-black tracking-wide uppercase ${c.color}`}>{c.name}</p>
              <p className="text-base font-extrabold text-slate-900 mt-1 leading-tight">{c.role}</p>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{c.desc}</p>
            </div>

            {/* Join CTA */}
            <div className={`flex items-center gap-2 text-sm font-bold ${c.color} mt-2 relative z-10`}>
              Rejoindre
              <ExternalLink className="w-4 h-4 shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </div>
          </a>
        ))}
      </div>

    </div>
  )
}
