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

import { useState, useMemo } from "react"
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
  Sparkles,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AvatarUpload } from "@/components/AvatarUpload"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { PROFILE_CATEGORIES, ACTIVITY_DOMAINS } from "@/lib/profile-options"
import { BENIN_DEPARTMENTS, getCommunesByDepartmentId } from "@/lib/benin-geo"
import type { UserProfileData } from "@/hooks/use-settings"
import { BioSection } from "./bio-section"
import { LocationSection } from "./location-section"
import { ExperienceSection } from "./experience-section"
import {
  SectionCard,
  SettingToggle,
  SettingRow,
  Field,
  SegmentedControl,
  SlugInput,
  TagsInput,
  StickySaveBar,
  INPUT,
  SELECT,
  TEXTAREA,
} from "./settings-primitives"

interface ProfileSectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
  hideActions?: boolean
  modifiedCount?: number
}

export function ProfileSection({
  profile,
  setProfile,
  saving,
  handleSave,
  handleCancel,
  hideActions = false,
  modifiedCount = 0,
}: ProfileSectionProps) {
  // États de vérification du téléphone (3 états : Non certifié / Code envoyé / Certifié)
  const [verifyMethod, setVerifyMethod] = useState<"whatsapp" | "sms" | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  // Quel bouton (WhatsApp / SMS) est en cours d'envoi. Distinct de
  // `verifyMethod`, qui signifie « le code est parti, on attend la saisie » :
  // sans lui, les deux boutons resteraient actifs pendant l'appel réseau.
  const [sendingMethod, setSendingMethod] = useState<"whatsapp" | "sms" | null>(null)

  const up = <K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) =>
    setProfile({ ...profile, [key]: value })

  const handleVerifyRequest = async (method: "whatsapp" | "sms") => {
    if (!profile.phone || profile.phone.trim().length < 6) {
      toast.error("Veuillez d'abord renseigner un numéro de téléphone valide.")
      return
    }
    setSendingMethod(method)
    try {
      const res = await fetchWithAuth("/api/users/phone/request", {
        method: "POST",
        body: JSON.stringify({ phone: profile.phone, method }),
      })
      if (res.ok) {
        setVerifyMethod(method)
        toast.success(`Code de vérification envoyé par ${method === "whatsapp" ? "WhatsApp" : "SMS"} !`)
      } else {
        const e = await res.json().catch(() => null)
        toast.error(e?.error || "Erreur lors de l'envoi du code")
      }
    } catch {
      toast.error("Erreur de connexion avec le serveur")
    } finally {
      setSendingMethod(null)
    }
  }

  const handleVerifySubmit = async () => {
    if (otpCode.length < 6) {
      toast.error("Veuillez saisir le code à 6 chiffres.")
      return
    }
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
        toast.success("Numéro de téléphone vérifié et certifié !")
      } else {
        const e = await res.json().catch(() => null)
        toast.error(e?.error || "Code incorrect ou expiré")
      }
    } catch {
      toast.error("Erreur technique lors de la validation")
    } finally {
      setVerifying(false)
    }
  }

  const sloganLen = (profile.slogan || "").length
  const bioLen = (profile.bio || "").length
  const tagsList = Array.isArray(profile.tags) ? profile.tags : []

  return (
    <div className="space-y-6 pb-6">

      {/* ═════════════════════════════════════════════════════════════════════
          CARTE 1 : PHOTO DE PROFIL (PDF Page 1)
          ═════════════════════════════════════════════════════════════════════ */}
      <SectionCard title="Photo de profil" icon={User}>
        <AvatarUpload
          variant="profile-card"
          currentAvatarUrl={profile.avatar_url}
          email={profile.email}
          onUploadComplete={(url: string) => up("avatar_url", url)}
          onDelete={() => {
            up("avatar_url", "/profil/avatar.jpg")
            toast.success("Photo de profil réinitialisée")
          }}
        />
      </SectionCard>

      {/* ═════════════════════════════════════════════════════════════════════
          CARTE 2 : INFORMATIONS PERSONNELLES (PDF Page 1 & 2)
          ═════════════════════════════════════════════════════════════════════ */}
      <SectionCard title="Informations personnelles" icon={User}>
        {/* Prénom & Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prénom">
            <Input
              id="first_name"
              name="first_name"
              autoComplete="given-name"
              value={profile.first_name || ""}
              onChange={(e) => up("first_name", e.target.value)}
              className={INPUT}
              placeholder="Ex: Christian"
            />
          </Field>
          <Field label="Nom">
            <Input
              id="last_name"
              name="last_name"
              autoComplete="family-name"
              value={profile.last_name || ""}
              onChange={(e) => up("last_name", e.target.value)}
              className={INPUT}
              placeholder="Ex: Daouda"
            />
          </Field>
        </div>

        <Field
          label="Lien personnalisé de votre profil"
          hint="Visible dans l'annuaire et sur votre carte de profil public."
          className="pt-1"
        >
          <SlugInput value={profile.slug || ""} onChange={(v) => up("slug", v)} />
        </Field>
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

      {/* ═════════════════════════════════════════════════════════════════════
          CARTE 4 : À PROPOS (PDF Page 1)
          ═════════════════════════════════════════════════════════════════════ */}
      <SectionCard
        title="À propos"
        icon={Sparkles}
        description="Présentez votre proposition de valeur, votre philosophie et vos points forts."
      >
        <div className="space-y-4">
          <Field
            label="Slogan / Phrase d'accroche"
            counter={`${sloganLen}/160`}
            hint="Courte phrase percutante visible sous votre nom sur votre profil et dans l'annuaire."
          >
            <Input
              value={profile.slogan || ""}
              onChange={(e) => up("slogan", e.target.value)}
              className={INPUT}
              maxLength={160}
              placeholder="Ex : L'excellence artisanale au service de vos projets durables"
            />
          </Field>

          <Field
            label="Bio / Description détaillée"
            counter={`${bioLen}/1000`}
            hint="Détaillez vos prestations, vos réalisations passées et vos engagements qualité."
          >
            <textarea
              value={profile.bio || ""}
              onChange={(e) => up("bio", e.target.value)}
              rows={5}
              maxLength={1000}
              className={TEXTAREA}
              placeholder="Partagez votre histoire professionnelle, votre parcours et vos expertises clés..."
            />
          </Field>
        </div>
      </SectionCard>

      {/* ═════════════════════════════════════════════════════════════════════
          CARTE 5 : PROFIL PROFESSIONNEL (PDF Page 1)
          ═════════════════════════════════════════════════════════════════════ */}
      <SectionCard title="Profil professionnel" icon={Briefcase}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Métier / Titre professionnel">
            <Input
              id="role"
              name="role"
              value={profile.role || ""}
              onChange={(e) => up("role", e.target.value)}
              className={INPUT}
              placeholder="Ex: Ébéniste d'art, Développeur Web"
            />
          </Field>

          <Field label="Années d'expérience professionnelle">
            <Input
              type="number"
              min={0}
              max={70}
              value={profile.years_experience ?? ""}
              onChange={(e) => up("years_experience", e.target.value === "" ? null : Number(e.target.value))}
              className={INPUT}
              placeholder="Ex : 7"
            />
          </Field>

          <Field label="Catégorie de profil EmiID">
            <select
              id="category"
              value={profile.category || ""}
              onChange={(e) => up("category", e.target.value)}
              className={SELECT}
            >
              <option value="" disabled>Sélectionner une catégorie...</option>
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
              <option value="" disabled>Sélectionner un secteur...</option>
              {ACTIVITY_DOMAINS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Spécialité principale" className="pt-1">
          <Input
            value={profile.specialty || ""}
            onChange={(e) => up("specialty", e.target.value)}
            className={INPUT}
            placeholder="Ex: Menuiserie aluminium sur mesure, Domotique"
          />
        </Field>

        {/* Mots-clés avec limite 8 (PDF Page 1) */}
        <div className="pt-1">
          <Field
            label="Mots-clés / Compétences clés"
            counter={`${tagsList.length}/8`}
            hint="Ajoutez jusqu'à 8 mots-clés pour optimiser votre référencement dans le moteur de recherche."
          >
            <TagsInput
              tags={tagsList}
              maxTags={8}
              onChange={(newTags) => up("tags", newTags)}
              placeholder="Ajouter un mot-clé (ex: Sur-mesure)..."
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

      {/* ── Parcours & Expériences ──────────────────────────────────────── */}
      <ExperienceSection profile={profile} setProfile={setProfile} />

      {/* ═════════════════════════════════════════════════════════════════════
          CARTE 6 : COORDONNÉES & SÉCURITÉ CONTACT (PDF Page 1 & 3)
          ═════════════════════════════════════════════════════════════════════ */}
      <SectionCard title="Coordonnées & Sécurité contact" icon={Smartphone}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email principal (verrouillé) */}
          <Field label="Adresse email principale">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email || ""}
                disabled
                className={`${INPUT} pl-10 pr-9`}
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </Field>

          {/* Téléphone avec statut CERTIFIÉ (PDF Page 3) */}
          <Field label="Numéro de téléphone principal">
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => {
                  up("phone", e.target.value)
                  if (profile.phone_verified) up("phone_verified", false)
                }}
                className={`${INPUT} pl-10 pr-24`}
                placeholder="+229 01XXXXXXXX"
              />
              {/* Badge CERTIFIÉ vert intégré dans le champ */}
              {profile.phone_verified && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-300/80">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Certifié
                  </span>
                </div>
              )}
            </div>
          </Field>
        </div>

        {/* ── Gestion des 3 états téléphone (PDF Page 3) ───────────────── */}
        {!profile.phone_verified && profile.phone && profile.phone.length > 5 && (
          <div className="pt-2">
            {verifyMethod ? (
              /* ÉTAT B : Code envoyé (Encart bleu) */
              <div className="p-4 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/60 rounded-none space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm font-black text-[#0150fd]">
                      Code de confirmation envoyé par {verifyMethod === "whatsapp" ? "WhatsApp" : "SMS"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Saisissez le code à 6 chiffres reçu sur <strong className="text-foreground">{profile.phone}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <Input
                    id="otpCode"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="h-11 text-center font-mono text-lg tracking-[0.3em] font-black rounded-none border-[#0150fd]/40 bg-card w-full sm:w-48"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setVerifyMethod(null)
                        setOtpCode("")
                      }}
                      className="h-11 px-4 rounded-none text-muted-foreground hover:bg-card flex-1 sm:flex-initial"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      onClick={handleVerifySubmit}
                      disabled={otpCode.length < 6 || verifying}
                      className="h-11 px-5 rounded-none bg-[#0150fd] hover:bg-[#003ec7] text-white font-bold shadow-sm flex-1 sm:flex-initial"
                    >
                      {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                      Confirmer
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* ÉTAT A : Non certifié (Encart ambré avec WhatsApp et SMS) */
              <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                      Numéro non certifié
                    </p>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300 mt-0.5">
                      La certification renforce la confiance des clients et débloque le badge de vérification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("whatsapp")}
                    disabled={sendingMethod !== null}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {sendingMethod === "whatsapp" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Image src="/svg/whatsapp-logo.svg" width={14} height={14} alt="WhatsApp" className="brightness-200" />
                    )}
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("sms")}
                    disabled={sendingMethod !== null}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-none bg-[#0150fd] hover:bg-[#003ec7] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {sendingMethod === "sms" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5" />
                    )}
                    <span>SMS</span>
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
        <StickySaveBar
          saving={saving}
          modifiedCount={modifiedCount}
          handleSave={handleSave}
          handleCancel={handleCancel}
        />
      )}

    </div>
  )
}
