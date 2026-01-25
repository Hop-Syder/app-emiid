"use client"

import { NexusLayout } from "@/components/menu/nexus-layout"
import { AnnuaireContent } from "@/components/annuaire-content/annuaire-content"
import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { Loader2 } from "lucide-react"

export default function EntreprisesPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const response = await fetchWithAuth("/api/users?category=Entreprise")
        if (response.ok) {
          const data = await response.json()
          setProfiles(data.map((u: any) => ({
            id: u.user_id || u.id,
            name: `${u.first_name} ${u.last_name}`,
            role: u.role || "Chef d'entreprise",
            location: u.location || "N/A",
            avatar: u.avatar_url || "/african-user.jpg",
            specialty: u.specialty || "Business",
            verified: true,
            followers: 0,
            projects: 0,
            premium: false
          })))
        }
      } catch (error) {
        console.error("Erreur chargement entreprises:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProfiles()
  }, [])

  return (
    <NexusLayout>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Recherche des entreprises...</p>
        </div>
      ) : (
        <AnnuaireContent profiles={profiles} category="entreprises" />
      )}
    </NexusLayout>
  )
}
