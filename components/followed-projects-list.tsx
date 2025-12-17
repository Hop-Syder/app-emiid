"use client"

import { Bookmark, Calendar, TrendingUp, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function FollowedProjectsList() {
  const followedProjects = [
    {
      title: "Expansion Atelier Textile",
      type: "Financement",
      creator: "Awa Diallo",
      location: "Dakar, Sénégal",
      amount: "15,000 €",
      goal: "25,000 €",
      progress: 60,
      dueDate: "30j restants",
      backers: 45,
      lastUpdate: "Nouveau pallier atteint : 60%",
      trending: true,
    },
    {
      title: "Startup Fintech - Parts Sociales",
      type: "À vendre",
      creator: "Aminata Touré",
      location: "Abidjan, Côte d'Ivoire",
      amount: "50,000 €",
      shares: "20%",
      interested: 8,
      lastUpdate: "3 nouvelles propositions reçues",
      trending: true,
    },
    {
      title: "Application Mobile Agricole",
      type: "Financement",
      creator: "Moussa Traoré",
      location: "Bamako, Mali",
      amount: "8,500 €",
      goal: "15,000 €",
      progress: 57,
      dueDate: "45j restants",
      backers: 32,
      lastUpdate: "Prototype démonstratif publié",
      trending: false,
    },
    {
      title: "Centre Formation Couture",
      type: "Partenaires",
      creator: "Fatou Sow",
      location: "Lomé, Togo",
      seeks: "Formateurs et sponsors",
      responses: 15,
      lastUpdate: "Nouveau partenaire confirmé",
      trending: false,
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-950 dark:to-amber-950">
        <CardHeader>
          <CardTitle>Vos projets suivis</CardTitle>
          <CardDescription>Restez informé des dernières évolutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{followedProjects.length}</div>
              <p className="text-sm text-muted-foreground">Projets suivis</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {followedProjects.filter((p) => p.trending).length}
              </div>
              <p className="text-sm text-muted-foreground">Mis à jour récemment</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {followedProjects.filter((p) => p.type === "Financement").length}
              </div>
              <p className="text-sm text-muted-foreground">En financement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {followedProjects.map((project) => (
          <Card key={project.title} className="rounded-3xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge
                  className={`rounded-xl ${
                    project.type === "Financement"
                      ? "bg-green-100 text-green-700"
                      : project.type === "Partenaires"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {project.type}
                </Badge>
                <div className="flex gap-2">
                  {project.trending && (
                    <Badge variant="outline" className="rounded-full">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Actif
                    </Badge>
                  )}
                  <Bookmark className="h-5 w-5 fill-current text-primary" />
                </div>
              </div>
              <CardTitle className="mt-4">{project.title}</CardTitle>
              <CardDescription>
                {project.creator} • {project.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.type === "Financement" && project.progress !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold">{project.amount}</span>
                    <span className="text-muted-foreground">sur {project.goal}</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {project.backers} contributeurs
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {project.dueDate}
                    </div>
                  </div>
                </div>
              )}

              {project.type === "À vendre" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{project.amount}</span>
                    <Badge variant="secondary" className="rounded-xl">
                      {project.shares} parts
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.interested} manifestations d'intérêt</p>
                </div>
              )}

              {project.type === "Partenaires" && (
                <div className="space-y-2">
                  <p className="text-sm">Recherche: {project.seeks}</p>
                  <p className="text-sm text-muted-foreground">{project.responses} réponses reçues</p>
                </div>
              )}

              <p className="text-sm italic bg-muted p-3 rounded-2xl">{project.lastUpdate}</p>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 rounded-2xl">
                  Voir le projet
                </Button>
                <Button size="sm" variant="outline" className="rounded-2xl bg-transparent">
                  Ne plus suivre
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
