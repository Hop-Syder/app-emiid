import { NexusLayout } from "@/components/nexus-layout"
import { ProfilesGrid } from "@/components/profiles-grid"

export default function ArtisansPage() {
  const artisansData = [
    {
      name: "Awa Diallo",
      role: "Artisan Textile",
      location: "Dakar, Sénégal",
      avatar: "/african-woman-entrepreneur.jpg",
      specialty: "Tissage traditionnel",
      verified: true,
      followers: 234,
      projects: 12,
    },
    {
      name: "Ibrahim Keita",
      role: "Menuisier",
      location: "Bamako, Mali",
      avatar: "/african-carpenter.jpg",
      specialty: "Mobilier sur mesure",
      verified: false,
      followers: 156,
      projects: 45,
    },
    {
      name: "Fatou Sow",
      role: "Couturière",
      location: "Lomé, Togo",
      avatar: "/african-woman-tailor.jpg",
      specialty: "Mode africaine contemporaine",
      verified: true,
      followers: 567,
      projects: 23,
    },
    {
      name: "Mamadou Diop",
      role: "Potier",
      location: "Ouagadougou, Burkina Faso",
      avatar: "/african-man-potter.jpg",
      specialty: "Céramique traditionnelle",
      verified: true,
      followers: 189,
      projects: 34,
    },
  ]

  return (
    <NexusLayout>
      <ProfilesGrid profiles={artisansData} category="artisans" />
    </NexusLayout>
  )
}
