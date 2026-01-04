"use client"

import { Calendar, Users, TrendingUp, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { Loader2 } from "lucide-react"

export function FinancementProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAds = async () => {
      try {
        const response = await fetchWithAuth("/api/ads")
        if (response.ok) {
          const data = await response.json()
          // Filtrer par catégorie ou type si nécessaire, ici on prend tout pour l'exemple
          const mappedProjects = data.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            creator: "Entrepreneur Nexus", // À améliorer avec une jointure profile
            location: ad.target_audience || "N/A",
            amount: "0 €", // Donnée non disponible pour le moment
            goal: `${ad.budget_limit} €`,
            progress: 0,
            dueDate: "En cours",
            backers: 0,
            description: ad.description,
            category: ad.category
          }))
          setProjects(mappedProjects)
        }
      } catch (error) {
        console.error("Erreur chargement market:", error)
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
        <p className="text-muted-foreground">Chargement des projets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardHeader>
          <CardTitle>Projets en Financement</CardTitle>
          <CardDescription>Soutenez des projets entrepreneuriaux prometteurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{projects.length}</div>
              <p className="text-sm text-muted-foreground">Projets actifs</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">142K €</div>
              <p className="text-sm text-muted-foreground">Total recherché</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">85K €</div>
              <p className="text-sm text-muted-foreground">Déjà levé</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">211</div>
              <p className="text-sm text-muted-foreground">Contributeurs</p>
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
                  <Badge className="rounded-xl bg-green-100 text-green-700">Financement</Badge>
                  <Badge variant="outline" className="rounded-full">
                    {project.dueDate} restants
                  </Badge>
                </div>
                <CardTitle className="mt-4">{project.title}</CardTitle>
                <CardDescription>{project.creator} • {project.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <p className="text-sm">{project.description}</p>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold">{project.amount}</span>
                    <span className="text-muted-foreground">sur {project.goal}</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{project.backers} contributeurs</span>
                  <span>{project.progress}% financé</span>
                </div>
                <Button className="w-full rounded-2xl">Contribuer</Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
