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
import { Save, Send, DollarSign, Users, ShoppingBag } from "lucide-react"

export default function CreateAnnoncePage() {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    amount: "",
    location: "",
    deadline: "",
    category: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    alert("Annonce enregistrée avec succès!")
  }

  const handlePublish = () => {
    alert("Annonce publiée dans le Market!")
  }

  const getIcon = () => {
    switch (formData.type) {
      case "financement":
        return <DollarSign className="h-5 w-5" />
      case "partenaire":
        return <Users className="h-5 w-5" />
      case "vente":
        return <ShoppingBag className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <NexusLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Créer une Annonce</h1>
            <p className="text-muted-foreground">Publiez votre projet sur le Market</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <Card className="rounded-3xl lg:col-span-2">
              <CardHeader>
                <CardTitle>Détails de l'Annonce</CardTitle>
                <CardDescription>Remplissez les informations de votre projet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="type">Type d'annonce *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger id="type" className="rounded-2xl">
                      <SelectValue placeholder="Choisissez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financement">Recherche de Financement</SelectItem>
                      <SelectItem value="partenaire">Recherche de Partenaire</SelectItem>
                      <SelectItem value="vente">À Vendre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du projet *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Expansion Atelier Textile"
                    className="rounded-2xl"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre projet en détail..."
                    className="rounded-2xl min-h-[150px]"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      {formData.type === "financement" ? "Montant recherché" : "Montant"} (€)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Ex: 25000"
                      className="rounded-2xl"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      placeholder="Ex: Dakar, Sénégal"
                      className="rounded-2xl"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Date limite</Label>
                    <Input
                      id="deadline"
                      type="date"
                      className="rounded-2xl"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange("deadline", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger id="category" className="rounded-2xl">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="textile">Textile</SelectItem>
                        <SelectItem value="tech">Technologie</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="artisanat">Artisanat</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={handleSave} variant="outline" className="rounded-2xl flex-1 bg-transparent">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer le brouillon
                  </Button>
                  <Button onClick={handlePublish} className="rounded-2xl flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Publier l'annonce
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="rounded-3xl h-fit sticky top-24">
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
                <CardDescription>Votre annonce dans le Market</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  {formData.type && (
                    <Badge
                      className={`rounded-xl ${
                        formData.type === "financement"
                          ? "bg-green-100 text-green-700"
                          : formData.type === "partenaire"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {getIcon()}
                      <span className="ml-1">
                        {formData.type === "financement"
                          ? "Financement"
                          : formData.type === "partenaire"
                            ? "Partenaire"
                            : "À vendre"}
                      </span>
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{formData.title || "Titre du projet"}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {formData.description || "Description du projet..."}
                  </p>
                </div>

                {formData.amount && <div className="text-2xl font-bold text-green-600">{formData.amount} €</div>}

                {formData.category && <Badge className="rounded-xl">{formData.category}</Badge>}

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                  <span>{formData.location || "Localisation"}</span>
                  {formData.deadline && <span>Échéance: {formData.deadline}</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </NexusLayout>
  )
}
