"use client"

import { Building2, MessageSquare, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { Loader2 } from "lucide-react"

export function PartenairesProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAds = async () => {
      try {
        const response = await fetchWithAuth("/api/ads")
        if (response.ok) {
          const data = await response.json()
          // Filtrer par type 'partenaire' si possible, sinon on affiche tout pour l'instant
          const mappedProjects = data.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            creator: "Entrepreneur Nexus",
            location: ad.target_audience || "N/A",
            seeks: ad.category || "Partenariat local",
            responses: 0,
            description: ad.description,
            type: "Collaboration"
          }))
          setProjects(mappedProjects)
        }
      } catch (error) {
        console.error("Erreur chargement partenaires:", error)
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
        <p className="text-muted-foreground">Chargement des opportunités...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
        <CardHeader>
          <CardTitle>Opportunités de Partenariat</CardTitle>
          <CardDescription>Construisez des collaborations stratégiques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700">{projects.length}</div>
              <p className="text-sm text-muted-foreground">Opportunités</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700">
                {projects.reduce((acc, p) => acc + p.responses, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Réponses totales</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700">4</div>
              <p className="text-sm text-muted-foreground">Catégories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
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
                  <Badge className="rounded-xl bg-amber-100 text-amber-700">Partenaires</Badge>
                  <Badge variant="outline" className="rounded-full">
                    {project.responses} réponses
                  </Badge>
                </div>
                <CardTitle className="mt-4">{project.title}</CardTitle>
                <CardDescription>{project.creator} • {project.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <p className="text-sm">{project.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Partenariat: {project.seeks}</span>
                </div>
                <Button className="w-full rounded-2xl bg-transparent" variant="outline">
                  Proposer un Partenariat
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
