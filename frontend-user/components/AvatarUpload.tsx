/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'upload d'avatar vers Supabase Storage avec support variante luxury profile-card
 * @created 2026-01-05
 * @updated 2026-09-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import React, { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Camera, Loader2, User, Mail, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getOptimizedImageUrl } from "@/lib/image-optimization"

interface AvatarUploadProps {
    currentAvatarUrl: string | null
    onUploadComplete: (newUrl: string) => void
    disabled?: boolean
    onDelete?: () => void
    email?: string | null
    variant?: "default" | "profile-card"
    className?: string
}

export const AvatarUpload = React.memo(function AvatarUpload({
    currentAvatarUrl,
    onUploadComplete,
    disabled,
    onDelete,
    email,
    variant = "default",
    className,
}: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || "/profil/avatar.jpg")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Synchronisation de la prévisualisation quand l'URL parente change
    useEffect(() => {
        setPreview(currentAvatarUrl || "/profil/avatar.jpg")
    }, [currentAvatarUrl])

    const supabase = createClient()

    const triggerFileInput = () => {
        if (!uploading && !disabled) {
            fileInputRef.current?.click()
        }
    }

    // Traduit les erreurs techniques Supabase Storage en messages compréhensibles.
    const uploadErrorMessage = (error: unknown): string => {
        const raw = error instanceof Error ? error.message : String(error ?? "")
        const msg = raw.toLowerCase()
        if (msg.includes("row-level security") || msg.includes("violates") || msg.includes("unauthorized") || msg.includes("403")) {
            return "Le stockage a refusé l'envoi (droits insuffisants). Reconnectez-vous puis réessayez — si le problème persiste, contactez le support."
        }
        if (msg.includes("bucket") && msg.includes("not found")) {
            return "Espace de stockage introuvable. Contactez le support."
        }
        if (msg.includes("payload too large") || msg.includes("entity too large") || msg.includes("413")) {
            return "L'image dépasse la taille autorisée par le serveur (Max 2MB)."
        }
        if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
            return "Connexion instable : l'envoi a échoué. Vérifiez votre réseau puis réessayez."
        }
        if (msg.includes("jwt") || msg.includes("token") || msg.includes("expired")) {
            return "Votre session a expiré. Reconnectez-vous pour changer votre photo."
        }
        return `Échec de l'envoi de la photo${raw ? ` : ${raw}` : ""}. Réessayez dans un instant.`
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target
        try {
            if (!input.files || input.files.length === 0) {
                return
            }

            const file = input.files[0]

            // Validation : image uniquement
            if (!file.type.startsWith("image/")) {
                toast.error("Veuillez sélectionner une image valide.")
                return
            }

            // Validation : Taille Max 2MB
            if (file.size > 2 * 1024 * 1024) {
                toast.error("L'image est trop lourde (Max 2MB) !")
                return
            }

            setUploading(true)

            // Session requise : le chemin d'upload est scopé au dossier de l'utilisateur
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error("Vous devez être connecté pour changer votre photo.")
                return
            }

            // Extension dérivée du type MIME (le nom de fichier n'est pas fiable)
            const extByMime: Record<string, string> = {
                "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp",
            }
            const fileExt = extByMime[file.type]
                || file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "")
                || "jpg"

            // RLS storage : le chemin DOIT commencer par l'UID de l'utilisateur
            const user = session.user
            const filePath = `${user.id}/${Date.now()}.${fileExt}`

            // Upload vers le bucket 'avatars'
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type
                })

            if (uploadError) throw uploadError

            // Récupération de l'URL publique
            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath)

            setPreview(publicUrl)
            onUploadComplete(publicUrl)
            toast.success("Photo de profil mise à jour avec succès !")

        } catch (error: unknown) {
            console.error("Erreur upload:", error)
            toast.error(uploadErrorMessage(error))
        } finally {
            setUploading(false)
            // Permet de re-sélectionner le même fichier après un échec
            input.value = ""
        }
    }

    const hasCustomPhoto = Boolean(
        currentAvatarUrl &&
        currentAvatarUrl !== "/profil/avatar.jpg" &&
        !currentAvatarUrl.endsWith("/avatar.jpg")
    )

    /* ═════════════════════════════════════════════════════════════════════════
       VARIANTE 1 : PROFILE-CARD (Paramètres Profil — Luxury Bento & Glass)
       ═════════════════════════════════════════════════════════════════════════ */
    if (variant === "profile-card") {
        return (
            <div className={cn("flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left", className)}>
                {/* Cadre Avatar avec anneau Luxury & déclencheur Caméra */}
                <div className="relative group shrink-0">
                    <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#013ff4]/20 via-transparent to-[#03b3f8]/25 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_8px_25px_rgba(1,63,244,0.14)]">
                        <Avatar className="h-24 w-24 sm:h-26 sm:w-26 border-2 border-white dark:border-slate-800 shadow-inner">
                            <AvatarImage
                                src={getOptimizedImageUrl(preview || "/profil/avatar.jpg", { width: 256, height: 256 })}
                                alt="Photo de profil"
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400">
                                <User className="h-10 w-10 text-slate-400" />
                            </AvatarFallback>
                        </Avatar>

                        {/* Overlay au survol */}
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={uploading || disabled}
                            aria-label="Changer la photo de profil"
                            className={cn(
                                "absolute inset-1 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer",
                                uploading && "opacity-100 cursor-wait",
                                disabled && "cursor-not-allowed hidden"
                            )}
                        >
                            {uploading ? (
                                <Loader2 className="h-7 w-7 animate-spin" />
                            ) : (
                                <Camera className="h-7 w-7" />
                            )}
                        </button>

                        {/* Badge Caméra flottant en bas à droite */}
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={uploading || disabled}
                            aria-label="Changer la photo"
                            className={cn(
                                "absolute bottom-0 right-0 p-2 rounded-full shadow-md border-2 border-white dark:border-slate-900 transition-all duration-200 cursor-pointer",
                                "bg-[#013ff4] text-white hover:bg-[#013ff4]/90 hover:scale-110 active:scale-95",
                                uploading && "opacity-80 cursor-wait",
                                disabled && "cursor-not-allowed opacity-50"
                            )}
                        >
                            {uploading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Camera className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        id="avatar-input"
                        name="avatar_file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        disabled={uploading || disabled}
                        style={{ display: "none" }}
                    />
                </div>

                {/* Colonne informations & actions — Uniquement l'email, aucun nom */}
                <div className="min-w-0 flex-1 space-y-2.5">
                    {/* Badge Email exclusif */}
                    {email && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 max-w-full">
                            <Mail className="w-3.5 h-3.5 text-[#013ff4] shrink-0" />
                            <span className="text-xs font-semibold text-foreground truncate">{email}</span>
                        </div>
                    )}

                    {/* Groupe d'actions : Changer + Supprimer */}
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-0.5">
                        <Button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={uploading || disabled}
                            className="h-9 px-4 rounded-xl bg-[#013ff4] hover:bg-[#013ff4]/90 text-white font-bold text-xs shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            {uploading ? (
                                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Envoi en cours...</>
                            ) : (
                                <><Camera className="w-3.5 h-3.5 mr-1.5" /> Changer la photo</>
                            )}
                        </Button>

                        {hasCustomPhoto && onDelete && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onDelete}
                                disabled={uploading || disabled}
                                className="h-9 px-3 rounded-xl border-border/80 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 text-muted-foreground font-semibold text-xs active:scale-95 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Supprimer
                            </Button>
                        )}
                    </div>

                    {/* Mention technique */}
                    <p className="text-[11px] text-muted-foreground/80 font-medium">
                        JPG, PNG ou WEBP · Max 2 Mo · Format carré recommandé
                    </p>
                </div>
            </div>
        )
    }

    /* ═════════════════════════════════════════════════════════════════════════
       VARIANTE 2 : DEFAULT (Rétrocompatibilité Wizard & Formulaires)
       ═════════════════════════════════════════════════════════════════════════ */
    return (
        <div className={cn("flex items-center gap-6", className)}>
            <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-white shadow-md transition-all group-hover:ring-4 group-hover:ring-primary/20">
                    <AvatarImage src={getOptimizedImageUrl(preview || "/profil/avatar.jpg", { width: 200, height: 200 })} className="object-cover" />
                    <AvatarFallback className="bg-amber-100 text-amber-900">
                        <User className="h-10 w-10" />
                    </AvatarFallback>
                </Avatar>

                <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={uploading || disabled}
                    aria-label="Changer la photo de profil"
                    className={cn(
                        "absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                        uploading && "opacity-100 cursor-wait",
                        disabled && "cursor-not-allowed hidden"
                    )}
                >
                    {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                        <Camera className="h-8 w-8" />
                    )}
                </button>

                <input
                    ref={fileInputRef}
                    id="avatar-input"
                    name="avatar_file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading || disabled}
                    style={{ display: "none" }}
                />
            </div>

            <div className="space-y-1">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl font-bold"
                    onClick={triggerFileInput}
                    disabled={uploading || disabled}
                >
                    {uploading ? "Chargement..." : "Changer la photo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                    JPG, PNG ou GIF. Max 2MB.
                </p>
            </div>
        </div>
    )
})
