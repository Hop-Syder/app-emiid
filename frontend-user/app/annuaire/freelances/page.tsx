import { NexusLayout } from "@/components/nexus-layout"
import { ProfilesGrid } from "@/components/profiles-grid"

export default function FreelancesPage() {
  const freelancesData = [
    {
      name: "Kofi Mensah",
      role: "Designer Graphique",
      location: "Accra, Ghana",
      avatar: "/african-man-designer.jpg",
      specialty: "Identité visuelle",
      verified: true,
      followers: 489,
      projects: 28,
    },
    {
      name: "Youssef El Mansouri",
      role: "Développeur Web",
      location: "Casablanca, Maroc",
      avatar: "/african-man-developer.jpg",
      specialty: "React & Node.js",
      verified: true,
      followers: 892,
      projects: 67,
    },
    {
      name: "Aisha Kamara",
      role: "Rédactrice",
      location: "Freetown, Sierra Leone",
      avatar: "/african-woman-writer.jpg",
      specialty: "Content Marketing",
      verified: true,
      followers: 423,
      projects: 56,
    },
    {
      name: "Omar Ba",
      role: "Photographe",
      location: "Dakar, Sénégal",
      avatar: "/african-man-photographer.jpg",
      specialty: "Photographie commerciale",
      verified: false,
      followers: 756,
      projects: 89,
    },
  ]

  return (
    <NexusLayout>
      <ProfilesGrid profiles={freelancesData} category="freelances" />
    </NexusLayout>
  )
}
