"use client"

import { TrendingUp, Eye, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export function AVendreProjects() {
  const projects = [
    {
      title: "Startup Fintech - Parts Sociales",
      creator: "Aminata Touré",
      location: "Abidjan, Côte d'Ivoire",
      amount: "50,000 €",
      shares: "20%",
      interested: 8,
      description: "Plateforme de paiement mobile, croissance 150% annuelle",
      revenue: "120K €/an",
    },
    {
      title: "Entreprise E-commerce Mode",
      creator: "Fashion Hub",
      location: "Dakar, Sénégal",
      amount: "35,000 €",
      shares: "15%",
      interested: 12,
      description: "Marketplace mode africaine, 5000+ clients actifs",
      revenue: "85K €/an",
    },
    {
      title: "Agence Marketing Digital",
      creator: "Digital West Africa",
      location: "Lagos, Nigeria",
      amount: "75,000 €",
      shares: "25%",
      interested: 5,
      description: "Agence établie, 30+ clients réguliers",
      revenue: "200K €/an",
    },
  ]

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
            key={project.title}
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
