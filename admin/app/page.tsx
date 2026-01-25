/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dashboard principal de l'administration Nexus Connect
 * @created 2026-01-25
*/

"use client"

import { useState, useEffect } from "react"
import { Users, FileText, Globe, DollarSign, Loader2, ShieldCheck, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // On réutilise l'API publique pour les stats globales pour l'instant
        const res = await fetch("http://localhost:5000/api/public/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  const cards = [
    { title: "Utilisateurs", value: stats?.totalEntrepreneurs || 0, icon: <Users className="w-6 h-6" />, color: "bg-blue-500" },
    { title: "Projets Actifs", value: stats?.activeProjects || 0, icon: <FileText className="w-6 h-6" />, color: "bg-green-500" },
    { title: "Pays Couverts", value: stats?.countriesCovered || 0, icon: <Globe className="w-6 h-6" />, color: "bg-purple-500" },
    { title: "Financement Total", value: `${stats?.totalFunding || 0} FCFA`, icon: <DollarSign className="w-6 h-6" />, color: "bg-amber-500" },
  ]

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de Bord Admin</h1>
          <p className="text-gray-500 mt-1">Bienvenue sur le centre de contrôle Nexus Connect.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Incidents (0)
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
            Exporter les rapports
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${card.color} p-3 rounded-2xl text-white`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dernières Inscriptions (Placeholder UI) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-blue-600" />
              Vérifications en attente
            </h2>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Voir tout</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">U</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Utilisateur #{i}</p>
                    <p className="text-xs text-gray-500">Inscrit le 24 Jan. 2026</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-100">Rejeter</button>
                  <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Approuver</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité Réseau */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Activité du Réseau</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 font-medium italic">Graphique de croissance (Visualisation à venir)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
