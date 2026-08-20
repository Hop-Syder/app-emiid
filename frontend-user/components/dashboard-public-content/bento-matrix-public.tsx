/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description BentoMatrixPublic — Grille Bento 2.0 avec Radar de Proximité,
 *              Studio de personnalisation de carte en direct et métriques d'impact.
 * @created 2026-08-20
 * @updated 2026-08-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Radar, Sparkles, Palette, ShieldCheck, ArrowUpRight,
  UserCheck, Smartphone, Lock
} from "lucide-react"

const THEMES = [
  { id: "blue", name: "Bleu Indigo", bg: "bg-gradient-to-br from-[#013ff4] to-sky-600", text: "text-blue-400" },
  { id: "dark", name: "Sombre Éditorial", bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950", text: "text-slate-200" },
  { id: "emerald", name: "Émeraude Luxury", bg: "bg-gradient-to-br from-emerald-600 to-teal-800", text: "text-emerald-400" },
  { id: "gold", name: "Or & Verre", bg: "bg-gradient-to-br from-amber-500 to-yellow-700", text: "text-amber-300" },
]

export function BentoMatrixPublic() {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#013ff4] uppercase">Expérience Hub 2.0</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-satoshi mt-1">
            Matrice & Capacités EmiID
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ── TUILE 1 : RADAR DE PROXIMITÉ (7 cols md) ──────────────────────── */}
        <div className="md:col-span-7 relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_12px_32px_rgba(15,23,42,0.06)] flex flex-col justify-between group hover:border-blue-200 transition-all">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-[#013ff4] shadow-xs">
                <Radar className="h-5 w-5 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#013ff4]">Radar de Proximité</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Découvrez les talents & entreprises certifiés autour de vous
            </h3>
            <p className="text-sm text-slate-600 font-medium max-w-md">
              Notre algorithme géolocalisé identifie en direct les professionnels vérifiés proches de votre région ou ville.
            </p>
          </div>

          {/* Décoration Radar Visuel */}
          <div className="relative mt-6 h-44 w-full rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
            {/* Cercles de radar concentriques */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border border-blue-500/20 animate-ping opacity-40" />
              <div className="w-48 h-48 rounded-full border border-blue-500/30" />
              <div className="w-28 h-28 rounded-full border border-blue-400/40" />
              <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#013ff4] shadow-md shadow-blue-500" />
              </div>
            </div>

            {/* Pins de membres simulés autour du radar */}
            <div className="absolute top-8 left-1/4 flex items-center gap-1.5 bg-slate-900/90 border border-blue-400/30 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Architecte • Cotonou (1.2 km)</span>
            </div>

            <div className="absolute bottom-8 right-12 flex items-center gap-1.5 bg-slate-900/90 border border-blue-400/30 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Dev FullStack • Abidjan</span>
            </div>

            <button
              onClick={() => router.push("/annuaire")}
              className="absolute bottom-3 left-3 z-10 text-[11px] font-bold text-blue-300 hover:text-white flex items-center gap-1 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10"
            >
              <span>Explorer l'annuaire complet</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── TUILE 2 : STUDIO DE PERSONNALISATION EXPRESS (5 cols md) ────── */}
        <div className="md:col-span-5 relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_12px_32px_rgba(15,23,42,0.06)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 shadow-xs">
                <Palette className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Studio Thèmes</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Testez votre Carte EmiID en direct
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Choisissez un style pour prévisualiser le rendu de votre empreinte numérique.
            </p>
          </div>

          {/* Mini-Carte Interactive Réactive */}
          <div className="my-4">
            <motion.div
              key={selectedTheme.id}
              initial={{ scale: 0.96, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`p-4 rounded-2xl ${selectedTheme.bg} text-white shadow-xl space-y-3 border border-white/15`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">EmiID Card</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-black">Votre Nom & Prénom</p>
                <p className="text-xs text-white/80 font-medium">Votre Spécialité / Entreprise</p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                <span className="font-bold">app.emiid.com/votre-profil</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 font-semibold">Certifié</span>
              </div>
            </motion.div>
          </div>

          {/* Sélecteur de Thèmes (Boutons Puces) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500">Choisir un style :</span>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between border ${
                    selectedTheme.id === t.id
                      ? "border-[#013ff4] bg-blue-50/80 text-[#013ff4] shadow-xs"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  {selectedTheme.id === t.id && <Sparkles className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TUILE 3 : SÉCURITÉ & VÉRIFICATION PASSEPORT ─────────────────── */}
        <div className="md:col-span-6 relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Passeport Vérifié</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Anti-usurpation d'identité & Certifications ISO/QR
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Chaque carte EmiID est sécurisée par un code PIN individuel, un QR code infalsifiable et une authentification Supabase renforcée.
            </p>
          </div>

          <div className="pt-6 grid grid-cols-3 gap-3 border-t border-white/10 text-center">
            <div className="space-y-1">
              <Lock className="h-5 w-5 text-blue-400 mx-auto" />
              <p className="text-xs font-bold text-white">Code PIN Private</p>
            </div>
            <div className="space-y-1">
              <Smartphone className="h-5 w-5 text-purple-400 mx-auto" />
              <p className="text-xs font-bold text-white">NFC & QR Code</p>
            </div>
            <div className="space-y-1">
              <UserCheck className="h-5 w-5 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-white">Profil Vérifié</p>
            </div>
          </div>
        </div>

        {/* ── TUILE 4 : APPEL À L'ACTION RÉSEAU ───────────────────────────── */}
        <div className="md:col-span-6 relative overflow-hidden rounded-[2.5rem] border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white p-6 sm:p-8 shadow-[0_12px_32px_rgba(1,63,244,0.08)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#013ff4]/10 text-[#013ff4] text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Rejoindre la communauté</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Prenez votre place parmi les entrepreneurs qui comptent
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Obtenez votre carte numérique EmiID dès aujourd'hui et boostez votre crédibilité professionnelle.
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => router.push("/creer-profil")}
              className="px-6 py-3.5 rounded-2xl bg-[#013ff4] hover:bg-[#0135d0] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Créer mon EmiID maintenant</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push("/annuaire")}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold transition-all flex items-center justify-center"
            >
              Parcourir le réseau
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
