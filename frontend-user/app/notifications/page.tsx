/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page des notifications et de l'activité
 * @created 2026-06-01
 */

import { RecentActivitySection } from "@/components/dashboard-user-content/recent-activity-section"
import { Bell, Settings } from "lucide-react"

export const metadata = {
  title: "Notifications | EmiID",
  description: "Vos notifications et activité récente sur EmiID",
}

export default function NotificationsPage() {
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col bg-slate-50">
      {/* HEADER SIMPLE */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <Bell className="w-6 h-6 text-slate-800" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* COLONNE GAUCHE (Activité Récente) */}
          <div className="md:col-span-8 space-y-6">
            <RecentActivitySection />
            
            {/* AUTRE CHOSES (Placeholder) */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-4">Mises à jour du réseau</h3>
              <div className="py-8 text-center text-slate-500">
                <p>Aucune nouvelle mise à jour pour le moment.</p>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE (Filtres ou Infos) */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-4">Gérer vos alertes</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-700">Nouveaux abonnés</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-700">Visites du profil</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
