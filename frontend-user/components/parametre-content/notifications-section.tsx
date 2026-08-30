/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Notifications section — alertes email, push et communication.
 * @created 2026-06-13
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useRef } from "react"
import { Bell, MessageSquare, Users, Mail, Smartphone } from "lucide-react"
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscriptionStatus,
} from "@/lib/push-notifications"
import { SectionCard, SettingToggle, SaveBar } from "./settings-primitives"

interface NotificationSettings {
  messages: boolean
  network_activity: boolean
  newsletter: boolean
  push: boolean
}

interface NotificationsSectionProps {
  settings: NotificationSettings
  setSettings: (s: NotificationSettings) => void
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
}

export function NotificationsSection({
  settings,
  setSettings,
  saving,
  handleSave,
  handleCancel,
}: NotificationsSectionProps) {
  const isMounted = useRef(true)

  // Sync push toggle with actual browser subscription state on mount
  useEffect(() => {
    isMounted.current = true
    getPushSubscriptionStatus().then((isSubscribed) => {
      if (!isMounted.current) return
      if (settings.push !== isSubscribed) {
        setSettings({ ...settings, push: isSubscribed })
      }
    })
    return () => {
      isMounted.current = false
    }
  }, [])

  const toggle = async (key: keyof NotificationSettings, checked: boolean) => {
    if (key === "push") {
      if (checked) {
        const sub = await subscribeToPushNotifications()
        if (!sub) {
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
      <SectionCard
        title="Canaux d'alertes & Notifications"
        icon={Bell}
        description="Choisissez comment et quand vous souhaitez être alerté de l'activité sur votre compte."
      >
        <div className="divide-y divide-slate-100">
          <SettingToggle
            id="notif-push"
            icon={Smartphone}
            iconBg="bg-[#013ff4]/10"
            iconColor="text-[#013ff4]"
            title="Notifications Push (Appareil)"
            description="Recevez des alertes instantanées sur cet appareil même quand l'application est fermée."
            checked={settings.push}
            onCheckedChange={(checked) => void toggle("push", checked)}
          />

          <SettingToggle
            id="notif-messages"
            icon={MessageSquare}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            title="Nouveaux Messages & Devis"
            description="Recevez une alerte email et push pour chaque message entrant ou demande de devis."
            checked={settings.messages}
            onCheckedChange={(checked) => void toggle("messages", checked)}
          />

          <SettingToggle
            id="notif-network"
            icon={Users}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            title="Activité du Réseau & Profil"
            description="Soyez averti des nouveaux abonnés, des recommandations et des vues sur votre profil public."
            checked={settings.network_activity}
            onCheckedChange={(checked) => void toggle("network_activity", checked)}
          />

          <SettingToggle
            id="notif-newsletter"
            icon={Mail}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            title="Actualités & Mises à jour EmiID"
            description="Recevez notre récapitulatif mensuel d'opportunités, conseils de visibilité et nouveautés plateforme."
            checked={settings.newsletter}
            onCheckedChange={(checked) => void toggle("newsletter", checked)}
          />
        </div>
      </SectionCard>

      <SaveBar saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
    </div>
  )
}

