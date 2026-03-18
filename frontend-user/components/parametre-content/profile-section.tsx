/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Profile information section for Settings
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarUpload } from "@/components/AvatarUpload"
import { Mail, Smartphone, User, Shield, Briefcase, Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProfileSectionProps {
  profile: any
  setProfile: (profile: any) => void
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
}

export function ProfileSection({
  profile,
  setProfile,
  saving,
  handleSave,
  handleCancel
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

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Titre de profession
            </Label>
            <Input
              id="role"
              value={profile.role || ""}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              placeholder="Ex: Développeur, Menuisier..."
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty" className="text-sm font-semibold flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Spécialité / Description courte
            </Label>
            <Input
              id="specialty"
              value={profile.specialty || ""}
              onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              placeholder="Ex: Expert en mobilier moderne..."
              className="rounded-2xl"
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
