/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'upload d'avatar vers Supabase Storage avec prévisualisation
 * @created 2026-01-05
*/

"use client"

import { useState, useEffect } from "react"
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

export function AvatarUpload({ currentAvatarUrl, onUploadComplete, disabled }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl)

    // Synchronisation de la prévisualisation quand l'URL parente change
    useEffect(() => {
        setPreview(currentAvatarUrl)
    }, [currentAvatarUrl])

    const supabase = createClient()

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return
            }

            const file = event.target.files[0]

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

            // Récupération de la session pour créer un chemin unique par utilisateur
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error("Vous devez être connecté pour changer votre photo.")
                return
            }

            const user = session.user
            const fileExt = file.name.split(".").pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

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
            toast.error("Erreur lors de l'upload : " + (error as Error).message)
        } finally {
            setUploading(false)
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

                <label
                    htmlFor="avatar-input"
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
                </label>

                <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading || disabled}
                    className="hidden"
                />
            </div>

            <div className="space-y-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    asChild
                    disabled={uploading || disabled}
                >
                    <label htmlFor="avatar-input" className="cursor-pointer">
                        {uploading ? "Chargement..." : "Changer la photo"}
                    </label>
                </Button>
                <p className="text-xs text-muted-foreground">
                    JPG, PNG ou GIF. Max 2MB.
                </p>
            </div>
        </div>
    )
}
