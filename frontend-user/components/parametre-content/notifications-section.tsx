/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Notifications section — preferences wired to push + email
 * @updated 2026-06-13
*/

"use client"

import { useEffect, useRef } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscriptionStatus,
} from "@/lib/push-notifications"

interface NotificationSettings {
  messages:         boolean
  network_activity: boolean
  newsletter:       boolean
  push:             boolean
}

interface NotificationsSectionProps {
  settings:     NotificationSettings
  setSettings:  (s: NotificationSettings) => void
  saving:       boolean
  handleSave:   () => void
  handleCancel: () => void
}

const ROWS: { key: keyof NotificationSettings; label: string; desc: string }[] = [
  { key: "messages",         label: "Nouveaux messages",       desc: "Recevez une alerte email pour chaque nouveau message" },
  { key: "network_activity", label: "Activité du réseau",      desc: "Nouveaux followers et vues de profil" },
  { key: "newsletter",       label: "Newsletter hebdomadaire", desc: "Autorise l'envoi d'emails de la part d'EmiID" },
  { key: "push",             label: "Notifications push",      desc: "Alertes en temps réel sur cet appareil (navigateur)" },
]

export function NotificationsSection({ settings, setSettings, saving, handleSave, handleCancel }: NotificationsSectionProps) {
  const isMounted = useRef(true)

  // Sync push toggle with actual browser subscription state on mount
  useEffect(() => {
    isMounted.current = true
    getPushSubscriptionStatus().then(isSubscribed => {
      if (!isMounted.current) return
      if (settings.push !== isSubscribed) {
        setSettings({ ...settings, push: isSubscribed })
      }
    })
    return () => { isMounted.current = false }
    // Run once on mount — settings ref intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = async (key: keyof NotificationSettings, checked: boolean) => {
    if (key === "push") {
      if (checked) {
        const sub = await subscribeToPushNotifications()
        if (!sub) {
          // Permission denied or error — don't update state
          return
        }
      } else {
        await unsubscribeFromPushNotifications()
      }
    }
    setSettings({ ...settings, [key]: checked })
  }

  return (
    <div className="space-y-4">

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5">Préférences de notifications</h2>

        <div className="divide-y divide-slate-100">
          {ROWS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <Switch
                className="shrink-0"
                checked={settings[key]}
                onCheckedChange={checked => void toggle(key, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
        <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto h-11 rounded-xl border-slate-200 font-bold">
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-11 rounded-xl font-bold shadow-sm">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

    </div>
  )
}
