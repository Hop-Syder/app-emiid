/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'upload d'avatar vers Supabase Storage avec déclenchement par ref
 * @created 2026-01-05
 * @updated 2026-07-08
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import React, { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Camera, Loader2, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getOptimizedImageUrl } from "@/lib/image-optimization"

interface AvatarUploadProps {
    currentAvatarUrl: string | null
    onUploadComplete: (newUrl: string) => void
    disabled?: boolean
}

export const AvatarUpload = React.memo(function AvatarUpload({ currentAvatarUrl, onUploadComplete, disabled }: AvatarUploadProps) {
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
            toast.success("Photo de profil prête !")

        } catch (error: unknown) {
            console.error("Erreur upload:", error)
            toast.error(uploadErrorMessage(error))
        } finally {
            setUploading(false)
            // Permet de re-sélectionner le même fichier après un échec
            input.value = ""
        }
    }

    return (
        <div className="flex items-center gap-6">
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
