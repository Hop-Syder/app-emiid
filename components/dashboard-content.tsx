"use client"

import { motion } from "framer-motion"
import { BadgeDollarSign, Briefcase, Building2, Globe, MapPin, Shield, TrendingUp, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

export function DashboardContent() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{
          backgroundImage: 'url(/dashboard/background-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50 rounded-3xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Réseau Pan-Africain</Badge>
            <h2 className="text-3xl font-bold">Bienvenue sur Nexus Connect</h2>
            <p className="max-w-[600px] text-white/90">
              Cartographier et propulser 100 000 acteurs économiques ouest-africains d'ici 2027. Connectez-vous avec des
              entrepreneurs, artisans et institutions à travers l'Afrique de l'Ouest.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-2xl bg-white text-primary hover:bg-white/90"
                onClick={() => router.push("/creer-annonce")}
              >
                Créer une Annonce
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl bg-transparent border-white text-white hover:bg-white/10"
                onClick={() => router.push("/creer-profil")}
              >
                Créer mon Profil
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url(/dashboard/background-2.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardDescription className="hidden md:block">Entrepreneurs Connectés</CardDescription>
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">0 mois</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url(/dashboard/background-2.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardDescription className="hidden md:block">Projets Actifs</CardDescription>
              <Briefcase className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">0 mois</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url(/dashboard/background-2.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardDescription className="hidden md:block">Pays Couverts</CardDescription>
              <Globe className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">15</div>
            <p className="text-xs text-muted-foreground mt-1">Afrique de l'Ouest</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url(/dashboard/background-2.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardDescription className="hidden md:block">Financement Levé</CardDescription>
              <BadgeDollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">0 CFA</div>
            <p className="text-xs text-muted-foreground mt-1">0 CFA cette année</p>
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
          <Button
            variant="outline"
            className="rounded-2xl bg-transparent"
            onClick={() => router.push("/annuaire/artisans")}
          >
            Voir Tout
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Awa Diallo",
              role: "Artisan Textile",
              location: "Dakar, Sénégal",
              avatar: "/african-woman-entrepreneur.jpg",
              specialty: "Tissage traditionnel",
              verified: true,
              premium: true,
              followers: 234,
            },
            {
              name: "Kofi Mensah",
              role: "Designer Graphique",
              location: "Accra, Ghana",
              avatar: "/african-man-designer.jpg",
              specialty: "Identité visuelle",
              verified: true,
              premium: true,
              followers: 489,
            },
            {
              name: "Aminata Touré",
              role: "Fondatrice Startup",
              location: "Abidjan, Côte d'Ivoire",
              avatar: "/african-woman-ceo.jpg",
              specialty: "Fintech",
              verified: true,
              premium: false,
              followers: 1203,
            },
            {
              name: "Ibrahim Keita",
              role: "Menuisier",
              location: "Bamako, Mali",
              avatar: "/african-carpenter.jpg",
              specialty: "Mobilier sur mesure",
              verified: false,
              premium: false,
              followers: 156,
            },
            {
              name: "Fatou Ndiaye",
              role: "Photographe",
              location: "Lomé, Togo",
              avatar: "/african-photographer.jpg",
              specialty: "Portrait & Événementiel",
              verified: true,
              premium: true,
              followers: 892,
            },
            {
              name: "Youssef Traoré",
              role: "Développeur Web",
              location: "Ouagadougou, Burkina Faso",
              avatar: "/african-developer.jpg",
              specialty: "Applications Web",
              verified: true,
              premium: false,
              followers: 567,
            },
          ].map((entrepreneur) => (
            <Card
              key={entrepreneur.name}
              className={`rounded-3xl hover:shadow-xl transition-all duration-300 group ${entrepreneur.premium
                ? 'relative overflow-hidden border-2 border-transparent'
                : 'hover:shadow-lg'
                }`}
            >
              {/* Premium background */}
              {entrepreneur.premium && (
                <>
                  {/* Colored background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10" />

                  {/* Pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: 'url("/carte%20de%20profil/background-premium-1.svg")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      mixBlendMode: 'multiply',
                    }}
                  />
                </>
              )}


              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <Avatar className={`h-16 w-16 ${entrepreneur.premium ? 'ring-2 ring-primary/30' : ''}`}>
                      <AvatarImage src={entrepreneur.avatar || "/placeholder.svg"} alt={entrepreneur.name} />
                      <AvatarFallback className="text-lg">{entrepreneur.name[0]}</AvatarFallback>
                    </Avatar>
                    {entrepreneur.premium && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-accent rounded-full p-1">
                        <Badge className="h-5 w-5 rounded-full bg-white text-primary p-0 flex items-center justify-center text-xs font-bold">
                          ⭐
                        </Badge>
                      </div>
                    )}
                  </div>
                  {entrepreneur.verified && (
                    <Badge
                      variant="outline"
                      className={`rounded-full ${entrepreneur.premium
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : ''
                        }`}
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      Vérifié
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <CardTitle className={`text-xl ${entrepreneur.premium ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' : ''}`}>
                    {entrepreneur.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{entrepreneur.role}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 relative">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{entrepreneur.location}</span>
                </div>

                <Badge
                  className={`rounded-xl ${entrepreneur.premium
                    ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary'
                    : ''
                    }`}
                >
                  {entrepreneur.specialty}
                </Badge>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{entrepreneur.followers}</span>
                  </div>
                  <Button
                    size="sm"
                    className={`rounded-xl ${entrepreneur.premium
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold shadow-md'
                      : ''
                      }`}
                  >
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
          <Button
            variant="outline"
            className="rounded-2xl bg-transparent"
            onClick={() => router.push("/market-projets/financement")}
          >
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
