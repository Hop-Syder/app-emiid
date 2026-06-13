/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Profile section — complete redesign (Premium Dark Mode)
 * @updated 2026-06-13
*/

"use client"

import { useState } from "react"
import { Mail, Smartphone, User, Shield, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AvatarUpload } from "@/components/AvatarUpload"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileSectionProps {
  profile:      any
  setProfile:   any
  saving:       boolean
  handleSave:   () => void
  handleCancel: () => void
}

// ─── Shared class tokens ──────────────────────────────────────────────────────

const INPUT = "h-11 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:ring-white/20 transition-all placeholder:text-white/40"
const SELECT = "w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all [&>option]:bg-zinc-900"

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}

// ─── Section card helper ──────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      <h2 className="text-[11px] font-black text-white/50 uppercase tracking-wider mb-5 relative z-10">{title}</h2>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileSection({ profile, setProfile, saving, handleSave, handleCancel }: ProfileSectionProps) {
  const [verifyMethod, setVerifyMethod] = useState<"whatsapp" | "sms" | null>(null)
  const [otpCode,      setOtpCode]      = useState("")
  const [verifying,    setVerifying]    = useState(false)

  const up = (key: string, value: string) => setProfile({ ...profile, [key]: value })

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
            <p className="text-sm font-bold text-white truncate">{displayName}</p>
            <p className="text-xs text-white/60 truncate mt-0.5">{profile.email}</p>
            <p className="text-xs text-white/40 mt-2">JPG, PNG ou GIF · Max 2 MB</p>
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
        <div className="mt-4">
          <Field label="Bio">
            <textarea
              value={profile.bio || ""}
              onChange={e => up("bio", e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-y placeholder:text-white/40"
              placeholder="Racontez votre parcours et vos réalisations..."
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Professional ────────────────────────────────────────────────────── */}
      <SectionCard title="Profil professionnel">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Catégorie">
            <select id="category" value={profile.category || ""} onChange={e => up("category", e.target.value)} className={SELECT}>
              <option value="artisan">🎨 Artisan</option>
              <option value="commerçante">🛒 Commerçant(e)</option>
              <option value="freelance">💻 Freelance</option>
              <option value="entreprise">🏢 Entreprise</option>
              <option value="agence">📣 Agence</option>
              <option value="startup">🚀 Startup</option>
              <option value="ong">🌍 ONG / Association</option>
              <option value="investisseur">📈 Investisseur</option>
              <option value="institution">🏛️ Institution Publique</option>
              <option value="etudiant">🎓 Étudiant / Junior</option>
            </select>
          </Field>
          <Field label="Secteur d'activité">
            <select id="activity_domain" value={profile.activity_domain || ""} onChange={e => up("activity_domain", e.target.value)} className={SELECT}>
              <option value="" disabled>Choisir un secteur...</option>
              <option value="tech">💻 Tech & Digital</option>
              <option value="agro">🌾 Agroalimentaire</option>
              <option value="btp">🏗️ BTP & Construction</option>
              <option value="finance">💰 Finance & Assurance</option>
              <option value="sante">🏥 Santé & Bien-être</option>
              <option value="education">📚 Éducation & Formation</option>
              <option value="creatif">🎨 Arts & Créativité</option>
              <option value="commerce">🛍️ Commerce & Distribution</option>
              <option value="transport">🚚 Transport & Logistique</option>
              <option value="tourisme">✈️ Tourisme & Hôtellerie</option>
              <option value="energie">⚡ Énergie & Environnement</option>
              <option value="b2b">🤝 Services B2B</option>
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="email" name="email" autoComplete="email" type="email"
                value={profile.email || ""}
                className={`${INPUT} pl-10 opacity-60 cursor-not-allowed`}
                disabled
              />
            </div>
          </Field>
          <Field label="Téléphone">
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 w-fit px-3 py-2 rounded-xl border border-emerald-500/20 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Numéro certifié
              </div>
            ) : verifyMethod ? (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl backdrop-blur-sm">
                <p className="text-sm font-bold text-indigo-200 mb-0.5">Code envoyé</p>
                <p className="text-xs text-indigo-200/70 mb-4">
                  Entrez le code à 6 chiffres reçu sur <strong className="text-indigo-100">{profile.phone}</strong>.
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
                    className="h-11 text-center text-xl tracking-[0.4em] font-black rounded-xl border-indigo-500/30 bg-white/5 text-white flex-1 focus:ring-indigo-500/50"
                  />
                  <div className="flex gap-2 shrink-0">
                    <Button type="button" variant="ghost" onClick={() => { setVerifyMethod(null); setOtpCode("") }} className="h-11 px-4 rounded-xl text-white/60 hover:bg-white/10 hover:text-white">
                      Annuler
                    </Button>
                    <Button type="button" onClick={handleVerifySubmit} disabled={otpCode.length < 6 || verifying} className="h-11 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold">
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <p className="text-sm font-bold text-rose-200">Numéro non vérifié</p>
                </div>
                <p className="text-xs text-rose-200/70 mb-4">Confirmez ce numéro pour sécuriser votre compte.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("whatsapp")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <img src="/svg/whatsapp-logo.svg" className="h-4 w-4" alt="WhatsApp" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyRequest("sms")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-colors"
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
        <div className="divide-y divide-white/10">

          {/* Email */}
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0 border border-emerald-500/20">
                <Mail className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Email</p>
                <p className="text-xs text-white/60 truncate">{profile.email}</p>
              </div>
            </div>
            <span className="ml-3 shrink-0 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Shield className="h-2.5 w-2.5" />
              Vérifié
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`p-2 rounded-lg shrink-0 border ${profile.phone_verified ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"}`}>
                <Smartphone className={`h-4 w-4 ${profile.phone_verified ? "text-emerald-400" : "text-white/40"}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Téléphone</p>
                <p className="text-xs text-white/60 truncate">{profile.phone || "Non renseigné"}</p>
              </div>
            </div>
            {profile.phone_verified ? (
              <span className="ml-3 shrink-0 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Shield className="h-2.5 w-2.5" />
                Vérifié
              </span>
            ) : (
              <span className="ml-3 shrink-0 inline-flex items-center gap-1 bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10">
                <AlertCircle className="h-2.5 w-2.5" />
                En attente
              </span>
            )}
          </div>

          {/* KYC */}
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-white/5 border border-white/10 rounded-lg shrink-0">
                <User className="h-4 w-4 text-white/40" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Identité professionnelle</p>
                <p className="text-xs text-white/40">KYC — Bientôt disponible</p>
              </div>
            </div>
            <button
              onClick={() => toast.info("Bientôt disponible", { description: "La vérification KYC sera activée prochainement." })}
              className="ml-3 shrink-0 text-xs font-bold text-white/80 border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-colors"
            >
              Vérifier
            </button>
          </div>

        </div>
      </SectionCard>

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
        <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto h-11 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold bg-transparent">
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-11 rounded-xl font-bold shadow-sm bg-white text-zinc-950 hover:bg-white/90">
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>

    </div>
  )
}
