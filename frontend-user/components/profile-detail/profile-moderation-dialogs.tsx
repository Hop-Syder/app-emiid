/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dialogues de modération (Signaler / Bloquer) extraits de la page
 *              de détail de profil pour alléger le composant principal.
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface ProfileModerationDialogsProps {
    profileName?: string
    // Signalement
    isReportOpen: boolean
    onReportOpenChange: (open: boolean) => void
    reportReason: string
    onReportReasonChange: (value: string) => void
    reportSubmitting: boolean
    onReportSubmit: () => void
    // Blocage
    isBlockOpen: boolean
    onBlockOpenChange: (open: boolean) => void
    blocking: boolean
    onBlock: () => void
}

export function ProfileModerationDialogs({
    profileName,
    isReportOpen,
    onReportOpenChange,
    reportReason,
    onReportReasonChange,
    reportSubmitting,
    onReportSubmit,
    isBlockOpen,
    onBlockOpenChange,
    blocking,
    onBlock,
}: ProfileModerationDialogsProps) {
    return (
        <>
            {/* Signalement */}
            <Dialog open={isReportOpen} onOpenChange={(o) => { if (!reportSubmitting) onReportOpenChange(o) }}>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Signaler ce profil</DialogTitle>
                        <DialogDescription>
                            Décrivez le problème. Notre équipe de modération examinera votre signalement.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={reportReason}
                        onChange={(e) => onReportReasonChange(e.target.value)}
                        maxLength={1000}
                        rows={4}
                        placeholder="Ex. : contenu trompeur, usurpation d'identité, propos inappropriés..."
                        className="rounded-2xl resize-none"
                    />
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <span className="text-[11px] text-slate-400">{reportReason.length}/1000</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => onReportOpenChange(false)} disabled={reportSubmitting} className="rounded-xl">
                                Annuler
                            </Button>
                            <Button onClick={onReportSubmit} disabled={reportSubmitting} className="rounded-xl gap-2">
                                {reportSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Envoyer le signalement
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Blocage */}
            <Dialog open={isBlockOpen} onOpenChange={(o) => { if (!blocking) onBlockOpenChange(o) }}>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Bloquer {profileName || "ce membre"} ?</DialogTitle>
                        <DialogDescription>
                            Vous ne verrez plus ce profil. Vous pourrez le débloquer depuis vos paramètres.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => onBlockOpenChange(false)} disabled={blocking} className="rounded-xl">
                            Annuler
                        </Button>
                        <Button
                            onClick={onBlock}
                            disabled={blocking}
                            className="rounded-xl gap-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {blocking && <Loader2 className="h-4 w-4 animate-spin" />}
                            Bloquer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
