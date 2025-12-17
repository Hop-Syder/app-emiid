"use client"

import { Clock, Bell, MapPin, TrendingUp, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FollowedProfilesList() {
  const followedProfiles = [
    {
      name: "Fatou Sow",
      role: "Couturière",
      location: "Lomé, Togo",
      avatar: "/african-woman-tailor.jpg",
      lastActive: "Il y a 2h",
      newUpdates: 3,
      lastUpdate: "Nouveau projet de collection été 2025",
      followers: 567,
    },
    {
      name: "Youssef El Mansouri",
      role: "Développeur Web",
      location: "Casablanca, Maroc",
      avatar: "/african-man-developer.jpg",
      lastActive: "Il y a 1j",
      newUpdates: 0,
      lastUpdate: "Recherche de partenaires techniques",
      followers: 892,
    },
    {
      name: "Aminata Touré",
      role: "Fondatrice Startup",
      location: "Abidjan, Côte d'Ivoire",
      avatar: "/african-woman-ceo.jpg",
      lastActive: "Il y a 5h",
      newUpdates: 1,
      lastUpdate: "Levée de fonds série A réussie",
      followers: 1203,
    },
    {
      name: "Kofi Mensah",
      role: "Designer Graphique",
      location: "Accra, Ghana",
      avatar: "/african-man-designer.jpg",
      lastActive: "Il y a 3j",
      newUpdates: 0,
      lastUpdate: "Portfolio mis à jour avec 5 nouveaux projets",
      followers: 489,
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-950 dark:to-amber-950">
        <CardHeader>
          <CardTitle>Statistiques de suivi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{followedProfiles.length}</div>
              <p className="text-sm text-muted-foreground">Profils suivis</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {followedProfiles.reduce((acc, p) => acc + p.newUpdates, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Nouvelles mises à jour</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {followedProfiles.filter((p) => p.lastActive.includes("h")).length}
              </div>
              <p className="text-sm text-muted-foreground">Actifs aujourd'hui</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {followedProfiles.map((profile) => (
          <Card key={profile.name} className="rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.role}</p>
                    </div>
                    {profile.newUpdates > 0 && (
                      <Badge className="rounded-full bg-green-100 text-green-700">
                        <Bell className="mr-1 h-3 w-3" />
                        {profile.newUpdates} {profile.newUpdates > 1 ? "mises à jour" : "mise à jour"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {profile.lastActive}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {profile.followers} abonnés
                    </div>
                  </div>

                  <p className="text-sm italic bg-muted p-3 rounded-2xl">{profile.lastUpdate}</p>

                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-2xl">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir le profil
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-2xl bg-transparent">
                      Ne plus suivre
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
