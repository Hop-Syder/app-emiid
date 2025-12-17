"use client"

import { motion } from "framer-motion"
import { BadgeDollarSign, Briefcase, Building2, Globe, MapPin, Shield, TrendingUp, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-amber-500 to-red-600 p-8 text-white"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Réseau Pan-Africain</Badge>
            <h2 className="text-3xl font-bold">Bienvenue sur Nexus Connect</h2>
            <p className="max-w-[600px] text-white/80">
              Cartographier et propulser 100 000 acteurs économiques ouest-africains d'ici 2027. Connectez-vous avec des
              entrepreneurs, artisans et institutions à travers l'Afrique de l'Ouest.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-2xl bg-white text-green-700 hover:bg-white/90">Explorer le Réseau</Button>
              <Button
                variant="outline"
                className="rounded-2xl bg-transparent border-white text-white hover:bg-white/10"
              >
                Créer mon Profil
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Entrepreneurs Connectés</CardDescription>
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,458</div>
            <p className="text-xs text-muted-foreground mt-1">+2,350 ce mois</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Projets Actifs</CardDescription>
              <Briefcase className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3,847</div>
            <p className="text-xs text-muted-foreground mt-1">+890 ce mois</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Pays Couverts</CardDescription>
              <Globe className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
            <p className="text-xs text-muted-foreground mt-1">Afrique de l'Ouest</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Financement Levé</CardDescription>
              <BadgeDollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8.2M €</div>
            <p className="text-xs text-muted-foreground mt-1">+1.5M ce trimestre</p>
          </CardContent>
        </Card>
      </div>

      {/* Entrepreneurs Récents */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Entrepreneurs du Réseau</h3>
            <p className="text-sm text-muted-foreground">Découvrez les profils récemment actifs</p>
          </div>
          <Button variant="outline" className="rounded-2xl bg-transparent">
            Voir Tout
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Awa Diallo",
              role: "Artisan Textile",
              location: "Dakar, Sénégal",
              avatar: "/african-woman-entrepreneur.jpg",
              specialty: "Tissage traditionnel",
              verified: true,
              followers: 234,
            },
            {
              name: "Kofi Mensah",
              role: "Designer Graphique",
              location: "Accra, Ghana",
              avatar: "/african-man-designer.jpg",
              specialty: "Identité visuelle",
              verified: true,
              followers: 489,
            },
            {
              name: "Aminata Touré",
              role: "Fondatrice Startup",
              location: "Abidjan, Côte d'Ivoire",
              avatar: "/african-woman-ceo.jpg",
              specialty: "Fintech",
              verified: true,
              followers: 1203,
            },
            {
              name: "Ibrahim Keita",
              role: "Menuisier",
              location: "Bamako, Mali",
              avatar: "/african-carpenter.jpg",
              specialty: "Mobilier sur mesure",
              verified: false,
              followers: 156,
            },
          ].map((entrepreneur) => (
            <Card key={entrepreneur.name} className="rounded-3xl hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={entrepreneur.avatar || "/placeholder.svg"} alt={entrepreneur.name} />
                    <AvatarFallback>{entrepreneur.name[0]}</AvatarFallback>
                  </Avatar>
                  {entrepreneur.verified && (
                    <Badge variant="outline" className="rounded-full">
                      <Shield className="mr-1 h-3 w-3" />
                      Vérifié
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{entrepreneur.name}</CardTitle>
                <CardDescription>{entrepreneur.role}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {entrepreneur.location}
                </div>
                <Badge className="rounded-xl">{entrepreneur.specialty}</Badge>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">{entrepreneur.followers} abonnés</span>
                  <Button size="sm" className="rounded-xl">
                    Suivre
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Projets du Market */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Projets en Vedette</h3>
            <p className="text-sm text-muted-foreground">Opportunités de financement et partenariat</p>
          </div>
          <Button variant="outline" className="rounded-2xl bg-transparent">
            Voir Tout
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="rounded-3xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge className="rounded-xl bg-green-100 text-green-700">Financement</Badge>
                <Badge variant="outline" className="rounded-full">
                  30j restants
                </Badge>
              </div>
              <CardTitle className="mt-4">Expansion Atelier Textile</CardTitle>
              <CardDescription>Awa Diallo • Dakar, Sénégal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold">15,000 €</span>
                  <span className="text-muted-foreground">sur 25,000 €</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>45 contributeurs</span>
                <span>60% financé</span>
              </div>
              <Button className="w-full rounded-2xl">Contribuer</Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge className="rounded-xl bg-amber-100 text-amber-700">Partenaires</Badge>
                <Badge variant="outline" className="rounded-full">
                  12 réponses
                </Badge>
              </div>
              <CardTitle className="mt-4">Distribution Artisanat</CardTitle>
              <CardDescription>Kofi Mensah • Accra, Ghana</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Recherche distributeur pour l'Europe</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Partenariat commercial</span>
              </div>
              <Button className="w-full rounded-2xl bg-transparent" variant="outline">
                Proposer un Partenariat
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge className="rounded-xl bg-red-100 text-red-700">À vendre</Badge>
                <Badge variant="outline" className="rounded-full">
                  8 intéressés
                </Badge>
              </div>
              <CardTitle className="mt-4">Startup Fintech</CardTitle>
              <CardDescription>Aminata Touré • Abidjan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">50,000 €</span>
                <Badge variant="secondary" className="rounded-xl">
                  20% parts
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Croissance 150% annuelle</span>
              </div>
              <Button className="w-full rounded-2xl bg-transparent" variant="outline">
                Manifester son Intérêt
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
