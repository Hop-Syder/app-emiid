"use client"

import { Building2, MessageSquare, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PartenairesProjects() {
  const projects = [
    {
      title: "Partenariat Distribution Artisanat",
      creator: "Kofi Mensah",
      location: "Accra, Ghana",
      seeks: "Distributeur Europe",
      responses: 12,
      description: "Recherche partenaire pour distribuer produits artisanaux en Europe",
      type: "Distribution",
    },
    {
      title: "Centre Formation Couture",
      creator: "Fatou Sow",
      location: "Lomé, Togo",
      seeks: "Formateurs et sponsors",
      responses: 15,
      description: "Partenariat pour former jeunes couturières",
      type: "Formation",
    },
    {
      title: "Export Produits Bio",
      creator: "Bio Sahel",
      location: "Ouagadougou, Burkina Faso",
      seeks: "Importateurs internationaux",
      responses: 8,
      description: "Recherche partenaires pour export produits biologiques",
      type: "Export",
    },
    {
      title: "Réseau Épiceries Locales",
      creator: "Fresh Market",
      location: "Bamako, Mali",
      seeks: "Producteurs locaux",
      responses: 23,
      description: "Partenariat avec agriculteurs pour approvisionnement",
      type: "Approvisionnement",
    },
  ]

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.title} className="rounded-3xl hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge className="rounded-xl bg-amber-100 text-amber-700">Partenaires</Badge>
              </div>
              <CardTitle className="mt-4">{project.title}</CardTitle>
              <CardDescription>
                {project.creator} • {project.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{project.description}</p>

              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Recherche:</span>
                <span className="text-muted-foreground">{project.seeks}</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-xl">
                  {project.type}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  {project.responses} réponses
                </Badge>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 rounded-2xl">Détails</Button>
                <Button variant="outline" className="flex-1 rounded-2xl bg-transparent">
                  <Heart className="mr-1 h-3 w-3" />
                  Suivre
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
