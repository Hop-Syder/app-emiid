/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Sous-composant Sidebar (Coordonnées, Partage) pour le détail de profil.
 * @created 2026-06-13
 * @updated 2026-06-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { Calendar, Check, Copy, Download, ExternalLink, Globe, Mail, Phone, Share, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ProfileSidebar({
    profile,
    joinedDate,
    profileUrl,
    copiedLink,
    copyToClipboard,
    setIsShareModalOpen,
    downloadVCard
}: any) {
    return (
        <aside className="lg:col-span-4 space-y-6">
            {/* Coordinates card */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-xl shadow-slate-100/40 relative overflow-hidden">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#022753]" />
                    Coordonnées
                </h3>

                <div className="mt-5 space-y-4 text-sm">
                    <div className="flex items-start gap-3.5 text-slate-700 hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors duration-200">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membre depuis</div>
                            <div className="font-extrabold text-slate-800">{joinedDate}</div>
                        </div>
                    </div>

                    {profile.email && (
                        <div className="flex items-start gap-3.5 text-slate-700 hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors duration-200">
                            <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</div>
                                <div className="font-extrabold text-slate-800 break-all">{profile.email}</div>
                            </div>
                        </div>
                    )}

                    {profile.phone && (
                        <div className="flex items-start gap-3.5 text-slate-700 hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors duration-200">
                            <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</div>
                                <div className="font-extrabold text-slate-800 break-words">{profile.phone}</div>
                            </div>
                        </div>
                    )}
                </div>

                {profile.website && (
                    <Button
                        asChild
                        variant="outline"
                        className="w-full mt-5 h-11 rounded-2xl text-xs font-black border-slate-200 bg-white/80 hover:bg-slate-50 gap-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <a href={profile.website} target="_blank" rel="noopener noreferrer">
                            Visiter le site <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}
            </div>

            {/* Share card */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-xl shadow-slate-100/40">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-[#022753]" />
                    Partage
                </h3>

                <div className="mt-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Input
                            readOnly
                            value={profileUrl}
                            className="h-11 bg-slate-50/70 border-slate-200 text-slate-700 font-mono text-xs focus-visible:ring-0 rounded-2xl font-semibold select-all"
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-11 w-11 rounded-2xl shrink-0 border-slate-200 bg-white/80 hover:bg-slate-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                            onClick={() => copyToClipboard(profileUrl)}
                        >
                            {copiedLink === profileUrl ? <Check className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" /> : <Copy className="h-4 w-4 text-slate-700" />}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            className="h-11 rounded-2xl border-slate-200 bg-white/80 hover:bg-slate-50 font-black text-xs gap-2 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                            onClick={() => setIsShareModalOpen(true)}
                        >
                            <Share className="h-4 w-4 text-[#022753]" />
                            Partager
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 rounded-2xl border-slate-200 bg-white/80 hover:bg-slate-50 font-black text-xs gap-2 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                            onClick={downloadVCard}
                        >
                            <Download className="h-4 w-4 text-[#CE1126]" />
                            vCard
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
