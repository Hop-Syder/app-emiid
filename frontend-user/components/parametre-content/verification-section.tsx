/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « Vérification » : téléversement de pièces justificatives
 *              vers le bucket privé "verification", puis enregistrement de la référence côté API.
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { ShieldCheck, Upload, Loader2, FileText, Clock, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"
import type { UserProfileData } from "@/hooks/use-settings"
import { SectionCard } from "./settings-primitives"

interface SectionProps {
    profile: UserProfileData
}

interface VerificationDoc {
    id: string
    doc_type: string
    file_path: string
    status: "pending" | "approved" | "rejected"
    created_at: string
}

const DOC_TYPES: { value: string; label: string }[] = [
    { value: "cni", label: "CNI (Carte nationale d'identité)" },
    { value: "cip", label: "CIP" },
    { value: "passeport", label: "Passeport" },
    { value: "ifu", label: "IFU" },
    { value: "registre", label: "Registre de commerce" },
    { value: "atelier", label: "Justificatif d'atelier" },
]

const STATUS_META: Record<VerificationDoc["status"], { label: string; className: string; Icon: React.ElementType }> = {
    pending: { label: "En attente", className: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50", Icon: Clock },
    approved: { label: "Approuvé", className: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50", Icon: CheckCircle2 },
    rejected: { label: "Rejeté", className: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50", Icon: XCircle },
}

export function VerificationSection({ profile }: SectionProps) {
    const [docs, setDocs] = useState<VerificationDoc[]>([])
    const [loading, setLoading] = useState(true)
    const [docType, setDocType] = useState<string>("cni")
    const [uploading, setUploading] = useState(false)

    const loadDocs = useCallback(async () => {
        try {
            const res = await fetchWithAuth("/api/users/me/verification-docs")
            if (res.ok) setDocs(await res.json())
        } catch {
            /* silencieux */
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadDocs()
    }, [loadDocs])

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = "" // permet de re-sélectionner le même fichier
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Fichier trop lourd (max 5 MB)")
            return
        }

        setUploading(true)
        try {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) throw new Error("Session expirée")

            const ext = file.name.split(".").pop() || "bin"
            const filePath = `${user.id}/${docType}-${Date.now()}.${ext}`

            const { error: uploadError } = await supabase.storage
                .from("verification")
                .upload(filePath, file, { upsert: false })
            if (uploadError) throw uploadError

            const res = await fetchWithAuth("/api/users/me/verification-docs", {
                method: "POST",
                body: JSON.stringify({ doc_type: docType, file_path: filePath }),
            })
            if (!res.ok) {
                const err = await res.json().catch(() => null)
                throw new Error(err?.error || "Enregistrement impossible")
            }

            toast.success("Document envoyé pour vérification")
            loadDocs()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Échec du téléversement")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Statut global */}
            <SectionCard title="Badge vérifié">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-none shrink-0 ${profile.is_verified ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-muted"}`}>
                        <ShieldCheck className={`h-5 w-5 ${profile.is_verified ? "text-emerald-600" : "text-slate-400"}`} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">
                            {profile.is_verified ? "Profil vérifié" : "Profil non vérifié"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {profile.is_verified
                                ? "Ton identité professionnelle est certifiée."
                                : "Téléverse une pièce pour demander la vérification."}
                        </p>
                    </div>
                </div>
            </SectionCard>

            {/* Téléversement */}
            <SectionCard title="Envoyer une pièce" description="Formats acceptés : image ou PDF · Max 5 MB · Stockage privé et sécurisé.">
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="flex-1 h-11 px-3 rounded-none bg-muted border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {DOC_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>

                    <label
                        className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-none text-sm font-bold cursor-pointer transition-all shrink-0 ${
                            uploading
                                ? "bg-muted text-slate-400 cursor-not-allowed"
                                : "bg-[#013ff4] text-white hover:bg-[#013ff4]/90 shadow-lg shadow-[#013ff4]/25"
                        }`}
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {uploading ? "Envoi..." : "Choisir un fichier"}
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFile}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                </div>
            </SectionCard>

            {/* Documents envoyés */}
            <SectionCard title="Documents envoyés">
                {loading ? (
                    <p className="text-sm text-slate-400">Chargement...</p>
                ) : docs.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucun document envoyé pour le moment.</p>
                ) : (
                    <div className="divide-y divide-border">
                        {docs.map((doc) => {
                            const meta = STATUS_META[doc.status] || STATUS_META.pending
                            const typeLabel = DOC_TYPES.find((t) => t.value === doc.doc_type)?.label || doc.doc_type
                            return (
                                <div key={doc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="p-2 bg-muted rounded-none shrink-0">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{typeLabel}</p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`ml-3 shrink-0 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.className}`}
                                    >
                                        <meta.Icon className="h-2.5 w-2.5" />
                                        {meta.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </SectionCard>
        </div>
    )
}
