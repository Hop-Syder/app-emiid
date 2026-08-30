/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section Profil de la page de paramètres. Entièrement typée et épurée.
 * @created 2026-06-13
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import Image from "next/image"
import { Mail, Smartphone, User, Shield, MessageSquare, CheckCircle2, AlertCircle, Loader2, MapPin, ExternalLink, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AvatarUpload } from "@/components/AvatarUpload"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { PROFILE_CATEGORIES, ACTIVITY_DOMAINS } from "@/lib/profile-options"
import type { UserProfileData } from "@/hooks/use-settings"
import { LocationMapPicker } from "./location-map-picker"

interface ProfileSectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
  /** Masque la barre d'actions quand une autre section enregistre déjà. */
  hideActions?: boolean
}

const INPUT = "h-11 rounded-xl bg-muted border-border text-sm font-medium text-foreground focus:ring-primary/20 transition-all placeholder:text-slate-400"
const SELECT = "w-full h-11 px-3 rounded-xl bg-muted border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
      <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5">{title}</h2>
      {children}
    </div>
  )
}

export function ProfileSection({ profile, setProfile, saving, handleSave, handleCancel, hideActions = false }: ProfileSectionProps) {
  const [verifyMethod, setVerifyMethod] = useState<"whatsapp" | "sms" | null>(null)
  const [otpCode,      setOtpCode]      = useState("")
  const [verifying,    setVerifying]    = useState(false)
  const [locating,     setLocating]     = useState(false)

  const up = (key: keyof UserProfileData, value: string | boolean | number | null) => setProfile({ ...profile, [key]: value })

  // 6 décimales ≈ 0,11 m de précision : largement suffisant pour un lieu, et
  // l'on évite les longues valeurs illisibles renvoyées par le GPS du navigateur.
  const round6 = (n: number) => Math.round(n * 1e6) / 1e6

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Les deux coordonnées sont posées en une seule mise à jour : deux appels
        // successifs à `up` repartiraient du même `profile` figé et la seconde
        // écraserait la première (latitude perdue).
        setProfile({
          ...profile,
          latitude: round6(position.coords.latitude),
          longitude: round6(position.coords.longitude),
        })
        setLocating(false)
        toast.success("Position récupérée avec succès")
      },
      () => {
        setLocating(false)
        toast.error("Impossible de récupérer la position. Assurez-vous d'avoir autorisé l'accès.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  /** Vide les coordonnées enregistrées. */
  const clearLocation = () => setProfile({ ...profile, latitude: null, longitude: null })

  const hasCoords = profile.latitude != null && profile.longitude != null

  /** Au blur d'une saisie manuelle : borne la valeur au domaine valide et arrondit. */
  const commitCoord = (key: "latitude" | "longitude", min: number, max: number) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw === "") { up(key, null); return }
      const n = parseFloat(raw)
      if (Number.isNaN(n)) { up(key, null); return }
      up(key, Math.min(max, Math.max(min, round6(n))))
    }

  const handleVerifyRequest = async (method: "whatsapp" | "sms") => {
    if (!profile.phone) { toast.error("Saisissez votre numéro d'abord"); return }
    try {
      const res = await fetchWithAuth("/api/users/phone/request", {
        method: "POST",
        body: JSON.stringify({ phone: profile.phone, method }),
      })
      if (res.ok) { setVerifyMethod(method); toast.success(`Code envoyé par ${method}`) }
      else        { const e = await res.json(); toast.error(e.error || "Erreur lors de l'envoi") }
    } catch { toast.error("Erreur de connexion") }
  }

  const handleVerifySubmit = async () => {
    if (otpCode.length < 6) return
    setVerifying(true)
    try {
      const res = await fetchWithAuth("/api/users/phone/verify", {
        method: "POST",
        body: JSON.stringify({ phone: profile.phone, code: otpCode }),
      })
      if (res.ok) {
        setProfile({ ...profile, phone_verified: true })
        setVerifyMethod(null)
        setOtpCode("")
        toast.success("Téléphone vérifié !")
      } else {
        const e = await res.json()
        toast.error(e.error || "Code incorrect ou expiré")
      }
    } catch { toast.error("Erreur technique") }
    finally   { setVerifying(false) }
  }

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Votre nom"

  return (
    <div className="space-y-4">

      {/* ── Photo ───────────────────────────────────────────────────────────── */}
      <SectionCard title="Photo de profil">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            onUploadComplete={(url: string) => up("avatar_url", url)}
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.email}</p>
            <p className="text-xs text-slate-400 mt-2">JPG, PNG ou GIF · Max 2 MB</p>
          </div>
        </div>
      </SectionCard>

      {/* ── Personal ────────────────────────────────────────────────────────── */}
      <SectionCard title="Informations personnelles">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prénom">
            <Input
              id="prenom" name="given-name" autoComplete="given-name"
              value={profile.first_name || ""}
              onChange={e => up("first_name", e.target.value)}
              className={INPUT} placeholder="Votre prénom"
            />
          </Field>
          <Field label="Nom">
            <Input
              id="nom" name="family-name" autoComplete="family-name"
              value={profile.last_name || ""}
              onChange={e => up("last_name", e.target.value)}
              className={INPUT} placeholder="Votre nom"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Nom commercial / Nom d'atelier">
            <Input
              id="business_name" name="business_name" autoComplete="organization"
              value={profile.business_name || ""}
              onChange={e => up("business_name", e.target.value)}
              className={INPUT} placeholder="Ex: Menuiserie Dupont"
            />
          </Field>
          <Field label="Arrondissement / quartier">
            <Input
              id="district" name="district"
              value={profile.district || ""}
              onChange={e => up("district", e.target.value)}
              className={INPUT} placeholder="Ex: Akpakpa"
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── GPS Location ──────────────────────────────────────────────────────── */}
      <SectionCard title="Localisation GPS">
        <p className="text-sm text-muted-foreground -mt-2 mb-4">
          Indiquez où vous exercez pour apparaître sur la carte et dans les recherches de proximité.
        </p>

        {/* Action principale : détecter automatiquement la position */}
        <Button
          type="button"
          onClick={handleGetLocation}
          disabled={locating}
          className="h-12 w-full rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all active:scale-[0.99] disabled:opacity-60"
        >
          {locating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Localisation en cours…</>
          ) : (
            <><MapPin className="w-4 h-4 mr-2" /> {hasCoords ? "Actualiser ma position" : "Détecter ma position"}</>
          )}
        </Button>

        {/* État de la position */}
        {hasCoords ? (
          <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">Position enregistrée</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {Number(profile.latitude).toFixed(6)}, {Number(profile.longitude).toFixed(6)}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                  <a
                    href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Voir sur la carte <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Aucune position enregistrée pour le moment.
          </p>
        )}

        {/* Carte interactive : affiner la position au marqueur (précis au mètre) */}
        <div className="mt-4">
          <LocationMapPicker
            latitude={profile.latitude}
            longitude={profile.longitude}
            onChange={(lat, lng) => setProfile({ ...profile, latitude: round6(lat), longitude: round6(lng) })}
          />
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            Déplacez le marqueur ou tapez sur la carte pour ajuster précisément votre position.
          </p>
        </div>

        {/* Saisie manuelle (secondaire, repliée par défaut) */}
        <details className="mt-4 group">
          <summary className="text-xs font-bold text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors list-none flex items-center gap-1.5">
            <span className="inline-block transition-transform group-open:rotate-90">›</span>
            Saisir les coordonnées manuellement
          </summary>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <Field label="Latitude">
              <Input
                id="latitude" name="latitude" type="number" step="any" min={-90} max={90} inputMode="decimal"
                value={profile.latitude ?? ""}
                onChange={e => up("latitude", e.target.value ? parseFloat(e.target.value) : null)}
                onBlur={commitCoord("latitude", -90, 90)}
                className={INPUT} placeholder="Ex : 6.36536"
              />
            </Field>
            <Field label="Longitude">
              <Input
                id="longitude" name="longitude" type="number" step="any" min={-180} max={180} inputMode="decimal"
                value={profile.longitude ?? ""}
                onChange={e => up("longitude", e.target.value ? parseFloat(e.target.value) : null)}
                onBlur={commitCoord("longitude", -180, 180)}
                className={INPUT} placeholder="Ex : 2.41833"
              />
            </Field>
          </div>
        </details>

        <div className="mt-6 p-4 rounded-xl border border-border bg-muted flex items-start gap-4">
          <Switch 
            id="is_nomad" 
            checked={!!profile.is_nomad} 
            onCheckedChange={(checked) => up("is_nomad", checked)} 
          />
          <div>
            <label htmlFor="is_nomad" className="font-semibold text-foreground block mb-1 cursor-pointer">
              Je suis en déplacement
            </label>
            <p className="text-sm text-muted-foreground">
              Activez ce mode si vous êtes un professionnel itinérant. Cela indique aux visiteurs que votre position peut varier.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── Professional ────────────────────────────────────────────────────── */}
      <SectionCard title="Profil professionnel">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Catégorie">
            <select id="category" value={profile.category || ""} onChange={e => up("category", e.target.value)} className={SELECT}>
              <option value="" disabled>Choisir un type...</option>
              {PROFILE_CATEGORIES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Secteur d'activité">
            <select id="activity_domain" value={profile.activity_domain || ""} onChange={e => up("activity_domain", e.target.value)} className={SELECT}>
              <option value="" disabled>Choisir un secteur...</option>
              {ACTIVITY_DOMAINS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Rôle / Entreprise">
            <Input
              value={profile.role || ""}
              onChange={e => up("role", e.target.value)}
              className={INPUT} placeholder="Ex: Directeur Créatif, Nexus Agency"
            />
          </Field>
          <Field label="Spécialité">
            <Input
              value={profile.specialty || ""}
              onChange={e => up("specialty", e.target.value)}
              className={INPUT} placeholder="Ex: Développement Web, Menuiserie..."
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Contact ─────────────────────────────────────────────────────────── */}
      <SectionCard title="Contact">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Adresse email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email" name="email" autoComplete="email" type="email"
                value={profile.email || ""}
                className={`${INPUT} pl-10 opacity-60`}
                disabled
              />
            </div>
          </Field>
          <Field label="Téléphone">
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="telephone" name="tel" autoComplete="tel" type="tel"
                value={profile.phone || ""}
                onChange={e => up("phone", e.target.value)}
                className={`${INPUT} pl-10`}
                placeholder="+229 XXXXXXXXXX"
              />
            </div>
          </Field>
        </div>

        {/* Phone verification */}
        {profile.phone && profile.phone.length > 5 && (
          <div className="mt-4">
            {profile.phone_verified ? (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 w-fit px-3 py-2 rounded-xl border border-emerald-200 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Numéro certifié
              </div>
            ) : verifyMethod ? (
              <div className="p-4 bg-[#013ff4]/5 border border-[#013ff4]/20 rounded-xl">
                <p className="text-sm font-bold text-[#013ff4] mb-0.5">Code envoyé</p>
                <p className="text-xs text-[#013ff4]/80 mb-4">
                  Entrez le code à 6 chiffres reçu sur <strong>{profile.phone}</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="phone-verification-code"
                    name="phone_verification_code"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="000000"
                    maxLength={6}
                    className="h-11 text-center text-xl tracking-[0.4em] font-black rounded-xl border-[#013ff4]/30 bg-card flex-1"
                  />
                  <div className="flex gap-2 shrink-0">
                    <Button type="button" variant="ghost" onClick={() => { setVerifyMethod(null); setOtpCode("") }} className="h-11 px-4 rounded-xl text-muted-foreground">
                      Annuler
                    </Button>
                    <Button type="button" onClick={handleVerifySubmit} disabled={otpCode.length < 6 || verifying} className="h-11 px-5 rounded-xl bg-[#013ff4] hover:bg-[#033a7a] text-white font-bold">
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <p className="text-sm font-bold text-rose-800">Numéro non vérifié</p>
                </div>
                <p className="text-xs text-rose-700 mb-4">Confirmez ce numéro pour sécuriser votre compte.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("whatsapp")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <Image src="/svg/whatsapp-logo.svg" width={16} height={16} alt="WhatsApp" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("sms")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-bold hover:bg-blue-100 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── Verification status ──────────────────────────────────────────────── */}
      <SectionCard title="Statut de vérification">
        <div className="divide-y divide-border">

          {/* Email */}
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                <Mail className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Email</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
            <span className="ml-3 shrink-0 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200">
              <Shield className="h-2.5 w-2.5" />
              Vérifié
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`p-2 rounded-lg shrink-0 ${profile.phone_verified ? "bg-emerald-50" : "bg-muted"}`}>
                <Smartphone className={`h-4 w-4 ${profile.phone_verified ? "text-emerald-600" : "text-slate-400"}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Téléphone</p>
                <p className="text-xs text-muted-foreground truncate">{profile.phone || "Non renseigné"}</p>
              </div>
            </div>
            {profile.phone_verified ? (
              <span className="ml-3 shrink-0 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200">
                <Shield className="h-2.5 w-2.5" />
                Vérifié
              </span>
            ) : (
              <span className="ml-3 shrink-0 inline-flex items-center gap-1 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-border">
                <AlertCircle className="h-2.5 w-2.5" />
                En attente
              </span>
            )}
          </div>

          {/* KYC */}
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-muted rounded-lg shrink-0">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Identité professionnelle</p>
                <p className="text-xs text-slate-400">Pièces justificatives (CNI, IFU, registre…)</p>
              </div>
            </div>
            <button
              onClick={() => { window.location.href = "/parametres?tab=verification" }}
              className="ml-3 shrink-0 text-xs font-bold text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
            >
              Vérifier
            </button>
          </div>

        </div>
      </SectionCard>

      {/* ── Confidentialité du contact ──────────────────────────────────── */}
      <SectionCard title="Confidentialité">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Afficher mes coordonnées</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Votre email et votre téléphone sont visibles sur votre profil public. Désactivez pour les masquer.
            </p>
          </div>
          <Switch
            className="shrink-0"
            checked={profile.show_contact !== false}
            onCheckedChange={(checked: boolean) => up("show_contact", checked)}
          />
        </div>
      </SectionCard>

      {/* ── Actions ──────────────────────────────────────────────────────────
          Masquées quand la section est empilée sous une autre qui enregistre le
          même profil : deux barres laisseraient croire à deux enregistrements
          distincts. */}
      {!hideActions && (
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto h-11 rounded-xl border-border font-bold">
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-11 rounded-xl font-bold shadow-sm">
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      )}

    </div>
  )
}
