/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant de gestion de galerie de projets
 * @created 2026-03-12
 * @updated 2026-03-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ImagePlus, Loader2, Trash2, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProjectImage {
    id?: string
    image_url: string
    title: string
    description?: string
}

export function ProjectGallery() {
    const [images, setImages] = useState<ProjectImage[]>([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Charger la galerie existante
    useEffect(() => {
        const loadGallery = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data, error } = await supabase
                    .from('project_gallery')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true })

                if (error) throw error
                setImages(data || [])
            } catch (err) {
                console.error("Load gallery error:", err)
            } finally {
                setLoading(false)
            }
        }
        loadGallery()
    }, [supabase])

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return

            if (images.length >= 10) {
                toast.error("Limite de 10 images atteinte.")
                return
            }

            const file = event.target.files[0]
            if (!file.type.startsWith("image/")) {
                toast.error("Format invalide.")
                return
            }

            setUploading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Non connecté")

            // Récupérer le profile_id
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (!profile) throw new Error("Profil non trouvé")

            const fileExt = file.name.split(".").pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            // 1. Upload Storage
            const { error: uploadError } = await supabase.storage
                .from("projects")
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from("projects")
                .getPublicUrl(filePath)

            // 3. Save to DB
            const { data: newImage, error: dbError } = await supabase
                .from('project_gallery')
                .insert({
                    user_id: user.id,
                    profile_id: profile.id,
                    image_url: publicUrl,
                    title: "Nouveau Projet"
                })
                .select()
                .single()

            if (dbError) throw dbError

            setImages([...images, newImage])
            toast.success("Image ajoutée à la galerie !")
        } catch (error: any) {
            toast.error("Erreur: " + error.message)
        } finally {
            setUploading(false)
        }
    }

    const removeItem = async (id: string) => {
        try {
            // Delete from DB
            const { error: dbError } = await supabase
                .from('project_gallery')
                .delete()
                .eq('id', id)

            if (dbError) throw dbError

            setImages(images.filter(img => img.id !== id))
            toast.success("Image supprimée")
        } catch (error: any) {
            toast.error("Erreur: " + error.message)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <Card className="rounded-3xl mt-6 border-none shadow-sm bg-muted/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5 text-primary" />
                            Galerie de Projets
                        </CardTitle>
                        <CardDescription>Montrez vos plus belles réalisations (Max 10 images)</CardDescription>
                    </div>
                    <label className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-2xl cursor-pointer hover:bg-primary/90 transition-all text-sm font-medium shadow-sm",
                        (uploading || images.length >= 10) && "opacity-50 cursor-not-allowed"
                    )}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                        {uploading ? "Chargement..." : "Ajouter un projet"}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading || images.length >= 10}
                        />
                    </label>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((img) => (
                        <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-white border border-muted-foreground/10">
                            <img
                                src={img.image_url}
                                alt={img.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full absolute top-2 right-2 scale-0 group-hover:scale-100 transition-transform"
                                    onClick={() => removeItem(img.id!)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <p className="text-[10px] text-white font-medium truncate">{img.title}</p>
                            </div>
                        </div>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-3xl">
                            <ImagePlus className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">Votre galerie est vide</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
