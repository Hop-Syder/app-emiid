"use client"

import { useState, useEffect } from "react"
import { User, Shield, Mail, Smartphone, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { LocationSelector } from "@/components/LocationSelector"
import { AvatarUpload } from "@/components/AvatarUpload"

export function ParametresContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
    avatar_url: "",
    category: "Artisan",
    role: "",
    specialty: "",
    activity_domain: "",
    country_id: "",
    country_code: "",
    country_name: "",
    city: ""
  })

  const [sectors, setSectors] = useState<{ id: string, name: string }[]>([])
  const [professions, setProfessions] = useState<{ id: string, name: string, sector_id: string }[]>([])
  const [filteredProfessions, setFilteredProfessions] = useState<{ id: string, name: string }[]>([])
  const [countries, setCountries] = useState<{ id: string, name: string, iso_code: string, is_west_africa: boolean }[]>([])

  // Charger le profil au démarrage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchWithAuth("/api/users/me")
        if (response.ok) {
          const data = await response.json()
          setProfile({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
            category: data.category || "Artisan",
            role: data.role || "",
            specialty: data.specialty || "",
            activity_domain: data.activity_domain || "",
            country_id: data.country_id || "",
            country_code: data.country_code || "",
            country_name: data.country_name || "",
            city: data.city || ""
          })
        }
      } catch (error) {
        console.error("Erreur chargement profil:", error)
        toast.error("Impossible de charger votre profil")
      } finally {
        setLoading(false)
      }
    }

    const loadReferences = async () => {
      try {
        const [secRes, profRes, countryRes] = await Promise.all([
          fetchWithAuth("/api/reference/sectors"),
          fetchWithAuth("/api/reference/professions"),
          fetchWithAuth("/api/reference/countries")
        ])
        if (secRes.ok) setSectors(await secRes.json())
        if (profRes.ok) setProfessions(await profRes.json())
        if (countryRes.ok) setCountries(await countryRes.json())
      } catch (error) {
        console.error("Erreur chargement références:", error)
      }
    }

    loadProfile()
    loadReferences()
  }, [])

  // Filtrer les professions quand le domaine change
  useEffect(() => {
    if (profile.activity_domain) {
      // On cherche l'ID du secteur correspondant au nom du domaine (ou vice versa)
      const sector = sectors.find(s => s.name === profile.activity_domain)
      if (sector) {
        setFilteredProfessions(professions.filter(p => p.sector_id === sector.id))
      } else {
        setFilteredProfessions([])
      }
    } else {
      setFilteredProfessions(professions)
    }
  }, [profile.activity_domain, sectors, professions])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetchWithAuth("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(profile)
      })
      if (response.ok) {
        toast.success("Profil mis à jour avec succès !")
      } else {
        toast.error("Erreur lors de la mise à jour")
      }
    } catch (error) {
      toast.error("Erreur réseau")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement de votre profil...</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="profil" className="space-y-6">
      <TabsList className="grid w-full max-w-[600px] grid-cols-4 rounded-2xl p-1">
        <TabsTrigger value="profil" className="rounded-xl">
          Profil
        </TabsTrigger>
        <TabsTrigger value="securite" className="rounded-xl">
          Sécurité
        </TabsTrigger>
        <TabsTrigger value="notifications" className="rounded-xl">
          Notifications
        </TabsTrigger>
        <TabsTrigger value="preferences" className="rounded-xl">
          Préférences
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profil" className="space-y-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Informations du Profil</CardTitle>
            <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AvatarUpload
              currentAvatarUrl={profile.avatar_url}
              onUploadComplete={async (newUrl: string) => {
                const updatedProfile = { ...profile, avatar_url: newUrl };
                setProfile(updatedProfile);

                // Auto-sauvegarde après l'upload
                try {
                  const response = await fetchWithAuth("/api/users/me", {
                    method: "PUT",
                    body: JSON.stringify(updatedProfile)
                  });
                  if (response.ok) {
                    toast.success("Photo de profil mise à jour !");
                  }
                } catch (error) {
                  console.error("Erreur sauvegarde avatar:", error);
                }
              }}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie de profil</Label>
                <Select
                  value={profile.category}
                  onValueChange={(val) => setProfile({ ...profile, category: val })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Artisan">Artisan</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Entreprise">Entreprise</SelectItem>
                    <SelectItem value="ONG">ONG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Titre de profession</Label>
                <Select
                  value={profile.role}
                  onValueChange={(val) => setProfile({ ...profile, role: val })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Choisir un titre..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProfessions.length > 0 ? (
                      filteredProfessions.map(p => (
                        <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="Autre">Autre</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="specialty">Description</Label>
                <Input
                  id="specialty"
                  value={profile.specialty}
                  onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                  placeholder="Ex: Expert en mobilier moderne..."
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity_domain">Domaine d'activité</Label>
                <Select
                  value={profile.activity_domain}
                  onValueChange={(val) => setProfile({ ...profile, activity_domain: val, role: "" })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Choisir un domaine..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map(s => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                className="rounded-2xl bg-muted"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" type="tel" defaultValue="+223 70 12 34 56" className="rounded-2xl" />
            </div>

            <LocationSelector
              defaultCountryCode={countries.find(c => c.id === profile.country_id)?.iso_code}
              defaultCity={profile.city}
              onLocationSelect={async (countryInfo, cityName) => {
                // Trouver l'ID du pays dans notre base locale via son code ISO
                let localCountry = countries.find(c => c.iso_code === countryInfo.isoCode);

                if (localCountry) {
                  setProfile({
                    ...profile,
                    country_id: localCountry.id,
                    country_code: countryInfo.isoCode,
                    country_name: countryInfo.name,
                    city: cityName
                  });
                } else {
                  // Si pays nouveau, on envoie le code et le nom pour que le backend le crée
                  setProfile({
                    ...profile,
                    country_id: "",
                    country_code: countryInfo.isoCode,
                    country_name: countryInfo.name,
                    city: cityName
                  });
                }
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="w-full min-h-[100px] rounded-2xl border border-input bg-background px-3 py-2 text-sm"
                placeholder="Parlez-nous de vous..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-2xl bg-transparent">
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-2xl"
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Statut de Vérification</CardTitle>
            <CardDescription>Améliorez la confiance de votre profil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Email vérifié</p>
                  <p className="text-sm text-muted-foreground">mohamed.keita@example.com</p>
                </div>
              </div>
              <Badge className="rounded-full bg-green-100 text-green-700">
                <Shield className="mr-1 h-3 w-3" />
                Vérifié
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Téléphone vérifié</p>
                  <p className="text-sm text-muted-foreground">+223 70 12 34 56</p>
                </div>
              </div>
              <Badge className="rounded-full bg-green-100 text-green-700">
                <Shield className="mr-1 h-3 w-3" />
                Vérifié
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Identité professionnelle</p>
                  <p className="text-sm text-muted-foreground">Non vérifié</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-2xl bg-transparent" size="sm">
                Vérifier
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent >

      <TabsContent value="securite" className="space-y-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Mot de passe</CardTitle>
            <CardDescription>Modifiez votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input id="current-password" type="password" className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" className="rounded-2xl" />
            </div>
            <Button className="rounded-2xl">Mettre à jour le mot de passe</Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Authentification à deux facteurs</CardTitle>
            <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">Authentification SMS</p>
                <p className="text-sm text-muted-foreground">Recevez un code par SMS</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">Application d'authentification</p>
                <p className="text-sm text-muted-foreground">Utilisez une app comme Google Authenticator</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Zone de danger</CardTitle>
            <CardDescription>Actions irréversibles sur votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-2xl">
              <div>
                <p className="font-medium">Désactiver le compte</p>
                <p className="text-sm text-muted-foreground">Votre compte sera temporairement désactivé</p>
              </div>
              <Button variant="outline" className="rounded-2xl border-red-200 text-red-600 bg-transparent">
                Désactiver
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-2xl">
              <div>
                <p className="font-medium">Supprimer le compte</p>
                <p className="text-sm text-muted-foreground">Suppression définitive de toutes vos données</p>
              </div>
              <Button variant="destructive" className="rounded-2xl">
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Préférences de notifications</CardTitle>
            <CardDescription>Choisissez comment vous souhaitez être informé</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">Nouveaux messages</p>
                <p className="text-sm text-muted-foreground">Notifications pour les nouveaux messages</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">Activité du réseau</p>
                <p className="text-sm text-muted-foreground">Mises à jour des profils suivis</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">Projets MarketProjets</p>
                <p className="text-sm text-muted-foreground">Nouveaux projets correspondant à vos intérêts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">Newsletter hebdomadaire</p>
                <p className="text-sm text-muted-foreground">Résumé des actualités du réseau</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-sm text-muted-foreground">Notifications sur mobile</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="preferences" className="space-y-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Préférences générales</CardTitle>
            <CardDescription>Personnalisez votre expérience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="langue">Langue</Label>
              <Select defaultValue="fr">
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="devise">Devise</Label>
              <Select defaultValue="eur">
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="xof">XOF (CFA)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuseau">Fuseau horaire</Label>
              <Select defaultValue="gmt">
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmt">GMT (Accra, Dakar)</SelectItem>
                  <SelectItem value="wat">WAT (Lagos, Abidjan)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">Mode sombre</p>
                <p className="text-sm text-muted-foreground">Activer le thème sombre</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">Profil public</p>
                <p className="text-sm text-muted-foreground">Visible dans les recherches</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button className="rounded-2xl">Enregistrer les préférences</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs >
  )
}
