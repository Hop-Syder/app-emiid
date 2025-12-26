"use client"

import { Shield, MapPin, TrendingUp, Filter, Search, Heart, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

interface Profile {
  name: string
  role: string
  location: string
  avatar: string
  specialty: string
  verified: boolean
  followers: number
  projects: number
  premium?: boolean
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
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {profiles.map((profile) => (
          <motion.div
            key={profile.name}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`rounded-3xl h-full hover:shadow-xl transition-all duration-300 group ${profile.premium
              ? 'relative overflow-hidden border-2 border-transparent'
              : 'hover:shadow-lg'
              }`}>
              {/* Premium background */}
              {profile.premium && (
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
                    <Avatar className={`h-16 w-16 ${profile.premium ? 'ring-2 ring-primary/30' : ''}`}>
                      <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                      <AvatarFallback className="text-lg">{profile.name[0]}</AvatarFallback>
                    </Avatar>
                    {profile.premium && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-accent rounded-full p-1">
                        <Badge className="h-5 w-5 rounded-full bg-white text-primary p-0 flex items-center justify-center text-xs font-bold">
                          ⭐
                        </Badge>
                      </div>
                    )}
                  </div>
                  {profile.verified && (
                    <Badge
                      variant="outline"
                      className={`rounded-full ${profile.premium
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
                  <CardTitle className={`text-xl ${profile.premium ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' : ''}`}>
                    {profile.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{profile.role}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 relative flex-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </div>

                <Badge
                  className={`rounded-xl ${profile.premium
                    ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary'
                    : ''
                    }`}
                >
                  {profile.specialty}
                </Badge>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{profile.followers}</span>
                  </div>
                  <Button
                    size="sm"
                    className={`rounded-xl ${profile.premium
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold shadow-md'
                      : ''
                      }`}
                  >
                    Suivre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
