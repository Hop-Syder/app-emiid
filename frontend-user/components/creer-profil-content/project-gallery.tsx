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
import { ImagePlus, Loader2, Trash2, LayoutGrid, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProjectImage {
    id: string
    image_url: string
    title: string
    description: string
}

export function ProjectGallery() {
    const [images, setImages] = useState<ProjectImage[]>([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [editingItem, setEditingItem] = useState<ProjectImage | null>(null)
    const [saving, setSaving] = useState(false)
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

    const removeItem = async (id: string, imageUrl: string) => {
        try {
            // 1. Extraire le chemin du storage depuis l'URL
            const urlParts = imageUrl.split("/storage/v1/object/public/projects/")
            const filePath = urlParts[1]

            // 2. Delete from DB
            const { error: dbError } = await supabase
                .from('project_gallery')
                .delete()
                .eq('id', id)

            if (dbError) throw dbError

            // 3. Delete from Storage (facultatif mais propre)
            if (filePath) {
                 await supabase.storage.from("projects").remove([filePath])
            }

            setImages(images.filter(img => img.id !== id))
            toast.success("Projet retiré de la galerie")
        } catch (error: any) {
            toast.error("Erreur: " + error.message)
        }
    }

    const updateProject = async () => {
        if (!editingItem) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from('project_gallery')
                .update({
                    title: editingItem.title,
                    description: editingItem.description
                })
                .eq('id', editingItem.id)

            if (error) throw error
            setImages(images.map(img => img.id === editingItem.id ? editingItem : img))
            setEditingItem(null)
            toast.success("Projet mis à jour")
        } catch (error: any) {
            toast.error("Erreur de mise à jour")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
            <p className="text-sm text-slate-400 font-medium">Chargement de votre galerie...</p>
        </div>
    )

    return (
        <Card className="rounded-[2.5rem] mt-8 overflow-hidden border-none shadow-2xl shadow-slate-200/50 bg-white/40 backdrop-blur-2xl">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50/50 p-8 border-b border-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-white rounded-3xl shadow-xl shadow-indigo-100/50">
                           <LayoutGrid className="h-7 w-7 text-primary" />
                       </div>
                       <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Galerie de Projets</h2>
                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                <span className="inline-block w-5 h-[1px] bg-slate-200" />
                                Showcase de vos plus belles réalisations ({images.length}/10)
                            </p>
                       </div>
                    </div>
                    
                    <label className={cn(
                        "group relative flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-primary hover:scale-105 transition-all duration-300 shadow-xl shadow-slate-200 overflow-hidden",
                        (uploading || images.length >= 10) && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                        <span className="font-bold text-sm tracking-wide">{uploading ? "UPLOAD EN COURS..." : "AJOUTER UN PROJET"}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading || images.length >= 10} />
                    </label>
                </div>
            </div>

            <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {images.map((img, idx) => (
                        <motion.div 
                            key={img.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                        >
                            <img src={img.image_url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            
                            {/* Overlay au survol */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="space-y-2">
                                    <h4 className="text-white font-bold text-base truncate">{img.title}</h4>
                                    <p className="text-white/70 text-xs line-clamp-2 leading-relaxed">
                                        {img.description || "Aucune description"}
                                    </p>
                                    <div className="flex gap-2 pt-4">
                                        <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            className="rounded-xl flex-1 h-9 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/40"
                                            onClick={() => setEditingItem(img)}
                                        >
                                            <Edit3 className="h-3.5 w-3.5 mr-2" /> Modifier
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            className="rounded-xl h-9 w-9 p-0 bg-red-500/80 hover:bg-red-600"
                                            onClick={() => removeItem(img.id, img.image_url)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
                                <ImagePlus className="h-10 w-10 text-slate-300" />
                            </div>
                            <div className="max-w-xs space-y-2">
                                <h3 className="text-lg font-bold text-slate-900">Votre galerie est vide</h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                    Ajoutez jusqu'à 10 photos de vos réalisations pour convaincre vos futurs clients.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Modal d'édition des détails (Dialog) */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-lg">
                    <div className="aspect-video w-full relative">
                        <img src={editingItem?.image_url} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Titre du Projet</Label>
                                <Input 
                                    className="rounded-2xl border-slate-100 bg-slate-50 h-12 focus:bg-white transition-all font-bold"
                                    value={editingItem?.title || ""}
                                    onChange={(e) => setEditingItem(prev => prev ? {...prev, title: e.target.value} : null)}
                                    placeholder="Ex: Tissage de soie rouge"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Description (Max 200 car.)</Label>
                                <Textarea 
                                    className="rounded-2xl border-slate-100 bg-slate-50 min-h-[100px] focus:bg-white transition-all text-sm font-medium leading-relaxed"
                                    value={editingItem?.description || ""}
                                    onChange={(e) => setEditingItem(prev => prev ? {...prev, description: e.target.value} : null)}
                                    placeholder="Décrivez brièvement le travail effectué..."
                                    maxLength={200}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="rounded-2xl flex-1 h-12 font-bold" onClick={() => setEditingItem(null)}>Annuler</Button>
                            <Button 
                                className="rounded-2xl flex-[2] h-12 font-bold bg-primary shadow-lg shadow-primary/20" 
                                onClick={updateProject}
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sauvegarder les modifications"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
