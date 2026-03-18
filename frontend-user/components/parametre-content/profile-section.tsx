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
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <CardHeader className="pb-2">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Informations du Profil</CardTitle>
                    <CardDescription className="text-sm font-medium">Mettez à jour vos informations personnelles pour mieux vous faire connaître</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-8 p-6 lg:p-8 relative z-10">
          <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] flex items-center justify-between">
              <div>
                  <h3 className="font-bold text-slate-900 mb-1">Photo de profil</h3>
                  <p className="text-xs text-slate-500">Cela sera affiché sur votre profil public</p>
              </div>
              <AvatarUpload
                currentAvatarUrl={profile.avatar_url}
                onUploadComplete={(newUrl: string) => {
                  setProfile({ ...profile, avatar_url: newUrl })
                }}
              />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="prenom" className="text-xs font-semibold text-muted-foreground ml-1">Prénom</Label>
              <Input
                id="prenom"
                value={profile.first_name || ""}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-medium text-slate-900"
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="nom" className="text-xs font-semibold text-muted-foreground ml-1">Nom</Label>
              <Input
                id="nom"
                value={profile.last_name || ""}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-medium text-slate-900"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-bold flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Briefcase className="h-4 w-4 text-primary" />
              </div>
              Titre de profession / Fonction principale
            </Label>
            <Input
              id="role"
              value={profile.role || ""}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              placeholder="Ex: Architecte d'intérieur, Développeur Fullstack..."
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-medium text-slate-900"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="specialty" className="text-sm font-bold flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Info className="h-4 w-4 text-primary" />
              </div>
              Spécialité / Courte description
            </Label>
            <Input
              id="specialty"
              value={profile.specialty || ""}
              onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              placeholder="Ex: Spécialiste en aménagement d'espaces minimalistes..."
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-medium text-slate-900"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-100">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground ml-1">Adresse Email</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ""}
                      className="h-14 pl-12 rounded-2xl bg-slate-100 border-none text-slate-500 font-medium opacity-80"
                      disabled
                    />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="telephone" className="text-xs font-semibold text-muted-foreground ml-1">Numéro de Téléphone</Label>
                <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        id="telephone" 
                        type="tel" 
                        value={profile.phone || "+223 70 12 34 56"} 
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-medium text-slate-900" 
                        placeholder="+000 00 00 00 00"
                    />
                </div>
              </div>
          </div>


          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-slate-100">
            <Button
              variant="outline"
              className="rounded-2xl h-14 px-8 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl h-14 px-10 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              {saving ? "Sauvegarde en cours..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
        <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                    <Shield className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                    <CardTitle className="text-xl font-bold tracking-tight">Statut de Vérification</CardTitle>
                    <CardDescription className="text-sm font-medium">Renforcez la confiance des clients envers votre profil</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6 lg:p-8">
          <div className="flex items-center justify-between p-5 bg-green-50/50 border border-green-100 rounded-[2rem] hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-green-50">
                  <Mail className="h-6 w-6 text-green-500" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Email validé</p>
                <p className="text-xs font-semibold text-slate-500">{profile.email}</p>
              </div>
            </div>
            <Badge className="rounded-xl px-3 py-1 bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-xs uppercase tracking-wider">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Vérifié
            </Badge>
          </div>

          <div className="flex items-center justify-between p-5 bg-green-50/50 border border-green-100 rounded-[2rem] hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-green-50">
                <Smartphone className="h-6 w-6 text-green-500" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Téléphone approuvé</p>
                <p className="text-xs font-semibold text-slate-500">{profile.phone || "+223 70 12 34 56"}</p>
              </div>
            </div>
            <Badge className="rounded-xl px-3 py-1 bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-xs uppercase tracking-wider">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Vérifié
            </Badge>
          </div>

          <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[2rem] hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <User className="h-6 w-6 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Identité professionnelle</p>
                <p className="text-xs font-semibold text-slate-400">Vérification recommandée pour plus de visibilité</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl h-10 px-4 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-all" size="sm">
              Lancer la vérification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
