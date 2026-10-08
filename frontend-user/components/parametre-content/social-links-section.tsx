/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « Réseaux sociaux » — Liens professionnels, réseaux et contacts publics secondaires.
 * @created 2026-06-13
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Globe, Facebook, Instagram, Linkedin, Music2, Phone, Mail, Share2, AtSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { UserProfileData } from "@/hooks/use-settings"
import { SectionCard, Field, INPUT } from "./settings-primitives"

interface SectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
}

export function SocialLinksSection({ profile, setProfile }: SectionProps) {
  function up<K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) {
    setProfile({ ...profile, [key]: value })
  }

  const linkField = (
    key: "website" | "facebook_url" | "instagram_url" | "tiktok_url" | "linkedin_url",
    label: string,
    Icon: React.ElementType,
    iconColor: string,
    placeholder: string
  ) => (
    <Field label={label}>
      <div className="relative">
        <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${iconColor}`} />
        <Input
          type="url"
          inputMode="url"
          value={profile[key] || ""}
          onChange={(e) => up(key, e.target.value)}
          className={`${INPUT} pl-10`}
          placeholder={placeholder}
        />
      </div>
    </Field>
  )

  return (
    <div className="space-y-4">
      {/* ── Réseaux sociaux & portfolio ───────────────────────────────── */}
      <SectionCard
        title="Réseaux & Liens professionnels"
        icon={Share2}
        description="Connectez vos profils externes pour renforcer votre crédibilité et votre visibilité en ligne."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {linkField("website", "Site web / Portfolio", Globe, "text-[#013ff4]", "https://votre-site.com")}
          {linkField("linkedin_url", "Profil LinkedIn", Linkedin, "text-[#0a66c2]", "https://linkedin.com/in/profil")}
          {linkField("instagram_url", "Compte Instagram", Instagram, "text-[#e1306c]", "https://instagram.com/profil")}
          {linkField("facebook_url", "Page Facebook", Facebook, "text-[#1877f2]", "https://facebook.com/page")}
          {linkField("tiktok_url", "Compte TikTok", Music2, "text-slate-900", "https://tiktok.com/@compte")}
        </div>
      </SectionCard>

      {/* ── Contacts publics secondaires ──────────────────────────────── */}
      <SectionCard
        title="Contacts publics secondaires"
        icon={AtSign}
        description="Canaux de contact alternatifs affichés sur votre fiche profil pour les prospects."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Téléphone secondaire / Service commercial">
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="tel"
                inputMode="tel"
                value={profile.secondary_phone || ""}
                onChange={(e) => up("secondary_phone", e.target.value)}
                className={`${INPUT} pl-10`}
                placeholder="+229 01XXXXXXXX"
              />
            </div>
          </Field>

          <Field label="Email de contact commercial">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                inputMode="email"
                value={profile.public_email || ""}
                onChange={(e) => up("public_email", e.target.value)}
                className={`${INPUT} pl-10`}
                placeholder="contact@entreprise.bj"
              />
            </div>
          </Field>
        </div>
      </SectionCard>
    </div>
  )
}

