/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Gestion des réalisations (project_gallery) — upload, statut, suppression
 * @updated 2026-06-22
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Clock, CheckCircle, XCircle, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"

type GalleryStatus = "pending" | "approved" | "rejected"

interface GalleryItem {
  id: string
  user_id: string
  profile_id: string | null
  title: string | null
  description: string | null
  image_url: string
  status: GalleryStatus
  rejection_reason: string | null
  order_index: number
  created_at: string
}

interface RealisationsSectionProps {
  userId: string
  profileId: string | null
}

const STATUS_CONFIG: Record<GalleryStatus, { label: string; icon: React.ElementType; classes: string }> = {
  pending:  { label: "En attente", icon: Clock,        classes: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Publié",     icon: CheckCircle,  classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Refusé",     icon: XCircle,      classes: "bg-red-50 text-red-700 border-red-200" },
}

export function RealisationsSection({ userId, profileId }: RealisationsSectionProps) {
  const [items, setItems]           = useState<GalleryItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null)
  const [uploading, setUploading]   = useState(false)
  const [file, setFile]             = useState<File | null>(null)
  const [preview, setPreview]       = useState<string | null>(null)
  const [title, setTitle]           = useState("")
  const [description, setDescription] = useState("")

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("project_gallery")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (data) setItems(data as GalleryItem[])
    setLoading(false)
  }

  useEffect(() => { void load() }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error("Image trop lourde — max 5 Mo"); return }
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleAdd = async () => {
    if (!file) { toast.error("Choisissez une image"); return }
    if (!profileId) { toast.error("Profil introuvable — complétez votre profil avant d'ajouter une réalisation."); return }
    setUploading(true)
    try {
      const ext  = file.name.split(".").pop() ?? "jpg"
      const path = `${userId}/${Date.now()}.${ext}`

      const { data: storageData, error: storageError } = await supabase.storage
        .from("project_gallery")
        .upload(path, file, { upsert: false })
      if (storageError) throw storageError

      const { data: { publicUrl } } = supabase.storage
        .from("project_gallery")
        .getPublicUrl(storageData.path)

      const { error: insertError } = await supabase
        .from("project_gallery")
        .insert({
          user_id:     userId,
          profile_id:  profileId,
          image_url:   publicUrl,
          title:       title.trim() || null,
          description: description.trim() || null,
          status:      "pending",
          order_index: items.length,
        })
      if (insertError) throw insertError

      toast.success("Réalisation envoyée en modération")
      setDialogOpen(false)
      setFile(null); setPreview(null); setTitle(""); setDescription("")
      void load()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors de l'upload"
      toast.error(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (item: GalleryItem) => {
    // Remove from Storage
    const bucketMarker = "/project_gallery/"
    const markerIdx = item.image_url.indexOf(bucketMarker)
    if (markerIdx !== -1) {
      const storagePath = item.image_url.slice(markerIdx + bucketMarker.length)
      await supabase.storage.from("project_gallery").remove([storagePath])
    }
    await supabase.from("project_gallery").delete().eq("id", item.id)
    toast.success("Réalisation supprimée")
    setDeleteTarget(null)
    void load()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {items.length} réalisation{items.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {items.filter(i => i.status === "approved").length} publiée{items.filter(i => i.status === "approved").length !== 1 ? "s" : ""} sur votre profil
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-9 px-4 rounded-xl text-sm font-bold gap-2 shadow-sm shrink-0">
          <Plus className="h-4 w-4 shrink-0" />
          Ajouter
        </Button>
      </div>

      {/* Grid or empty state */}
      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Aucune réalisation pour le moment</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Ajoutez des photos de vos travaux — elles apparaîtront sur votre profil public après validation.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} variant="outline" className="h-9 px-4 rounded-xl text-sm font-bold gap-2 border-slate-200">
            <Plus className="h-4 w-4" />
            Première réalisation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map(item => {
            const cfg  = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending
            const Icon = cfg.icon
            return (
              <div key={item.id} className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-slate-100 relative w-full">
                  <Image
                    src={item.image_url}
                    alt={item.title ?? "Réalisation"}
                    fill
                    sizes="(max-width: 640px) 50vw, 30vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Status badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border shadow-sm ${cfg.classes}`}>
                    <Icon className="h-2.5 w-2.5 shrink-0" />
                    {cfg.label}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Info footer */}
                {(item.title || (item.status === "rejected" && item.rejection_reason)) && (
                  <div className="p-3 border-t border-slate-100">
                    {item.title && (
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                    )}
                    {item.status === "rejected" && item.rejection_reason && (
                      <p className="text-[10px] text-red-600 mt-0.5 line-clamp-2">{item.rejection_reason}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={open => { if (!uploading) setDialogOpen(open) }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Nouvelle réalisation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">

            {/* Image drop zone */}
            <button
              type="button"
              onClick={() => document.getElementById("gallery-upload")?.click()}
              className={`w-full cursor-pointer rounded-2xl border-2 border-dashed overflow-hidden transition-colors ${
                preview ? "border-primary/30" : "border-slate-200 hover:border-primary/40"
              }`}
            >
              {preview ? (
                <div className="relative w-full aspect-video">
                  <Image src={preview} alt="Aperçu" fill className="object-cover" />
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center gap-3 text-slate-400 px-6">
                  <ImageIcon className="h-8 w-8" />
                  <p className="text-sm font-semibold">Cliquez pour choisir une image</p>
                  <p className="text-xs">JPG, PNG, WEBP — max 5 Mo</p>
                </div>
              )}
            </button>
            <input id="gallery-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Titre (optionnel)</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex. : Rénovation salon moderne"
                className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Description (optionnel)</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez brièvement ce travail..."
                className="rounded-xl bg-slate-50 border-slate-200 text-sm resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={uploading} className="flex-1 h-11 rounded-xl border-slate-200 font-bold">
                Annuler
              </Button>
              <Button onClick={() => void handleAdd()} disabled={!file || uploading} className="flex-1 h-11 rounded-xl font-bold shadow-sm">
                {uploading ? "Upload en cours..." : "Envoyer"}
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Chaque réalisation est vérifiée par notre équipe avant d&apos;apparaître sur votre profil.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black">Supprimer cette réalisation ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">L&apos;image sera définitivement supprimée du stockage et de votre profil.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 h-11 rounded-xl border-slate-200 font-bold">
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && void handleDelete(deleteTarget)}
              className="flex-1 h-11 rounded-xl font-bold"
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
