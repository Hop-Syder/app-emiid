/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section Profil de la page de paramètres — Refonte avec les patterns SwiftUI (Grouped Inset, SettingToggle, SettingRow).
 * @created 2026-06-13
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Mail,
  Smartphone,
  User,
  Shield,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Compass,
  Briefcase,
  Eye,
  Lock,
  ExternalLink,
  RotateCcw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AvatarUpload } from "@/components/AvatarUpload"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { PROFILE_CATEGORIES, ACTIVITY_DOMAINS } from "@/lib/profile-options"
import type { UserProfileData } from "@/hooks/use-settings"
import { BioSection } from "./bio-section"
import { LocationMapPicker } from "./location-map-picker"
import {
  SectionCard,
  SettingRow,
  SettingToggle,
  Field,
  SaveBar,
  INPUT,
  SELECT,
} from "./settings-primitives"

interface ProfileSectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
  hideActions?: boolean
}

export function ProfileSection({
  profile,
  setProfile,
  saving,
  handleSave,
  handleCancel,
  hideActions = false,
}: ProfileSectionProps) {
  const [verifyMethod, setVerifyMethod] = useState<"whatsapp" | "sms" | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [locating, setLocating] = useState(false)

  const up = (key: keyof UserProfileData, value: string | boolean | number | null) =>
    setProfile({ ...profile, [key]: value })

  // 6 décimales ≈ 0,11 m de précision
  const round6 = (n: number) => Math.round(n * 1e6) / 1e6

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
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
    if (!profile.phone) {
      toast.error("Saisissez votre numéro d'abord")
      return
    }
    try {
      const res = await fetchWithAuth("/api/users/phone/request", {
        method: "POST",
        body: JSON.stringify({ phone: profile.phone, method }),
      })
      if (res.ok) {
        setVerifyMethod(method)
        toast.success(`Code envoyé par ${method}`)
      } else {
        const e = await res.json()
        toast.error(e.error || "Erreur lors de l'envoi")
      }
    } catch {
      toast.error("Erreur de connexion")
    }
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
    } catch {
      toast.error("Erreur technique")
    } finally {
      setVerifying(false)
    }
  }

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Votre nom"

  return (
    <div className="space-y-4">
      {/* ── Photo de profil ─────────────────────────────────────────────── */}
      <SectionCard title="Photo de profil" icon={User}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            onUploadComplete={(url: string) => up("avatar_url", url)}
          />
          <div className="min-w-0 flex-1">
            <p className="text-base font-extrabold text-foreground truncate leading-snug">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-semibold text-slate-400">JPG, PNG, WEBP · Max 2 MB</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Identité personnelle ────────────────────────────────────────── */}
      <SectionCard title="Informations personnelles" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prénom">
            <Input
              id="prenom"
              name="given-name"
              autoComplete="given-name"
              value={profile.first_name || ""}
              onChange={(e) => up("first_name", e.target.value)}
              className={INPUT}
              placeholder="Votre prénom"
            />
          </Field>
          <Field label="Nom">
            <Input
              id="nom"
              name="family-name"
              autoComplete="family-name"
              value={profile.last_name || ""}
              onChange={(e) => up("last_name", e.target.value)}
              className={INPUT}
              placeholder="Votre nom"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <Field label="Nom commercial / Nom d'atelier">
            <Input
              id="business_name"
              name="business_name"
              autoComplete="organization"
              value={profile.business_name || ""}
              onChange={(e) => up("business_name", e.target.value)}
              className={INPUT}
              placeholder="Ex: Menuiserie Dupont"
            />
          </Field>
          <Field label="Arrondissement / quartier">
            <Input
              id="district"
              name="district"
              value={profile.district || ""}
              onChange={(e) => up("district", e.target.value)}
              className={INPUT}
              placeholder="Ex: Akpakpa"
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── À propos & Bio ──────────────────────────────────────────────── */}
      <BioSection
        profile={profile}
        setProfile={setProfile}
        saving={saving}
        handleSave={handleSave}
        handleCancel={handleCancel}
        hideActions
      />

      {/* ── Localisation GPS ────────────────────────────────────────────── */}
      <SectionCard
        title="Localisation GPS"
        icon={MapPin}
        footerHint="La position GPS permet aux clients situés à proximité de découvrir votre atelier ou vos services via le filtre « Autour de moi »."
      >
        <div className="space-y-4">
          {/* Action principale : bouton géolocalisation */}
          <div className="flex flex-col sm:flex-row items-end gap-3.5">
            <div className="grid grid-cols-2 gap-3.5 flex-1 w-full">
              <Field label="Latitude">
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  inputMode="decimal"
                  value={profile.latitude ?? ""}
                  onChange={(e) => up("latitude", e.target.value ? parseFloat(e.target.value) : null)}
                  onBlur={commitCoord("latitude", -90, 90)}
                  className={INPUT}
                  placeholder="Ex: 6.36536"
                />
              </Field>
              <Field label="Longitude">
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  inputMode="decimal"
                  value={profile.longitude ?? ""}
                  onChange={(e) => up("longitude", e.target.value ? parseFloat(e.target.value) : null)}
                  onBlur={commitCoord("longitude", -180, 180)}
                  className={INPUT}
                  placeholder="Ex: 2.41833"
                />
              </Field>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGetLocation}
              disabled={locating}
              className="h-11 px-4 rounded-2xl border-border font-bold shrink-0 w-full sm:w-auto hover:bg-muted transition-all text-foreground disabled:opacity-60"
            >
              {locating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Détection…</>
              ) : (
                <><MapPin className="w-4 h-4 mr-2 text-[#013ff4]" /> {hasCoords ? "Actualiser ma position" : "Détecter ma position"}</>
              )}
            </Button>
          </div>

          {/* État de la position & carte Google Maps */}
          {hasCoords ? (
            <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground leading-snug">Position GPS enregistrée</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                    {Number(profile.latitude).toFixed(6)}, {Number(profile.longitude).toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <a
                  href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#013ff4] hover:underline"
                >
                  Voir sur la carte <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={clearLocation}
                  className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-rose-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Effacer
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 flex items-center gap-1.5 px-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Aucune position GPS enregistrée pour le moment.
            </p>
          )}

          {/* Carte interactive : affiner la position au marqueur (précis au mètre) */}
          <div>
            <LocationMapPicker
              latitude={profile.latitude}
              longitude={profile.longitude}
              onChange={(lat, lng) => setProfile({ ...profile, latitude: round6(lat), longitude: round6(lng) })}
            />
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5 px-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              Déplacez le marqueur ou tapez sur la carte pour ajuster précisément votre position.
            </p>
          </div>

          {/* Mode nomade */}
          <div className="pt-2 border-t border-border">
            <SettingToggle
              id="is_nomad"
              icon={Compass}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              title="Professionnel en déplacement (Nomade)"
              description="Indique aux visiteurs que votre activité est itinérante et que votre zone géographique peut varier."
              checked={!!profile.is_nomad}
              onCheckedChange={(checked) => up("is_nomad", checked)}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Profil professionnel ────────────────────────────────────────── */}
      <SectionCard title="Profil professionnel" icon={Briefcase}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Catégorie de profil">
            <select
              id="category"
              value={profile.category || ""}
              onChange={(e) => up("category", e.target.value)}
              className={SELECT}
            >
              <option value="" disabled>Choisir un type...</option>
              {PROFILE_CATEGORIES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Secteur d'activité">
            <select
              id="activity_domain"
              value={profile.activity_domain || ""}
              onChange={(e) => up("activity_domain", e.target.value)}
              className={SELECT}
            >
              <option value="" disabled>Choisir un secteur...</option>
              {ACTIVITY_DOMAINS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Rôle / Titre officiel">
            <Input
              value={profile.role || ""}
              onChange={(e) => up("role", e.target.value)}
              className={INPUT}
              placeholder="Ex: Directeur Général, Maître Artisan"
            />
          </Field>
          <Field label="Spécialité principale">
            <Input
              value={profile.specialty || ""}
              onChange={(e) => up("specialty", e.target.value)}
              className={INPUT}
              placeholder="Ex: Ébénisterie fine, Électricité industrielle"
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Coordonnées & vérification directe ──────────────────────────── */}
      <SectionCard title="Coordonnées & Sécurité contact" icon={Smartphone}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Adresse email principale">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                autoComplete="email"
                type="email"
                value={profile.email || ""}
                className={`${INPUT} pl-10 pr-9`}
                disabled
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </Field>

          <Field label="Numéro de téléphone principal">
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="telephone"
                name="tel"
                autoComplete="tel"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => up("phone", e.target.value)}
                className={`${INPUT} pl-10`}
                placeholder="+229 01XXXXXXXX"
              />
            </div>
          </Field>
        </div>

        {/* Validation SMS / WhatsApp si téléphone renseigné */}
        {profile.phone && profile.phone.length > 5 && (
          <div className="pt-2 border-t border-border">
            {profile.phone_verified ? (
              <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-50 w-fit px-3.5 py-2 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-bold shadow-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Numéro certifié et protégé</span>
              </div>
            ) : verifyMethod ? (
              <div className="p-4.5 bg-[#013ff4]/5 border border-[#013ff4]/20 rounded-3xl space-y-3">
                <div>
                  <p className="text-sm font-bold text-[#013ff4]">Code de confirmation envoyé</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Saisissez le code à 6 chiffres reçu sur <strong>{profile.phone}</strong>.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Input
                    id="phone-verification-code"
                    name="phone_verification_code"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="000000"
                    maxLength={6}
                    className="h-11 text-center text-xl tracking-[0.4em] font-black rounded-2xl border-[#013ff4]/30 bg-card flex-1"
                  />
                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => { setVerifyMethod(null); setOtpCode("") }}
                      className="h-11 px-4 rounded-2xl text-muted-foreground hover:bg-card"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      onClick={handleVerifySubmit}
                      disabled={otpCode.length < 6 || verifying}
                      className="h-11 px-5 rounded-2xl bg-[#013ff4] hover:bg-[#033a7a] text-white font-bold shadow-sm"
                    >
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Numéro non certifié</p>
                    <p className="text-xs text-amber-700/90 mt-0.5">Recevez vos notifications et sécurisez votre accès.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("whatsapp")}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-card border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Image src="/svg/whatsapp-logo.svg" width={14} height={14} alt="WhatsApp" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("sms")}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-card border border-blue-300 text-blue-800 text-xs font-bold hover:bg-blue-50 active:scale-95 transition-all shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                    SMS
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── Statuts de vérification ─────────────────────────────────────── */}
      <SectionCard title="Statut de vérification du compte" icon={Shield}>
        <div className="divide-y divide-border">
          <SettingRow
            icon={Mail}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            title="Adresse Email"
            subtitle={profile.email}
            rightElement={
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200">
                <Shield className="h-2.5 w-2.5" />
                Vérifié
              </span>
            }
          />

          <SettingRow
            icon={Smartphone}
            iconBg={profile.phone_verified ? "bg-emerald-50" : "bg-muted"}
            iconColor={profile.phone_verified ? "text-emerald-600" : "text-slate-400"}
            title="Numéro de Téléphone"
            subtitle={profile.phone || "Aucun numéro renseigné"}
            rightElement={
              profile.phone_verified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200">
                  <Shield className="h-2.5 w-2.5" />
                  Vérifié
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-border">
                  <AlertCircle className="h-2.5 w-2.5" />
                  En attente
                </span>
              )
            }
          />

          <SettingRow
            icon={User}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            title="Identité & Documents officiels"
            subtitle="Badge vérifié, CNI, IFU, RCCM"
            onClick={() => {
              if (typeof window !== "undefined") window.location.href = "/parametres?tab=verification"
            }}
            rightElement={
              profile.is_verified ? (
                <span className="inline-flex items-center gap-1 bg-[#013ff4]/10 text-[#013ff4] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#013ff4]/20">
                  <Shield className="h-2.5 w-2.5" />
                  Certifié
                </span>
              ) : (
                <span className="text-xs font-bold text-[#013ff4] hover:underline">
                  Vérifier
                </span>
              )
            }
          />
        </div>
      </SectionCard>

      {/* ── Confidentialité ─────────────────────────────────────────────── */}
      <SectionCard title="Confidentialité & Visibilité" icon={Eye}>
        <SettingToggle
          id="show_contact"
          icon={Eye}
          iconBg="bg-[#03b3f8]/10"
          iconColor="text-[#03b3f8]"
          title="Afficher mes coordonnées publiques"
          description="Votre adresse email et votre numéro de téléphone sont visibles sur votre profil public. Désactivez pour les masquer aux visiteurs."
          checked={profile.show_contact !== false}
          onCheckedChange={(checked) => up("show_contact", checked)}
        />
      </SectionCard>

      {/* ── Barre d'enregistrement ──────────────────────────────────────── */}
      {!hideActions && (
        <SaveBar saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
      )}
    </div>
  )
}
