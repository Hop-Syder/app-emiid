/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section Profil des paramètres — identité, localisation, métier,
 *              coordonnées.
 *
 *              Refonte du 06/09 : six cartes ramenées à cinq, et surtout la
 *              localisation extraite dans son propre composant. Deux cartes ont
 *              disparu — « Statut de vérification du compte », qui répétait le
 *              statut du téléphone et affirmait l'email « Vérifié » sans jamais
 *              le vérifier ; et « Confidentialité & Visibilité », une carte
 *              entière pour une bascule, désormais posée au contact des champs
 *              qu'elle gouverne.
 * @created 2026-06-13
 * @updated 2026-09-06
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
  Briefcase,
  Eye,
  Lock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AvatarUpload } from "@/components/AvatarUpload"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { PROFILE_CATEGORIES, ACTIVITY_DOMAINS } from "@/lib/profile-options"
import type { UserProfileData } from "@/hooks/use-settings"
import { BioSection } from "./bio-section"
import { LocationSection } from "./location-section"
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

  const up = (key: keyof UserProfileData, value: string | boolean | number | null) =>
    setProfile({ ...profile, [key]: value })

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

  return (
    <div className="space-y-4">
      {/* ── Photo de profil ─────────────────────────────────────────────── */}
      <SectionCard title="Photo de profil" icon={User}>
        <AvatarUpload
          variant="profile-card"
          currentAvatarUrl={profile.avatar_url}
          email={profile.email}
          onUploadComplete={(url: string) => up("avatar_url", url)}
          onDelete={() => {
            up("avatar_url", null)
            toast.success("Photo de profil réinitialisée")
          }}
        />
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

      {/* ── Localisation ────────────────────────────────────────────────
          Pays, département, commune, ville, quartier, adresse et point GPS.
          Extraite ici le 06/09 : c'est une matière à part entière, et elle
          était jusque-là réduite à deux champs de coordonnées. */}
      <LocationSection profile={profile} setProfile={setProfile} />

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
          {/* Rapatrié depuis « Informations personnelles » : un nom d'atelier
              relève du professionnel, pas de l'état civil. */}
          <Field label="Nom commercial / Nom d'atelier">
            <Input
              id="business_name"
              name="business_name"
              autoComplete="organization"
              value={profile.business_name || ""}
              onChange={(e) => up("business_name", e.target.value)}
              className={INPUT}
              placeholder="Ex : Menuiserie Dupont"
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
              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 w-fit px-3.5 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-xs sm:text-sm font-bold shadow-xs">
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
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-300">Numéro non certifié</p>
                    <p className="text-xs text-amber-700/90 dark:text-amber-300 mt-0.5">Recevez vos notifications et sécurisez votre accès.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("whatsapp")}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-card border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Image src="/svg/whatsapp-logo.svg" width={14} height={14} alt="WhatsApp" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("sms")}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-card border border-blue-300 dark:border-blue-700/50 text-blue-800 dark:text-blue-300 text-xs font-bold hover:bg-blue-50 active:scale-95 transition-all shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                    SMS
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ce que les visiteurs voient de tout cela. La bascule vit désormais
            au contact des champs qu'elle gouverne, plutôt que dans une carte
            séparée en fin de page. */}
        <div className="pt-2 border-t border-border">
          <SettingToggle
            id="show_contact"
            icon={Eye}
            iconBg="bg-[#03b3f8]/10"
            iconColor="text-[#03b3f8]"
            title="Afficher mes coordonnées sur mon profil public"
            description="Décochez pour masquer votre email et votre téléphone aux visiteurs."
            checked={profile.show_contact !== false}
            onCheckedChange={(checked) => up("show_contact", checked)}
          />
        </div>

        {/* Seul rescapé de l'ancienne carte « Statut de vérification » : les
            deux autres lignes répétaient ce qui est affiché plus haut. */}
        <div className="pt-2 border-t border-border">
          <SettingRow
            icon={Shield}
            iconBg="bg-violet-50 dark:bg-violet-950/40"
            iconColor="text-violet-600"
            title="Identité & documents officiels"
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
                <span className="text-xs font-bold text-[#013ff4] hover:underline">Vérifier</span>
              )
            }
          />
        </div>
      </SectionCard>

      {/* La carte « Statut de vérification du compte » a été supprimée le
          06/09. Elle répétait le statut du téléphone affiché juste au-dessus,
          affichait l'email comme « Vérifié » SANS jamais le vérifier — une
          affirmation fausse — et son troisième élément n'était qu'un lien vers
          l'onglet Vérification. Ce lien seul a survécu, ci-dessus. La carte
          « Confidentialité & Visibilité » ne portait qu'une bascule sur les
          coordonnées : elle a rejoint les coordonnées, à côté de ce qu'elle
          gouverne. */}

      {/* ── Barre d'enregistrement ──────────────────────────────────────── */}
      {!hideActions && (
        <SaveBar saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
      )}
    </div>
  )
}
