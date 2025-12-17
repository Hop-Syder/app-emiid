"use client"

import { NexusLayout } from "@/components/nexus-layout"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, MapPin, Save, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateProfilePage() {
  const router = useRouter()
  const [isPublished, setIsPublished] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "",
    location: "",
    specialty: "",
    bio: "",
    phone: "",
    email: "",
    website: "",
    avatar: "/african-user.jpg",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    alert("Profil enregistré avec succès!")
  }

  const handleTogglePublish = () => {
    setIsPublished(!isPublished)
    alert(isPublished ? "Profil dépublié" : "Profil publié dans l'annuaire!")
  }

  return (
    <NexusLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Créer mon Profil</h1>
              <p className="text-muted-foreground">Remplissez le formulaire pour apparaître dans l'annuaire</p>
            </div>
            <Badge variant={isPublished ? "default" : "secondary"} className="rounded-xl">
              {isPublished ? "Publié" : "Brouillon"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <Card className="rounded-3xl lg:col-span-2">
              <CardHeader>
                <CardTitle>Informations du Profil</CardTitle>
                <CardDescription>Complétez vos informations professionnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger id="category" className="rounded-2xl">
                      <SelectValue placeholder="Choisissez votre catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artisan">Artisan</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="entreprise">Entreprise</SelectItem>
                      <SelectItem value="ong">ONG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Awa Diallo"
                      className="rounded-2xl"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Titre professionnel *</Label>
                    <Input
                      id="role"
                      placeholder="Ex: Artisan Textile"
                      className="rounded-2xl"
                      value={formData.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation *</Label>
                    <Input
                      id="location"
                      placeholder="Ex: Dakar, Sénégal"
                      className="rounded-2xl"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Spécialité *</Label>
                    <Input
                      id="specialty"
                      placeholder="Ex: Tissage traditionnel"
                      className="rounded-2xl"
                      value={formData.specialty}
                      onChange={(e) => handleInputChange("specialty", e.target.value)}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez de votre parcours et de vos compétences..."
                    className="rounded-2xl min-h-[120px]"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      placeholder="+221 77 123 45 67"
                      className="rounded-2xl"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      className="rounded-2xl"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    placeholder="https://monsite.com"
                    className="rounded-2xl"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={handleSave} variant="outline" className="rounded-2xl flex-1 bg-transparent">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                  <Button
                    onClick={handleTogglePublish}
                    className="rounded-2xl flex-1"
                    variant={isPublished ? "secondary" : "default"}
                  >
                    {isPublished ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Dépublier
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Publier dans l'annuaire
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="rounded-3xl h-fit sticky top-24">
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
                <CardDescription>Votre profil tel qu'il apparaîtra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name || "Preview"} />
                    <AvatarFallback>{formData.name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <Badge variant="outline" className="rounded-full">
                    <Shield className="mr-1 h-3 w-3" />À vérifier
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{formData.name || "Votre nom"}</h3>
                  <p className="text-sm text-muted-foreground">{formData.role || "Votre titre"}</p>
                </div>

                {formData.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {formData.location}
                  </div>
                )}

                {formData.specialty && <Badge className="rounded-xl">{formData.specialty}</Badge>}

                {formData.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3 pt-2 border-t">{formData.bio}</p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                  <span>0 abonnés</span>
                  <span>0 projets</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </NexusLayout>
  )
}
