import { NexusLayout } from "@/components/nexus-layout"
import { ProfilesGrid } from "@/components/profiles-grid"

export default function EntreprisesPage() {
  const entreprisesData = [
    {
      name: "Aminata Touré",
      role: "Fondatrice Startup",
      location: "Abidjan, Côte d'Ivoire",
      avatar: "/african-woman-ceo.jpg",
      specialty: "Fintech",
      verified: true,
      followers: 1203,
      projects: 8,
    },
    {
      name: "Tech Solutions Africa",
      role: "Agence Digitale",
      location: "Lagos, Nigeria",
      avatar: "/african-tech-company-logo.jpg",
      specialty: "Transformation digitale",
      verified: true,
      followers: 2456,
      projects: 145,
    },
    {
      name: "Green Energy Co.",
      role: "Énergies Renouvelables",
      location: "Accra, Ghana",
      avatar: "/green-energy-company-logo.jpg",
      specialty: "Solutions solaires",
      verified: true,
      followers: 1834,
      projects: 67,
    },
    {
      name: "AfriMarket",
      role: "E-commerce",
      location: "Nairobi, Kenya",
      avatar: "/ecommerce-logo.png",
      specialty: "Marketplace panafricaine",
      verified: true,
      followers: 3421,
      projects: 234,
    },
  ]

  return (
    <NexusLayout>
      <ProfilesGrid profiles={entreprisesData} category="entreprises" />
    </NexusLayout>
  )
}
