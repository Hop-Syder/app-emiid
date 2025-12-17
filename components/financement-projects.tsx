"use client"

import { Calendar, Users, TrendingUp, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function FinancementProjects() {
  const projects = [
    {
      title: "Expansion Atelier Textile",
      creator: "Awa Diallo",
      location: "Dakar, Sénégal",
      amount: "15,000 €",
      goal: "25,000 €",
      progress: 60,
      dueDate: "30j",
      backers: 45,
      description: "Agrandissement de l'atelier et achat de nouveaux métiers à tisser",
    },
    {
      title: "Application Mobile Agricole",
      creator: "Moussa Traoré",
      location: "Bamako, Mali",
      amount: "8,500 €",
      goal: "15,000 €",
      progress: 57,
      dueDate: "45j",
      backers: 32,
      description: "Plateforme connectant agriculteurs et acheteurs locaux",
    },
    {
      title: "École de Couture Moderne",
      creator: "Fatou Sow",
      location: "Lomé, Togo",
      amount: "12,000 €",
      goal: "20,000 €",
      progress: 60,
      dueDate: "20j",
      backers: 56,
      description: "Centre de formation en couture avec équipements modernes",
    },
    {
      title: "Restaurant Gastronomique Africain",
      creator: "Chef Kwame",
      location: "Accra, Ghana",
      amount: "18,500 €",
      goal: "30,000 €",
      progress: 62,
      dueDate: "60j",
      backers: 78,
      description: "Restaurant mettant en valeur la cuisine ouest-africaine",
    },
  ]

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.title} className="rounded-3xl hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge className="rounded-xl bg-green-100 text-green-700">Financement</Badge>
              </div>
              <CardTitle className="mt-4">{project.title}</CardTitle>
              <CardDescription>
                {project.creator} • {project.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{project.description}</p>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold">{project.amount}</span>
                  <span className="text-muted-foreground">sur {project.goal}</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {project.backers}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {project.dueDate}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {project.progress}%
                </div>
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
