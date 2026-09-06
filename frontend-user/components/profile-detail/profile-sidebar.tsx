/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Sous-composant Sidebar (Coordonnées, Partage) pour le détail de profil.
 * @created 2026-06-13
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import Link from "next/link"
import { ArrowRight, Calendar, Check, Clock, Copy, Download, ExternalLink, FileText, Globe, Lock, Mail, MessageCircle, Phone, Share, Share2 } from "lucide-react"
import { trackProfileMetric } from "@/lib/track-profile"
import { trackProfileContact } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProfileSidebarProps {
    profile: {
        id?: string | null
        name?: string | null
        email?: string | null
        phone?: string | null
        website?: string | null
        /** Un contact existe et serait visible une fois connecté (H2). */
        hasContact?: boolean
        opening_hours?: Array<{ day: number; open: string; close: string; closed: boolean }>
    }
    joinedDate: string
    profileUrl: string
    copiedLink: string | null
    copyToClipboard: (url: string) => void
    setIsShareModalOpen: (open: boolean) => void
    downloadVCard: () => void
    isLoggedIn: boolean
}

/** Coordonnées réservées aux membres : aperçu inerte + invitation, tant que
 *  le visiteur n'est pas connecté. Les lignes n'affichent aucune vraie donnée
 *  (cf. locked-section.tsx) — un floutage de vraies infos resterait lisible
 *  dans le HTML brut. */
function LockedContact() {
    return (
        <div className="mt-5 space-y-4">
            <div aria-hidden="true" className="pointer-events-none select-none space-y-3 opacity-40 blur-[3px]">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded bg-slate-300 shrink-0" />
                    <div className="h-3.5 w-40 rounded bg-slate-300" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded bg-slate-300 shrink-0" />
                    <div className="h-3.5 w-32 rounded bg-slate-300" />
                </div>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/80 bg-muted/70 px-4 py-5 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
                    <Lock className="h-4 w-4 text-amber-400" />
                </span>
                <p className="text-xs font-semibold leading-relaxed text-muted-foreground">
                    Créez votre compte pour voir l&apos;email et le téléphone de ce membre.
                </p>
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                    <Link
                        href="/creer-profil"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#013ff4] px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-white shadow-sm transition-all hover:bg-[#0135d0] active:scale-95"
                    >
                        Créer mon compte
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                        href="/login"
                        className="flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-foreground transition-colors hover:bg-muted"
                    >
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    )
}

/**
 * Normalise un numero pour wa.me / tel:.
 * Regle : un numero deja international (prefixe « + ») est conserve tel quel ;
 * sinon on applique l'indicatif Benin (229) s'il est absent.
 */
function toInternational(raw: string): string {
    const digits = raw.replace(/\D/g, "")
    if (!digits) return ""
    if (raw.trim().startsWith("+")) return digits
    if (digits.startsWith("229")) return digits
    return `229${digits}`
}

export function ProfileSidebar({
    profile,
    joinedDate,
    profileUrl,
    copiedLink,
    copyToClipboard,
    setIsShareModalOpen,
    downloadVCard,
    isLoggedIn
}: ProfileSidebarProps) {
    return (
        <aside className="lg:col-span-4 min-w-0 space-y-6">
            {/* Action rapide : Message */}
            <Button
                size="lg"
                className="w-full rounded-2xl h-12 bg-[#013ff4] hover:bg-[#013ff4]/90 text-white font-bold text-sm shadow-md shadow-[#013ff4]/20 transition-all hover:-translate-y-0.5 gap-2"
                asChild
            >
                {isLoggedIn && profile.id ? (
                    <Link href={`/messages?contact=${profile.id}`}>
                        <MessageCircle className="h-4 w-4" />
                        Message
                    </Link>
                ) : (
                    <Link href={profile.id ? `/login?redirect=/messages?contact=${profile.id}` : "/login"}>
                        <MessageCircle className="h-4 w-4" />
                        Message
                    </Link>
                )}
            </Button>

            {/* Carte Horaires (Image 2) */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgb(15,23,42,0.05)] relative overflow-hidden">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#03b3f8] shrink-0" />
                    <span>HORAIRES</span>
                </h3>

                <div className="mt-5 space-y-3.5 text-xs sm:text-sm">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="font-semibold text-muted-foreground">Lun – Ven</span>
                        <span className="font-black text-foreground">08 h – 18 h</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="font-semibold text-muted-foreground">Samedi</span>
                        <span className="font-black text-foreground">08 h – 13 h</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className="font-semibold text-muted-foreground">Dimanche</span>
                        <span className="font-semibold text-slate-400">Fermé</span>
                    </div>
                </div>
            </div>

            {/* Coordinates card */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgb(15,23,42,0.05)] relative overflow-hidden">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#013ff4]" />
                    Coordonnées
                </h3>

                <div className="mt-5 space-y-4 text-sm">
                    <div className="flex items-start gap-3.5 text-foreground hover:bg-muted/50 p-2 -mx-2 rounded-xl transition-colors duration-200">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membre depuis</div>
                            <div className="font-extrabold text-foreground">{joinedDate}</div>
                        </div>
                    </div>

                    {isLoggedIn && profile.email && (
                        <div className="flex items-start gap-3.5 text-foreground hover:bg-muted/50 p-2 -mx-2 rounded-xl transition-colors duration-200">
                            <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</div>
                                <div className="font-extrabold text-foreground break-all">{profile.email}</div>
                            </div>
                        </div>
                    )}

                    {isLoggedIn && profile.phone && (
                        <div className="flex items-start gap-3.5 text-foreground hover:bg-muted/50 p-2 -mx-2 rounded-xl transition-colors duration-200">
                            <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</div>
                                <div className="font-extrabold text-foreground break-words">{profile.phone}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Coordonnées réservées aux membres tant que le visiteur n'est pas connecté */}
                {!isLoggedIn && profile.hasContact && <LockedContact />}

                {/* Actions 1-clic : WhatsApp et appel direct */}
                {isLoggedIn && profile.phone && (
                    <div className="mt-5 grid grid-cols-2 gap-2">
                        <a
                            href={`https://wa.me/${toInternational(profile.phone)}?text=${encodeURIComponent(
                                `Bonjour ${profile.name || ""}, je vous ai trouve sur EmiID.`.replace(/\s+/g, " ").trim()
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer ugc nofollow"
                            onClick={() => { trackProfileMetric(profile.id, "whatsapp"); trackProfileContact(profile.id || "", "whatsapp") }}
                            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#059669] text-xs font-black text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#047857]"
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </a>
                        <a
                            href={`tel:+${toInternational(profile.phone)}`}
                            onClick={() => { trackProfileMetric(profile.id, "call"); trackProfileContact(profile.id || "", "call") }}
                            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-xs font-black text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
                        >
                            <Phone className="h-4 w-4" />
                            Appeler
                        </a>
                    </div>
                )}

                {profile.website && (
                    <Button
                        asChild
                        variant="outline"
                        className="w-full mt-5 h-11 rounded-2xl text-xs font-black border-border bg-card hover:bg-muted gap-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <a href={profile.website} target="_blank" rel="noopener noreferrer ugc nofollow">
                            Visiter le site <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}
            </div>

            {/* Share card */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgb(15,23,42,0.05)] overflow-hidden">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-[#013ff4] shrink-0" />
                    Partage
                </h3>

                <div className="mt-5 space-y-4">
                    <div className="flex items-center gap-2 min-w-0">
                        <Input
                            readOnly
                            value={profileUrl}
                            className="h-11 min-w-0 flex-1 bg-muted/70 border-border text-foreground font-mono text-xs focus-visible:ring-0 rounded-2xl font-semibold select-all"
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-11 w-11 rounded-2xl shrink-0 border-border bg-card hover:bg-muted transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                            onClick={() => copyToClipboard(profileUrl)}
                        >
                            {copiedLink === profileUrl ? <Check className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" /> : <Copy className="h-4 w-4 text-foreground" />}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            className="h-11 rounded-2xl border-border bg-card hover:bg-muted font-black text-xs gap-2 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                            onClick={() => setIsShareModalOpen(true)}
                        >
                            <Share className="h-4 w-4 text-[#013ff4]" />
                            Partager
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 rounded-2xl border-border bg-card hover:bg-muted font-black text-xs gap-2 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                            onClick={downloadVCard}
                        >
                            <Download className="h-4 w-4 text-[#03b3f8]" />
                            vCard
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
