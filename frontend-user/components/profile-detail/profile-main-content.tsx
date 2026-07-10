/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Sous-composant Contenu Principal (Bio, Skills, Portfolio, Expériences) pour le détail de profil.
 * @created 2026-06-13
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PortfolioGallery } from "./portfolio-gallery"

const getSkillBadgeStyles = (idx: number) => {
    const presets = [
        "from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200/50 hover:bg-blue-100/20",
        "from-[#03b3f8]/5 to-[#03b3f8]/10 text-[#03b3f8] border-[#03b3f8]/20 hover:bg-[#03b3f8]/15",
        "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100/20",
        "from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200/50 hover:bg-amber-100/20",
        "from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200/50 hover:bg-purple-100/20",
    ]
    return presets[idx % presets.length]
}

interface ExperienceItem {
    title: string
    company: string
    period: string
}

interface ProfileData {
    bio: string | null
    skills: string[]
    experiences: ExperienceItem[]
}

interface GalleryItem {
    id: string
    title: string | null
    description: string | null
    imageUrl: string
    status?: string
}

interface ProfileMainContentProps {
    profile: ProfileData
    gallery: GalleryItem[]
    loadingGallery: boolean
}

export function ProfileMainContent({ profile, gallery, loadingGallery }: ProfileMainContentProps) {
    return (
        <div className="lg:col-span-8 min-w-0 space-y-6">
            {/* About card */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-xl shadow-slate-100/40 relative overflow-hidden group">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#03b3f8]/5 to-transparent rounded-bl-full pointer-events-none" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#03b3f8] shrink-0" />
                    À propos de moi
                </h2>
                <p className="mt-5 text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line break-words font-medium">
                    {profile.bio}
                </p>
            </div>

            {/* Tabs content card */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-xl shadow-slate-100/40 min-w-0 overflow-hidden">
                <Tabs defaultValue="skills" className="w-full min-w-0">
                    <TabsList className="bg-slate-100/50 border border-slate-200/50 w-full justify-start h-auto p-1.5 mb-6 gap-2 rounded-2xl backdrop-blur-sm flex overflow-x-auto no-scrollbar snap-x whitespace-nowrap">
                        <TabsTrigger
                            value="skills"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#013ff4] data-[state=active]:shadow-md data-[state=active]:border-white/80 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-black text-slate-500 transition-all duration-300 snap-start shrink-0"
                        >
                            Compétences
                        </TabsTrigger>
                        <TabsTrigger
                            value="portfolio"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#013ff4] data-[state=active]:shadow-md data-[state=active]:border-white/80 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-black text-slate-500 transition-all duration-300 snap-start shrink-0"
                        >
                            Portfolio & Réalisations
                        </TabsTrigger>
                        <TabsTrigger
                            value="experience"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#013ff4] data-[state=active]:shadow-md data-[state=active]:border-white/80 bg-transparent px-5 py-2.5 text-xs sm:text-sm font-black text-slate-500 transition-all duration-300 snap-start shrink-0"
                        >
                            Parcours & Expériences
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="skills" className="animate-in fade-in duration-300 focus-visible:outline-none">
                        <div className="flex flex-wrap gap-2.5">
                            {profile.skills.length > 0 ? (
                                profile.skills.map((skill: string, idx: number) => (
                                    <Badge
                                        key={idx}
                                        variant="outline"
                                        className={cn(
                                            "px-4 py-2 rounded-xl bg-gradient-to-r font-bold border transition-all text-xs hover:-translate-y-0.5 duration-300 shadow-sm",
                                            getSkillBadgeStyles(idx)
                                        )}
                                    >
                                        {skill}
                                    </Badge>
                                ))
                            ) : (
                                <div className="p-8 border border-dashed border-slate-200 text-center w-full rounded-2xl bg-slate-50/50">
                                    <p className="text-slate-500 font-bold text-xs">Aucune compétence spécifiée pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="portfolio" className="animate-in fade-in duration-300 focus-visible:outline-none">
                        <PortfolioGallery gallery={gallery} loadingGallery={loadingGallery} />
                    </TabsContent>

                    <TabsContent value="experience" className="animate-in fade-in duration-300 focus-visible:outline-none">
                        <div className="space-y-4">
                            {profile.experiences.length > 0 ? (
                                <div className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-6 py-2">
                                    {profile.experiences.map((exp: ExperienceItem, idx: number) => (
                                        <div key={idx} className="relative group">
                                            <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#013ff4] flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                                <div className="h-1 w-1 rounded-full bg-[#013ff4]" />
                                            </div>
                                            <div className="transition-all duration-300 group-hover:translate-x-1">
                                                <h4 className="text-sm font-extrabold text-slate-900">{exp.title}</h4>
                                                <p className="text-xs font-bold text-slate-500 mt-1">
                                                    {exp.company} • {exp.period}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
                                    <p className="text-sm font-bold text-slate-700">Parcours non renseigné.</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Ce membre est actif sur EmiID et ouvert aux opportunités de collaboration.
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
