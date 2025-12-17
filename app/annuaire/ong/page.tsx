import { NexusLayout } from "@/components/nexus-layout"
import { ProfilesGrid } from "@/components/profiles-grid"

export default function ONGPage() {
  const ongData = [
    {
      name: "Education For All",
      role: "ONG Éducation",
      location: "Bamako, Mali",
      avatar: "/education-ngo-logo.jpg",
      specialty: "Accès à l'éducation",
      verified: true,
      followers: 5678,
      projects: 45,
    },
    {
      name: "Water Wells Initiative",
      role: "ONG Environnement",
      location: "Niamey, Niger",
      avatar: "/water-ngo-logo.jpg",
      specialty: "Accès à l'eau potable",
      verified: true,
      followers: 4321,
      projects: 78,
    },
    {
      name: "Women Entrepreneurs Network",
      role: "ONG Entrepreneuriat",
      location: "Dakar, Sénégal",
      avatar: "/women-empowerment-ngo-logo.jpg",
      specialty: "Entrepreneuriat féminin",
      verified: true,
      followers: 8934,
      projects: 123,
    },
    {
      name: "Health Access Africa",
      role: "ONG Santé",
      location: "Abidjan, Côte d'Ivoire",
      avatar: "/health-ngo-logo.jpg",
      specialty: "Soins médicaux",
      verified: true,
      followers: 6789,
      projects: 89,
    },
  ]

  return (
    <NexusLayout>
      <ProfilesGrid profiles={ongData} category="ong" />
    </NexusLayout>
  )
}
