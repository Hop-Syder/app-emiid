/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Aperçu dynamique du profil en cours de création
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { NexusProfileCard, NexusCardVariant } from "@/components/carte-profil/nexus-profile-card"

interface CreerProfilPreviewProps {
    formData: any
}

export function CreerProfilPreview({ formData }: CreerProfilPreviewProps) {
    const previewUser = {
        id: "preview",
        name: formData.name || "Votre Nom",
        role: formData.role || "Votre Rôle",
        avatar: formData.avatar_url || formData.avatar || "/profil/avatar.jpg",
        category: formData.category || "Catégorie",
        specialty: formData.specialty || "Spécialité",
        location: formData.city ? `${formData.city}, ${formData.country_name || ""}` : (formData.country_name || "Zone"),
        followers: 0,
        verified: false,
        premium: formData.premium || false,
        tags: formData.tags || []
    }

    return (
        <div className="h-fit sticky top-24 space-y-4">
            <div className="px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center">Aperçu en temps réel</p>
            </div>

            <NexusProfileCard
                user={previewUser}
                variant={(formData.card_variant as NexusCardVariant) || "tech"}
            />

            <p className="text-[10px] text-center text-slate-400 font-medium px-8 italic">
                Ceci est un aperçu de votre carte telle qu'elle apparaîtra dans l'annuaire Nexus Connect.
            </p>
        </div>
    )
}
