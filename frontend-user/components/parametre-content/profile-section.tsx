/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Profile information section for Settings
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarUpload } from "@/components/AvatarUpload"
import { SmartSelect } from "@/components/SmartSelect"
import { LocationSelector } from "@/components/LocationSelector"
import { Mail, Smartphone, User, Shield } from "lucide-react"

interface ProfileSectionProps {
  profile: any
  setProfile: (profile: any) => void
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
  countries: any[]
}

export function ProfileSection({
  profile,
  setProfile,
  saving,
  handleSave,
  handleCancel,
  countries
}: ProfileSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Informations du Profil</CardTitle>
          <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            onUploadComplete={(newUrl: string) => {
              setProfile({ ...profile, avatar_url: newUrl })
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
            <SmartSelect
              table="jobs"
              label="Titre de profession"
              value={profile.role}
              onChange={(val) => setProfile({ ...profile, role: val })}
              placeholder="Ex: Développeur, Menuisier..."
            />
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
            <SmartSelect
              table="industries"
              label="Domaine d'activité"
              value={profile.activity_domain}
              onChange={(val) => setProfile({ ...profile, activity_domain: val, role: "" })}
              placeholder="Ex: Informatique, BTP..."
            />
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
            onLocationSelect={(countryInfo, cityName) => {
              let localCountry = countries.find(c => c.iso_code === countryInfo.isoCode)
              if (localCountry) {
                setProfile({
                  ...profile,
                  country_id: localCountry.id,
                  country_code: countryInfo.isoCode,
                  country_name: countryInfo.name,
                  city: cityName
                })
              } else {
                setProfile({
                  ...profile,
                  country_id: "",
                  country_code: countryInfo.isoCode,
                  country_name: countryInfo.name,
                  city: cityName
                })
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
            <Button
              variant="outline"
              className="rounded-2xl bg-transparent"
              onClick={handleCancel}
            >
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
                <p className="text-sm text-muted-foreground">{profile.email}</p>
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
    </div>
  )
}
