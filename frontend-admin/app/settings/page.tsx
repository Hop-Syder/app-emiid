"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Mail,
  Key,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Server,
  HardDrive,
  Cpu,
  RefreshCcw,
  Download,
  Upload,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

type SettingsTab = "profile" | "notifications" | "security" | "system" | "appearance"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  // Profile form state
  const [profile, setProfile] = useState({
    name: "Admin Nexus",
    email: "admin@nexusconnect.com",
    phone: "+221 77 123 45 67",
    role: "Super Admin"
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewUser: true,
    emailModeration: true,
    emailReports: true,
    pushNewUser: false,
    pushModeration: true,
    pushReports: true,
    dailyDigest: true,
    weeklyReport: true
  })

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: "30",
    ipWhitelist: false
  })

  const tabs = [
    { id: "profile" as SettingsTab, label: "Profil", icon: User },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { id: "security" as SettingsTab, label: "Securite", icon: Shield },
    { id: "system" as SettingsTab, label: "Systeme", icon: Database },
    { id: "appearance" as SettingsTab, label: "Apparence", icon: Palette },
  ]

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    toast.success("Parametres sauvegardes avec succes")
  }

  const systemStats = {
    serverUptime: "99.9%",
    dbSize: "2.4 GB",
    cpuUsage: "23%",
    memoryUsage: "67%",
    lastBackup: "Il y a 6h",
    nextBackup: "Dans 18h"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Parametres</h1>
          <p className="text-slate-500 text-sm mt-1">Gerez vos preferences et la configuration du systeme</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCcw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-100 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-100 p-6"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-6">Informations du profil</h2>
              
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  AD
                </div>
                <div>
                  <p className="font-semibold text-slate-900 mb-1">Photo de profil</p>
                  <p className="text-xs text-slate-500 mb-3">JPG, PNG ou GIF. Max 2MB.</p>
                  <button className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    Changer la photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telephone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Notifications Email</h2>
                <div className="space-y-4">
                  {[
                    { key: "emailNewUser", label: "Nouvel utilisateur", desc: "Recevoir un email quand un nouvel utilisateur s'inscrit" },
                    { key: "emailModeration", label: "Contenu a moderer", desc: "Recevoir un email pour les nouveaux contenus a valider" },
                    { key: "emailReports", label: "Signalements", desc: "Recevoir un email pour les nouveaux signalements" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors relative",
                          notifications[item.key as keyof typeof notifications] ? "bg-blue-600" : "bg-slate-300"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                          notifications[item.key as keyof typeof notifications] ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Notifications Push</h2>
                <div className="space-y-4">
                  {[
                    { key: "pushNewUser", label: "Nouvel utilisateur" },
                    { key: "pushModeration", label: "Contenu a moderer" },
                    { key: "pushReports", label: "Signalements" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors relative",
                          notifications[item.key as keyof typeof notifications] ? "bg-blue-600" : "bg-slate-300"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                          notifications[item.key as keyof typeof notifications] ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Rapports</h2>
                <div className="space-y-4">
                  {[
                    { key: "dailyDigest", label: "Resume quotidien", desc: "Recevoir un resume des activites chaque jour" },
                    { key: "weeklyReport", label: "Rapport hebdomadaire", desc: "Recevoir un rapport detaille chaque semaine" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors relative",
                          notifications[item.key as keyof typeof notifications] ? "bg-blue-600" : "bg-slate-300"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                          notifications[item.key as keyof typeof notifications] ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Changer le mot de passe</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe actuel</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <button className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
                    Mettre a jour
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Securite du compte</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">Authentification a deux facteurs</p>
                      <p className="text-xs text-slate-500">Ajouter une couche de securite supplementaire</p>
                    </div>
                    <button
                      onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                      className={cn(
                        "w-12 h-7 rounded-full transition-colors relative",
                        security.twoFactor ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                        security.twoFactor ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">Timeout de session</p>
                      <p className="text-xs text-slate-500">Deconnexion automatique apres inactivite</p>
                    </div>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="120">2 heures</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 rounded-xl border border-rose-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rose-900 mb-1">Zone dangereuse</h3>
                    <p className="text-sm text-rose-700 mb-4">Les actions ci-dessous sont irreversibles. Procedez avec precaution.</p>
                    <button className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors">
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* System Settings */}
          {activeTab === "system" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Etat du systeme</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <Server className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{systemStats.serverUptime}</p>
                    <p className="text-xs text-slate-500">Uptime serveur</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <HardDrive className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{systemStats.dbSize}</p>
                    <p className="text-xs text-slate-500">Taille BDD</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <Cpu className="h-6 w-6 text-violet-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{systemStats.cpuUsage}</p>
                    <p className="text-xs text-slate-500">Usage CPU</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <Database className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{systemStats.memoryUsage}</p>
                    <p className="text-xs text-slate-500">Memoire</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Sauvegarde des donnees</h2>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4">
                  <div>
                    <p className="font-medium text-slate-900">Derniere sauvegarde</p>
                    <p className="text-sm text-slate-500">{systemStats.lastBackup}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">Prochaine sauvegarde</p>
                    <p className="text-sm text-slate-500">{systemStats.nextBackup}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <Download className="h-4 w-4" />
                    Telecharger backup
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <Upload className="h-4 w-4" />
                    Restaurer
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <RefreshCcw className="h-4 w-4" />
                    Forcer backup
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Maintenance</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left">
                    <div>
                      <p className="font-medium text-slate-900">Vider le cache</p>
                      <p className="text-xs text-slate-500">Effacer les donnees en cache pour ameliorer les performances</p>
                    </div>
                    <Trash2 className="h-5 w-5 text-slate-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left">
                    <div>
                      <p className="font-medium text-slate-900">Optimiser la base de donnees</p>
                      <p className="text-xs text-slate-500">Reorganiser les tables pour de meilleures performances</p>
                    </div>
                    <Database className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-100 p-6"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-6">Theme et apparence</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Mode d'affichage</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="p-4 bg-white border-2 border-blue-500 rounded-xl text-center ring-2 ring-blue-500/20">
                      <div className="w-full h-12 bg-white border border-slate-200 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-xs text-slate-600">Aa</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">Clair</p>
                    </button>
                    <button className="p-4 bg-white border-2 border-slate-200 rounded-xl text-center hover:border-slate-300 transition-colors">
                      <div className="w-full h-12 bg-slate-900 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-xs text-white">Aa</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">Sombre</p>
                    </button>
                    <button className="p-4 bg-white border-2 border-slate-200 rounded-xl text-center hover:border-slate-300 transition-colors">
                      <div className="w-full h-12 bg-gradient-to-r from-white to-slate-900 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-xs text-slate-600">Auto</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">Systeme</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Langue</label>
                  <select className="w-full max-w-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer">
                    <option value="fr">Francais</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Fuseau horaire</label>
                  <select className="w-full max-w-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer">
                    <option value="Africa/Dakar">(UTC+0) Dakar</option>
                    <option value="Africa/Lagos">(UTC+1) Lagos</option>
                    <option value="Africa/Casablanca">(UTC+1) Casablanca</option>
                    <option value="Europe/Paris">(UTC+2) Paris</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ")
}
