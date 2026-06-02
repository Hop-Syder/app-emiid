/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Réglages des préférences de notifications et indicateurs de visibilité du profil
 * @created 2026-06-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import { Bell, Mail, Smartphone, Eye, Sparkles, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface PreferenceToggleProps {
  label: string
  description: string
  icon: any
  checked: boolean
  onChange: (checked: boolean) => void
}

function PreferenceToggle({ label, description, icon: Icon, checked, onChange }: PreferenceToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex gap-3">
        <div className="p-2 bg-slate-100 rounded-xl text-slate-600 shrink-0 mt-0.5">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-slate-800">{label}</h5>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  )
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    emailFollowers: true,
    emailViews: false,
    pushMessages: true,
    pushSystem: true,
  })

  const handleToggle = (key: keyof typeof preferences) => (checked: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: checked }))
    toast.success("Préférences enregistrées avec succès", {
      description: "Vos paramètres de notifications ont été mis à jour.",
      duration: 3000,
    })
  }

  return (
    <div className="space-y-6">
      {/* Bento 1 : Canaux généraux */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-200/60 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-150/50">
          <Bell className="w-4 h-4 text-blue-500" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Canaux d'alerte</h4>
        </div>
        <div className="divide-y divide-slate-100">
          <PreferenceToggle 
            label="Notifications E-mail"
            description="Recevoir un résumé périodique de l'activité du réseau par mail."
            icon={Mail}
            checked={preferences.emailFollowers}
            onChange={handleToggle("emailFollowers")}
          />
          <PreferenceToggle 
            label="Push sur le Navigateur"
            description="Être alerté instantanément même en dehors de l'application."
            icon={Smartphone}
            checked={preferences.pushMessages}
            onChange={handleToggle("pushMessages")}
          />
        </div>
      </div>

      {/* Bento 2 : Types de notifications */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-200/60 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-150/50">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Événements</h4>
        </div>
        <div className="divide-y divide-slate-100">
          <PreferenceToggle 
            label="Visites du Profil"
            description="Recevoir une alerte quand quelqu'un explore votre carte."
            icon={Eye}
            checked={preferences.emailViews}
            onChange={handleToggle("emailViews")}
          />
          <PreferenceToggle 
            label="Alertes système"
            description="Informations de sécurité, maintenance et mises à jour importantes."
            icon={TrendingUp}
            checked={preferences.pushSystem}
            onChange={handleToggle("pushSystem")}
          />
        </div>
      </div>

      {/* Bento 3 : Statistiques rapides d'impact */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Impact Réseau
            </span>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h5 className="text-2xl font-black tracking-tight">+18%</h5>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">
              Votre visibilité a augmenté cette semaine grâce aux interactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
