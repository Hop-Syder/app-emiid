/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Wrapper principal pour le contenu de création de profil avec hydratation robuste et support des tags et secteurs.
 * @created 2026-01-16
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Preloader } from "@/components/Preloader"
import { CreerProfilForm } from "./creer-profil-form"
import { CreerProfilPreview } from "./creer-profil-preview"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Eye, X } from "lucide-react"
import { useCreerProfil } from "@/hooks/use-creer-profil"

export function CreerProfilContent() {
    const {
        formData,
        setFormData,
        loadingStatus,
        isPublished,
        countries,
        validationErrors,
        saving,
        publishing,
        unpublishing,
        handleInputChange,
        handleSave,
        handlePublish,
        handleUnpublish,
        loadInitialData,
    } = useCreerProfil()

    if (loadingStatus === 'loading') {
        return <Preloader text="Initialisation du profil" />
    }

    if (loadingStatus === 'error') {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
                <div className="bg-white/60 backdrop-blur-xl border border-red-100 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
                    <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                        <X className="h-8 w-8 text-rose-600 stroke-[2.5]" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Impossible de charger le profil</h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                        Une erreur est survenue lors de la récupération de vos données de profil. Veuillez vérifier votre connexion ou réessayer ultérieurement.
                    </p>
                    <button
                        onClick={loadInitialData}
                        className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg active:scale-95 duration-200"
                    >
                        Réessayer le chargement
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2 md:px-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-primary to-slate-800">Configurez votre Identité</h1>
                        <p className="text-sm md:text-base text-muted-foreground font-medium">Votre carte est votre premier contact avec le réseau.</p>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isPublished ? "pub" : "draft"}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Badge 
                                variant={isPublished ? "default" : "secondary"} 
                                className={`rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-lg ${
                                    isPublished ? "bg-gradient-to-r from-emerald-600 to-teal-500 border-none" : ""
                                }`}
                            >
                                {isPublished ? "Mode Public" : "Mode Brouillon"}
                            </Badge>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                    <CreerProfilForm
                        formData={formData}
                        setFormData={setFormData}
                        handleInputChange={handleInputChange}
                        handleSave={handleSave}
                        handlePublish={handlePublish}
                        handleUnpublish={handleUnpublish}
                        isPublished={isPublished}
                        countries={countries}
                        tags={formData.tags}
                        validationErrors={validationErrors}
                        saving={saving}
                        publishing={publishing}
                        unpublishing={unpublishing}
                    />
                    
                    {/* Desktop Preview */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-24 pt-4">
                            <CreerProfilPreview formData={formData} />
                        </div>
                    </div>
                </div>

                {/* Mobile Floating Action Button for Preview */}
                <div className="lg:hidden fixed bottom-[160px] right-4 z-[60]">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="bg-primary text-primary-foreground p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform" aria-label="Voir l'aperçu">
                                <Eye className="w-6 h-6" />
                            </button>
                        </DialogTrigger>
                        <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-sm mx-auto h-[80vh] flex flex-col justify-center">
                            <DialogTitle className="sr-only">Aperçu de la carte</DialogTitle>
                            <DialogDescription className="sr-only">Aperçu en direct de votre carte EmiID.</DialogDescription>
                            <div className="relative overflow-y-auto w-full no-scrollbar rounded-3xl">
                                <CreerProfilPreview formData={formData} />
                                <DialogClose className="absolute top-4 right-4 z-[70] bg-white text-rose-600 hover:text-rose-700 hover:scale-105 active:scale-95 transition-all p-2.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center justify-center focus:outline-none">
                                    <X className="w-5 h-5 stroke-[3]" />
                                    <span className="sr-only">Fermer l&apos;aperçu</span>
                                </DialogClose>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>
        </div>
    )
}
