"use client"

import { TrendingUp, Eye, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { Loader2 } from "lucide-react"

export function AVendreProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAds = async () => {
      try {
        const response = await fetchWithAuth("/api/ads")
        if (response.ok) {
          const data = await response.json()
          const mappedProjects = data.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            creator: "Entrepreneur Nexus",
            location: ad.target_audience || "N/A",
            amount: `${ad.budget_limit} €`,
            shares: "N/A",
            interested: 0,
            description: ad.description,
            revenue: "N/A"
          }))
          setProjects(mappedProjects)
        }
      } catch (error) {
        console.error("Erreur chargement à vendre:", error)
      } finally {
        setLoading(false)
      }
    }
    loadAds()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement des offres...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
        <CardHeader>
          <CardTitle>Projets et Parts à Vendre</CardTitle>
          <CardDescription>Investissez dans des entreprises prometteuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700">{projects.length}</div>
              <p className="text-sm text-muted-foreground">Offres disponibles</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700">160K €</div>
              <p className="text-sm text-muted-foreground">Valeur totale</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700">405K €</div>
              <p className="text-sm text-muted-foreground">Revenus annuels</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700">25</div>
              <p className="text-sm text-muted-foreground">Intéressés</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {projects.map((project) => (
          <motion.div
            key={project.id || project.title}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="rounded-3xl h-full hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge className="rounded-xl bg-red-100 text-red-700">À vendre</Badge>
                  <Badge variant="outline" className="rounded-full">
                    {project.interested} intéressés
                  </Badge>
                </div>
                <CardTitle className="mt-4">{project.title}</CardTitle>
                <CardDescription>{project.creator} • {project.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <p className="text-sm">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{project.amount}</span>
                  <Badge variant="secondary" className="rounded-xl">
                    {project.shares} parts
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Croissance: {project.revenue}</span>
                </div>
                <Button className="w-full rounded-2xl bg-transparent" variant="outline">
                  Manifester son Intérêt
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
