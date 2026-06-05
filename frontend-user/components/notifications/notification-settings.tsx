/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Réglages des préférences de notifications avec persistance et stats réelles
 * @created 2026-06-02
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect } from "react"
import { Bell, Mail, Smartphone, Eye, Sparkles, TrendingUp, TrendingDown, Users, Loader2, BellRing } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNotificationPreferences, type NotificationPreferences } from "@/hooks/use-notification-preferences"
import { useImpactStats } from "@/hooks/use-impact-stats"
import { subscribeToPushNotifications } from "@/lib/push-notifications"

// Types de clés modifiables (excluant id, user_id, created_at, updated_at)
type EditablePreferenceKey = keyof Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>

interface PreferenceToggleProps {
  label: string
  description: string
  icon: React.ElementType
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
}

function PreferenceToggle({ label, description, icon: Icon, checked, onChange, disabled, loading }: PreferenceToggleProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-3", disabled && "opacity-50")}>
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
          disabled={disabled || loading}
        />
        {loading ? (
          <div className="w-11 h-6 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:cursor-not-allowed"></div>
        )}
      </label>
    </div>
  )
}

export function NotificationSettings() {
  const { 
    preferences, 
    isLoading: prefsLoading, 
    isSaving, 
    updatePreference 
  } = useNotificationPreferences()
  
  const { stats, isLoading: statsLoading } = useImpactStats()
  
  const [pushSupported, setPushSupported] = useState(false)
  const [pushSubscribing, setPushSubscribing] = useState(false)

  // Vérifier si les push notifications sont supportées
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPushSupported('serviceWorker' in navigator && 'PushManager' in window)
    }
  }, [])

  const handleToggle = (key: EditablePreferenceKey) => async (checked: boolean) => {
    // Cas spécial pour les push notifications
    if (key === 'push_enabled' && checked) {
      setPushSubscribing(true)
      const subscription = await subscribeToPushNotifications()
      setPushSubscribing(false)
      
      if (!subscription) {
        toast.error("Impossible d'activer les notifications push", {
          description: "Vérifiez que vous avez autorisé les notifications dans votre navigateur.",
        })
        return
      }
    }

    const success = await updatePreference(key, checked)
    if (success) {
      toast.success("Préférences enregistrées", {
        description: "Vos paramètres de notifications ont été mis à jour.",
        duration: 2000,
      })
    } else {
      toast.error("Erreur lors de la sauvegarde", {
        description: "Veuillez réessayer.",
      })
    }
  }

  // Déterminer le message et l'icône de croissance
  const growthPercent = stats.viewsGrowthPercent
  const isPositiveGrowth = growthPercent >= 0
  const GrowthIcon = isPositiveGrowth ? TrendingUp : TrendingDown

  return (
    <div className="space-y-6">
      {/* Bento 1 : Canaux généraux */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-200/60 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-150/50">
          <Bell className="w-4 h-4 text-blue-500" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">{"Canaux d'alerte"}</h4>
        </div>
        
        {prefsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : preferences ? (
          <div className="divide-y divide-slate-100">
            <PreferenceToggle 
              label="Notifications E-mail"
              description="Recevoir un résumé périodique de l'activité du réseau par mail."
              icon={Mail}
              checked={preferences.email_enabled}
              onChange={handleToggle('email_enabled')}
              loading={isSaving}
            />
            <PreferenceToggle 
              label="Push sur le Navigateur"
              description={pushSupported 
                ? "Être alerté instantanément même en dehors de l'application."
                : "Non supporté par votre navigateur."
              }
              icon={Smartphone}
              checked={preferences.push_enabled}
              onChange={handleToggle('push_enabled')}
              disabled={!pushSupported}
              loading={isSaving || pushSubscribing}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">Connectez-vous pour gérer vos préférences</p>
        )}
      </div>

      {/* Bento 2 : Types de notifications */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-200/60 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-150/50">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Événements</h4>
        </div>
        
        {prefsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : preferences ? (
          <div className="divide-y divide-slate-100">
            <PreferenceToggle 
              label="Visites du Profil"
              description="Recevoir une alerte quand quelqu'un explore votre carte."
              icon={Eye}
              checked={preferences.notify_views}
              onChange={handleToggle('notify_views')}
              loading={isSaving}
            />
            <PreferenceToggle 
              label="Nouveaux abonnés"
              description="Être notifié quand quelqu'un vous suit."
              icon={Users}
              checked={preferences.notify_followers}
              onChange={handleToggle('notify_followers')}
              loading={isSaving}
            />
            <PreferenceToggle 
              label="Messages"
              description="Recevoir une alerte pour les nouveaux messages."
              icon={BellRing}
              checked={preferences.notify_messages}
              onChange={handleToggle('notify_messages')}
              loading={isSaving}
            />
            <PreferenceToggle 
              label="Alertes système"
              description="Informations de sécurité, maintenance et mises à jour importantes."
              icon={TrendingUp}
              checked={preferences.notify_system}
              onChange={handleToggle('notify_system')}
              loading={isSaving}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">Connectez-vous pour gérer vos préférences</p>
        )}
      </div>

      {/* Bento 3 : Statistiques rapides d'impact */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Impact Réseau
            </span>
            <GrowthIcon className={cn("w-5 h-5", isPositiveGrowth ? "text-emerald-400" : "text-rose-400")} />
          </div>
          
          {statsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-white/50" />
            </div>
          ) : (
            <>
              <div>
                <h5 className={cn(
                  "text-2xl font-black tracking-tight",
                  isPositiveGrowth ? "text-emerald-400" : "text-rose-400"
                )}>
                  {isPositiveGrowth ? "+" : ""}{growthPercent}%
                </h5>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">
                  {isPositiveGrowth 
                    ? "Votre visibilité a augmenté cette semaine grâce aux interactions."
                    : growthPercent === 0 
                      ? "Votre visibilité est stable cette semaine."
                      : "Votre visibilité a diminué cette semaine."
                  }
                </p>
              </div>
              
              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold uppercase">Vues</span>
                  </div>
                  <p className="text-lg font-bold mt-1">{stats.viewsThisWeek}</p>
                  <p className="text-[10px] text-slate-500">cette semaine</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold uppercase">Abonnés</span>
                  </div>
                  <p className="text-lg font-bold mt-1">+{stats.followersThisWeek}</p>
                  <p className="text-[10px] text-slate-500">cette semaine</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
