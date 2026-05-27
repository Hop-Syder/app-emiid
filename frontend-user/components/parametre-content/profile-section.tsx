/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Profile information section for Settings
 * @created 2026-01-16
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarUpload } from "@/components/AvatarUpload"
import { fetchWithAuth } from "@/lib/apiClient"
import { Mail, Smartphone, User, Shield, MessageSquare, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface UserProfile {
  phone_verified?: boolean;
  country_code?: string;
  country_name?: string;
}

interface ProfileSectionProps {
  profile: any;
  setProfile: any;
  saving: boolean;
  handleSave: () => void;
  handleCancel: () => void;
}

export function ProfileSection({
  profile,
  setProfile,
  saving,
  handleSave,
  handleCancel
}: ProfileSectionProps) {
  const [verifyMethod, setVerifyMethod] = useState<"whatsapp" | "sms" | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [verifying, setVerifying] = useState(false)

  const handleVerifyRequest = async (method: "whatsapp" | "sms") => {
    if (!profile.phone) {
        toast.error("Veuillez saisir votre numéro de téléphone d'abord")
        return
    }
    
    try {
        const res = await fetchWithAuth("/api/users/phone/request", {
            method: "POST",
            body: JSON.stringify({ phone: profile.phone, method })
        })
        
        if (res.ok) {
            setVerifyMethod(method)
            toast.success(`Code envoyé par ${method}`)
        } else {
            const err = await res.json()
            toast.error(err.error || "Erreur lors de l'envoi du code")
        }
    } catch (_error) {
        toast.error("Erreur de connexion au serveur")
    }
  }

  const handleVerifySubmit = async () => {
    if (otpCode.length < 6) return
    setVerifying(true)
    
    try {
        const res = await fetchWithAuth("/api/users/phone/verify", {
            method: "POST",
            body: JSON.stringify({ phone: profile.phone, code: otpCode })
        })
        
        if (res.ok) {
            setProfile({ ...profile, phone_verified: true })
            setVerifyMethod(null)
            setOtpCode("")
            toast.success("Téléphone vérifié avec succès !")
        } else {
            const err = await res.json()
            toast.error(err.error || "Code incorrect ou expiré")
        }
    } catch (_error) {
        toast.error("Erreur technique lors de la vérification")
    } finally {
        setVerifying(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <Card className="rounded-xl md:rounded-xl border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <CardHeader className="pb-2">
            <div className="flex items-center gap-3 md:gap-4 mb-2">
                <div className="p-2.5 md:p-3 bg-primary/10 rounded-xl md:rounded-xl shrink-0">
                    <User className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">Informations du Profil</CardTitle>
                    <CardDescription className="text-xs md:text-sm font-medium">Mettez à jour vos informations personnelles pour mieux vous faire connaître</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 md:space-y-8 p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="p-4 md:p-6 bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="prenom" className="text-xs font-semibold text-muted-foreground ml-1">Prénom</Label>
              <Input
                id="prenom"
                name="given-name"
                autoComplete="given-name"
                value={profile.first_name || ""}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-medium text-slate-900"
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="nom" className="text-xs font-semibold text-muted-foreground ml-1">Nom</Label>
              <Input
                id="nom"
                name="family-name"
                autoComplete="family-name"
                value={profile.last_name || ""}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-medium text-slate-900"
                placeholder="Votre nom"
              />
            </div>
          </div>


          <div className="grid gap-4 md:gap-6 md:grid-cols-2 pt-4 md:pt-6 border-t border-slate-100">
              <div className="space-y-2 md:space-y-3">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground ml-1">Adresse Email</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      autoComplete="email"
                      type="email"
                      value={profile.email || ""}
                      className="h-12 md:h-14 pl-12 rounded-xl bg-slate-100 border-none text-slate-500 font-medium opacity-80"
                      disabled
                    />
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <Label htmlFor="telephone" className="text-xs font-semibold text-muted-foreground ml-1">Numéro de Téléphone</Label>
                <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        id="telephone" 
                        name="tel"
                        autoComplete="tel"
                        type="tel" 
                        value={profile.phone || ""} 
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="h-12 md:h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-medium text-slate-900" 
                        placeholder="Ex: +229 XXXXXXXXXX"
                    />
                </div>

                {/* Bloc de vérification de téléphone */}
                {profile.phone && profile.phone.length > 5 && (
                  <div className="mt-4">
                    {profile.phone_verified ? (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/80 w-fit px-3 sm:px-4 py-2 rounded-xl border border-emerald-200 shadow-sm animate-in fade-in zoom-in">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs sm:text-sm font-bold">Numéro certifié</span>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in">
                        {!verifyMethod ? (
                          <div className="p-4 sm:p-5 rounded-2xl border border-rose-200 bg-rose-50/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600" />
                              <span className="text-sm font-bold text-rose-800">Numéro non vérifié</span>
                            </div>
                            <p className="text-xs sm:text-sm text-rose-700/80 mb-4 font-medium">Veuillez sécuriser votre compte en confirmant ce numéro pour accéder à toutes les fonctionnalités EmiID.</p>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <Button 
                                type="button"
                                variant="outline" 
                                className="flex-1 h-11 sm:h-12 border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 rounded-xl justify-start shadow-sm transition-transform active:scale-95"
                                onClick={() => handleVerifyRequest("whatsapp")}
                              >
                                <img src="/svg/whatsapp-logo.svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-3" alt="WhatsApp" /> 
                                <span className="font-bold">WhatsApp</span>
                                <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                              </Button>
                              <Button 
                                type="button"
                                variant="outline" 
                                className="flex-1 h-11 sm:h-12 border-blue-200 text-blue-800 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 rounded-xl justify-start shadow-sm transition-transform active:scale-95"
                                onClick={() => handleVerifyRequest("sms")}
                              >
                                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-blue-600" /> 
                                <span className="font-bold">SMS</span>
                                <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200 bg-indigo-50/50 shadow-md animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-2 mb-2 text-indigo-900">
                              {verifyMethod === 'whatsapp' ? <img src="/svg/whatsapp-logo.svg" className="h-5 w-5" alt="WhatsApp" /> : <MessageSquare className="h-5 w-5 text-blue-600" />}
                              <span className="text-sm font-bold">Code de vérification envoyé</span>
                            </div>
                            <p className="text-xs sm:text-sm text-indigo-700/80 mb-5 font-medium leading-relaxed">
                              Veuillez entrer le code à 6 chiffres que vous venez de recevoir sur <strong className="text-indigo-950 px-1 py-0.5 bg-indigo-100 rounded">{profile.phone}</strong>.
                            </p>
                            
                            <div className="flex flex-col gap-4">
                              <Input 
                                id="phone-verification-code"
                                name="phone_verification_code"
                                autoComplete="one-time-code"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="0 0 0 0 0 0"
                                maxLength={6}
                                className="h-14 sm:h-16 text-center text-2xl sm:text-3xl tracking-[0.5em] sm:tracking-[0.7em] font-black rounded-xl border-indigo-200 focus:ring-indigo-500 bg-white placeholder:text-slate-200 shadow-sm"
                              />
                              <div className="flex gap-2 sm:gap-3">
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  className="h-11 sm:h-12 px-4 sm:px-6 text-slate-500 hover:bg-slate-100 rounded-xl font-bold"
                                  onClick={() => { setVerifyMethod(null); setOtpCode(""); }}
                                >
                                  Annuler
                                </Button>
                                <Button 
                                  type="button"
                                  className="flex-1 h-11 sm:h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-black tracking-wide transition-all active:scale-95 disabled:opacity-50"
                                  onClick={handleVerifySubmit}
                                  disabled={otpCode.length < 6 || verifying}
                                >
                                  {verifying ? "Vérification..." : "Confirmer le code"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
          </div>


          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 pt-6 md:pt-8 border-t border-slate-100">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-xl h-12 md:h-14 px-8 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto rounded-xl h-12 md:h-14 px-10 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              {saving ? "Sauvegarde en cours..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl md:rounded-xl border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
        <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 bg-indigo-50 rounded-xl md:rounded-xl shrink-0">
                    <Shield className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" />
                </div>
                <div>
                    <CardTitle className="text-lg md:text-xl font-bold tracking-tight">Statut de Vérification</CardTitle>
                    <CardDescription className="text-xs md:text-sm font-medium">Renforcez la confiance des clients envers votre profil</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-green-50/50 border border-green-100 rounded-xl md:rounded-xl gap-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 bg-white rounded-xl md:rounded-xl shadow-sm border border-green-50 shrink-0">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Email validé</p>
                <p className="text-xs font-semibold text-slate-500">{profile.email}</p>
              </div>
            </div>
            <Badge className="w-fit rounded-xl px-3 py-1 bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-xs uppercase tracking-wider">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Vérifié
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-green-50/50 border border-green-100 rounded-xl md:rounded-xl gap-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 bg-white rounded-xl md:rounded-xl shadow-sm border border-green-50 shrink-0">
                <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Téléphone approuvé</p>
                <p className="text-xs font-semibold text-slate-500">{profile.phone || "+223 70 12 34 56"}</p>
              </div>
            </div>
            {profile.phone_verified ? (
              <Badge className="w-fit rounded-xl px-3 py-1 bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-xs uppercase tracking-wider">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Vérifié
              </Badge>
            ) : (
              <Badge variant="outline" className="w-fit rounded-xl px-3 py-1 border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                Non vérifié
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-slate-50 border border-slate-100 rounded-xl md:rounded-xl gap-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 bg-white rounded-xl md:rounded-xl shadow-sm border border-slate-100 shrink-0">
                <User className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 leading-tight">Identité professionnelle</p>
                <p className="text-xs font-semibold text-slate-400">Vérification recommandée pour plus de visibilité</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto rounded-xl h-10 md:h-12 px-4 md:px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-all" 
              size="sm"
              onClick={() => toast.info("Bientôt disponible", { description: "Le service de vérification d'identité (KYC) sera activé prochainement." })}
            >
              Lancer la vérification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
