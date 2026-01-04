/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dashboard principal avec sections Hero, Stats et Profils Premium
 * @created 2025-12-24
 * @updated 2025-12-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BadgeDollarSign, Briefcase, Globe, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { CardEntrepreneur } from "@/components/ui/card-entrepreneur"
import { CardProject } from "@/components/ui/card-project"
import { fetchWithAuth } from "@/lib/apiClient"
// import { entrepreneurs, projects } from "@/data/mock-data" // On utilisera les données réelles

export function DashboardContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEntrepreneurs: 0,
    activeProjects: 0,
    countriesCovered: 15,
    totalFunding: 0
  })
  const [entrepreneursList, setEntrepreneursList] = useState<any[]>([])
  const [projectsList, setProjectsList] = useState<any[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, entRes, projRes] = await Promise.all([
          fetchWithAuth("/api/dashboard/stats"),
          fetchWithAuth("/api/dashboard/featured-entrepreneurs"),
          fetchWithAuth("/api/ads")
        ])

        if (statsRes.ok) setStats(await statsRes.json())

        if (entRes.ok) {
          const entData = await entRes.json()
          setEntrepreneursList(entData.map((e: any) => ({
            id: e.user_id,
            name: `${e.first_name} ${e.last_name}`,
            role: e.role || "Membre Nexus",
            location: e.location || "Afrique de l'Ouest",
            avatar: e.avatar_url || "/african-user.jpg",
            specialty: e.specialty || "Entrepreneuriat",
            verified: true,
            premium: false,
            followers: 0
          })))
        }

        if (projRes.ok) {
          const projData = await projRes.json()
          setProjectsList(projData.slice(0, 3).map((p: any) => ({
            id: p.id,
            title: p.title,
            author: "Nexus Actor",
            location: p.target_audience || "Dakar, Sénégal",
            category: p.category === 'financement' ? 'Financement' : p.category === 'partenaire' ? 'Partenaires' : 'À vendre',
            targetAmount: p.budget_limit || 0,
            currentAmount: 0,
            progress: 0,
            daysRemaining: 30,
            contributors: 0,
            description: p.description
          })))
        }
      } catch (error) {
        console.error("Erreur chargement dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white min-h-[300px] flex flex-col justify-center"
        style={{
          backgroundImage: 'url(/dashboard/background-1.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40 rounded-3xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Réseau Pan-Africain</Badge>
            <h2 className="text-4xl font-bold">Bienvenue sur Nexus Connect</h2>
            <p className="max-w-[600px] text-white/90 text-lg">
              Cartographier et propulser 100 000 acteurs économiques ouest-africains d'ici 2027. Connectez-vous avec des
              entrepreneurs, artisans et institutions à travers l'Afrique de l'Ouest.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-2xl bg-white text-primary hover:bg-white/90 px-6 h-11"
                onClick={() => router.push("/creer-annonce")}
              >
                Créer une Annonce
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl bg-transparent border-white text-white hover:bg-white/10 px-6 h-11"
                onClick={() => router.push("/creer-profil")}
              >
                Créer mon Profil
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Entrepreneurs Connectés", value: stats.totalEntrepreneurs.toString(), sub: "Membres Nexus", icon: Users, color: "text-green-600" },
          { label: "Projets Actifs", value: stats.activeProjects.toString(), sub: "Annonces Market", icon: Briefcase, color: "text-amber-500" },
          { label: "Pays Couverts", value: stats.countriesCovered.toString(), sub: "Afrique de l'Ouest", icon: Globe, color: "text-red-600" },
          { label: "Financement Levé", value: `${stats.totalFunding} CFA`, sub: "Cette année", icon: BadgeDollarSign, color: "text-primary" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-3xl relative overflow-hidden border-none shadow-sm group hover:shadow-md transition-shadow">
            <div
              className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity"
              style={{
                backgroundImage: 'url(/dashboard/background-2.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardDescription className="hidden md:block font-medium">{stat.label}</CardDescription>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Entrepreneurs du Réseau */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Entrepreneurs du Réseau</h3>
            <p className="text-sm text-muted-foreground">Découvrez les profils premium du moment</p>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl bg-transparent"
            onClick={() => router.push("/annuaire/artisans")}
          >
            Voir Tout
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="wait">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4 p-6 border rounded-3xl bg-card">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </div>
                </div>
              ))
            ) : (
              entrepreneursList.map((entrepreneur, index) => (
                <motion.div
                  key={entrepreneur.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CardEntrepreneur entrepreneur={entrepreneur} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Projets du Market */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Projets en Vedette</h3>
            <p className="text-sm text-muted-foreground">Opportunités de financement et partenariat</p>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl bg-transparent"
            onClick={() => router.push("/market-projets/financement")}
          >
            Voir Tout
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <AnimatePresence mode="wait">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4 p-6 border rounded-3xl bg-card">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-20 rounded-xl" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mt-4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="space-y-2 pt-4">
                    <Skeleton className="h-2 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded-2xl mt-4" />
                </div>
              ))
            ) : (
              projectsList.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <CardProject project={project} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
