"use client"

import { Shield, MapPin, TrendingUp, Filter, Search, Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Profile {
  name: string
  role: string
  location: string
  avatar: string
  specialty: string
  verified: boolean
  followers: number
  projects: number
}

interface ProfilesGridProps {
  profiles: Profile[]
  category: string
}

export function ProfilesGrid({ profiles, category }: ProfilesGridProps) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Affinez votre recherche</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un profil..." className="pl-9 rounded-2xl" />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-[200px] rounded-2xl">
                <SelectValue placeholder="Localisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                <SelectItem value="senegal">Sénégal</SelectItem>
                <SelectItem value="ghana">Ghana</SelectItem>
                <SelectItem value="mali">Mali</SelectItem>
                <SelectItem value="cote-ivoire">Côte d'Ivoire</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[200px] rounded-2xl">
                <SelectValue placeholder="Vérification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="verified">Vérifiés uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {profiles.length} profil{profiles.length > 1 ? "s" : ""} trouvé{profiles.length > 1 ? "s" : ""}
        </p>
        <Button variant="outline" className="rounded-2xl bg-transparent" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Plus de filtres
        </Button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {profiles.map((profile) => (
          <Card key={profile.name} className="rounded-3xl hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                {profile.verified && (
                  <Badge variant="outline" className="rounded-full">
                    <Shield className="mr-1 h-3 w-3" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-4">{profile.name}</CardTitle>
              <CardDescription>{profile.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {profile.location}
              </div>
              <Badge className="rounded-xl">{profile.specialty}</Badge>
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{profile.followers} abonnés</span>
                </div>
                <span>{profile.projects} projets</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 rounded-2xl">
                  Voir Profil
                </Button>
                <Button size="sm" variant="outline" className="flex-1 rounded-2xl bg-transparent">
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
