/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Notifications section — redesign
 * @updated 2026-06-13
*/

"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { subscribeToPushNotifications } from "@/lib/push-notifications"

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
  { key: "messages",         label: "Nouveaux messages",       desc: "Recevez une alerte pour chaque nouveau message" },
  { key: "network_activity", label: "Activité du réseau",      desc: "Mises à jour des profils que vous suivez" },
  { key: "newsletter",       label: "Newsletter hebdomadaire", desc: "Résumé des actualités et opportunités du réseau" },
  { key: "push",             label: "Notifications push",      desc: "Alertes en temps réel sur votre appareil mobile" },
]

export function NotificationsSection({ settings, setSettings, saving, handleSave, handleCancel }: NotificationsSectionProps) {
  const toggle = async (key: keyof NotificationSettings, checked: boolean) => {
    const next = { ...settings, [key]: checked }
    setSettings(next)
    if (key === "push" && checked) {
      const sub = await subscribeToPushNotifications()
      if (!sub) setSettings({ ...settings, push: false })
    }
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
                onCheckedChange={checked => toggle(key, checked)}
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
