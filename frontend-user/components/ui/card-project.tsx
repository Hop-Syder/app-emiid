/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de projet market avec design premium et animations
 * @created 2025-12-26
*/

"use client"

import { Building2, TrendingUp, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Project } from "@/data/mock-data"

interface CardProjectProps {
    project: Project;
}

export function CardProject({ project }: CardProjectProps) {
    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'Financement':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Partenaires':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'À vendre':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    }

    return (
        <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative">

            <CardHeader className="relative overflow-hidden">
                {project.category === 'Financement' && (
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="h-20 w-20 rotate-12" />
                    </div>
                )}
                <div className="flex items-start justify-between relative z-10">
                    <Badge className={`rounded-xl border px-3 py-1 font-semibold transition-transform group-hover:scale-105 ${getCategoryStyles(project.category)}`}>
                        {project.category}
                    </Badge>
                    <div className="flex gap-2">
                        {project.daysRemaining && (
                            <Badge variant="outline" className="rounded-full bg-white/50 backdrop-blur-sm border-muted/50">
                                {project.daysRemaining}j restants
                            </Badge>
                        )}
                        {project.responses !== undefined && (
                            <Badge variant="outline" className="rounded-full bg-white/50 backdrop-blur-sm text-primary border-primary/20">
                                {project.responses} réponses
                            </Badge>
                        )}
                        {project.interestedCount !== undefined && (
                            <Badge variant="outline" className="rounded-full bg-white/50 backdrop-blur-sm text-accent border-accent/20">
                                {project.interestedCount} intéressés
                            </Badge>
                        )}
                    </div>
                </div>
                <CardTitle className="mt-4 text-xl group-hover:text-primary transition-colors">{project.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 font-medium">
                    <span className="text-foreground/80">{project.author}</span>
                    <span>•</span>
                    <span>{project.location}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 relative">
                {project.category === 'Financement' && project.progress !== undefined && (
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-extrabold">Collecté</p>
                                    <p className="font-black text-lg text-primary">{project.currentAmount?.toLocaleString()} €</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-extrabold">Objectif</p>
                                    <p className="font-black text-lg">{project.targetAmount?.toLocaleString()} €</p>
                                </div>
                            </div>
                            <Progress value={project.progress} className="h-2.5 bg-primary/10" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {project.contributors} contributeurs</span>
                            <span className="bg-primary px-2 py-0.5 rounded-full text-white">{project.progress}%</span>
                        </div>
                        <Button className="w-full rounded-2xl bg-primary hover:bg-primary/95 shadow-md shadow-primary/20 transition-all active:scale-[0.98] h-11 font-bold">
                            Contribuer au Projet
                        </Button>
                    </>
                )}

                {project.category === 'Partenaires' && (
                    <>
                        <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50">
                            <p className="text-sm text-amber-900/80 leading-relaxed italic">"{project.description}"</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary/80 bg-primary/5 p-3 rounded-2xl border border-primary/10">
                            <Building2 className="h-4 w-4" />
                            <span>Besoin de Partenariat Commercial</span>
                        </div>
                        <Button className="w-full rounded-2xl transition-all active:scale-[0.98] h-11 border-primary/20 hover:bg-primary/5 text-primary bg-white shadow-sm" variant="outline">
                            Proposer un Partenariat
                        </Button>
                    </>
                )}

                {project.category === 'À vendre' && (
                    <>
                        <div className="flex items-center justify-between bg-accent/5 p-4 rounded-2xl border border-accent/10">
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-extrabold">Prix de Vente</p>
                                <p className="text-2xl font-black text-accent">{project.targetAmount?.toLocaleString()} €</p>
                            </div>
                            <Badge className="rounded-xl bg-accent text-white px-3 py-1.5 font-bold shadow-sm shadow-accent/20 border-none">
                                {project.shares}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-2xl">
                            <TrendingUp className="h-4 w-4 text-accent" />
                            <span className="font-semibold">{project.description}</span>
                        </div>
                        <Button className="w-full rounded-2xl transition-all active:scale-[0.98] h-11 border-accent/20 hover:bg-accent/5 text-accent bg-white shadow-sm" variant="outline">
                            Je suis Intéressé
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
