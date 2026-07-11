/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description PlanSection — Manage subscription and billing details
 * @created 2026-07-11
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Star, ShieldCheck, Zap, Globe, MessageSquare, Plus, CreditCard, Sparkles } from "lucide-react"

interface PlanSectionProps {
  profile: {
    is_premium: boolean
    email: string
  }
}

export function PlanSection({ profile }: PlanSectionProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = () => {
    setLoading(true)
    // Simuler redirection de paiement
    setTimeout(() => {
      setLoading(false)
      window.open("https://checkout.emiid.com/premium", "_blank")
    }, 1000)
  }

  const features = [
    { icon: ShieldCheck, title: "Badge certifié Élite", desc: "Badge doré distinctif sur votre profil public." },
    { icon: Zap, title: "Visibilité boostée x10", desc: "Prioritaire dans l'annuaire et le flux de recherche." },
    { icon: Globe, title: "Réalisations illimitées", desc: "Publiez tous vos projets et albums photos sans limite." },
    { icon: MessageSquare, title: "Messagerie directe", desc: "Contactez librement tous les membres du réseau." },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8">
      {/* Title */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">Mon offre EmiID</h3>
        <p className="text-slate-500 text-xs mt-1">Consultez et gérez les détails de votre abonnement et de vos avantages.</p>
      </div>

      {/* Current Offer Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 p-6 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Offre Active</span>
          <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
            {profile.is_premium ? (
              <>
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                EmiID Premium
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-blue-600" />
                EmiID Standard
              </>
            )}
          </h4>
          <p className="text-xs text-slate-500">
            {profile.is_premium 
              ? "Vous bénéficiez de l'ensemble des avantages Élite pour propulser votre activité." 
              : "Profitez de l'essentiel d'EmiID. Passez à la vitesse supérieure pour débloquer votre potentiel."
            }
          </p>
        </div>

        <div className="shrink-0">
          {profile.is_premium ? (
            <button className="w-full md:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <CreditCard className="h-4 w-4 text-slate-500" />
              Facturation
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Zap className="h-4 w-4 fill-white" />
              Passer Premium
            </button>
          )}
        </div>
      </div>

      {/* Premium Features Checklist */}
      {!profile.is_premium && (
        <div className="space-y-5 pt-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pourquoi passer à Premium ?</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex gap-3 items-start p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <h6 className="text-xs font-bold text-slate-900">{f.title}</h6>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
