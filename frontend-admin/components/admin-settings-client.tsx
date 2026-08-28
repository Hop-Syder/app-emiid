"use client"

import { useState, useTransition } from "react"
import { Bell, Database, Save, Shield, User } from "lucide-react"
import { toast } from "sonner"
import { saveAdminSettings, type AdminSettings } from "@/lib/actions/admin"

interface AdminSettingsClientProps {
  initialSettings: AdminSettings
}

export function AdminSettingsClient({ initialSettings }: AdminSettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isPending, startTransition] = useTransition()

  const updateProfile = (key: keyof AdminSettings["profile"], value: string) => {
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }))
  }

  const updateNotifications = (key: keyof AdminSettings["notifications"], value: boolean) => {
    setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }))
  }

  const updateSecurity = (key: keyof AdminSettings["security"], value: boolean | string) => {
    setSettings((prev) => ({ ...prev, security: { ...prev.security, [key]: value } }))
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveAdminSettings({
        profile: settings.profile,
        notifications: settings.notifications,
        security: settings.security,
      })

      if (result.success) {
        toast.success("Paramètres administrateur enregistrés")
      } else {
        toast.error(result.error || "Impossible d'enregistrer les paramètres")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Paramètres</h1>
          <p className="text-slate-500 text-sm mt-1">Profil admin, alertes et sécurité du cockpit</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Enregistrement..." : "Sauvegarder"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Profil administrateur</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Nom affiché</span>
              <input value={settings.profile.name} onChange={(e) => updateProfile("name", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Rôle</span>
              <input value={settings.profile.role} onChange={(e) => updateProfile("role", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Email</span>
              <input value={settings.profile.email} onChange={(e) => updateProfile("email", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Téléphone</span>
              <input value={settings.profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20" />
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-bold text-slate-900">Notifications admin</h2>
          </div>
          <div className="space-y-3">
            {[
              ["emailNewUser", "Email nouvel utilisateur"],
              ["emailModeration", "Email modération galerie"],
              ["emailReports", "Email signalements"],
              ["pushNewUser", "Push nouvel utilisateur"],
              ["pushModeration", "Push modération"],
              ["pushReports", "Push signalements"],
              ["dailyDigest", "Digest quotidien"],
              ["weeklyReport", "Rapport hebdomadaire"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={settings.notifications[key as keyof AdminSettings["notifications"]]}
                  onChange={(e) => updateNotifications(key as keyof AdminSettings["notifications"], e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Sécurité admin</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
              <span>Préférence 2FA</span>
              <input
                type="checkbox"
                checked={settings.security.twoFactor}
                onChange={(e) => updateSecurity("twoFactor", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 block">
              <span>Expiration de session (minutes)</span>
              <input
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSecurity("sessionTimeout", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
              <span>Liste blanche IP</span>
              <input
                type="checkbox"
                checked={settings.security.ipWhitelist}
                onChange={(e) => updateSecurity("ipWhitelist", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Système</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">API / Uptime</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{settings.systemStats.serverUptime}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Base de données</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{settings.systemStats.databaseStatus}</p>
              <p className="mt-1 text-xs text-slate-500">{settings.systemStats.databaseDetail}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
