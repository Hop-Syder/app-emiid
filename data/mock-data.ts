/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Données factices centralisées pour le template Nexus Connect
 * @created 2025-12-26
*/

export interface Entrepreneur {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  specialty: string;
  verified: boolean;
  premium: boolean;
  followers: number;
}

export interface Project {
  id: string;
  title: string;
  author: string;
  location: string;
  category: 'Financement' | 'Partenaires' | 'À vendre';
  targetAmount?: number;
  currentAmount?: number;
  progress?: number;
  daysRemaining?: number;
  contributors?: number;
  description?: string;
  stats?: {
    label: string;
    value: string;
  };
  responses?: number;
  interestedCount?: number;
  shares?: string;
}

export const entrepreneurs: Entrepreneur[] = [
  {
    id: "1",
    name: "Awa Diallo",
    role: "Artisan Textile",
    location: "Dakar, Sénégal",
    avatar: "/african-woman-entrepreneur.jpg",
    specialty: "Tissage traditionnel",
    verified: true,
    premium: true,
    followers: 234,
  },
  {
    id: "2",
    name: "Kofi Mensah",
    role: "Designer Graphique",
    location: "Accra, Ghana",
    avatar: "/african-man-designer.jpg",
    specialty: "Identité visuelle",
    verified: true,
    premium: true,
    followers: 489,
  },
  {
    id: "3",
    name: "Aminata Touré",
    role: "Fondatrice Startup",
    location: "Abidjan, Côte d'Ivoire",
    avatar: "/african-woman-ceo.jpg",
    specialty: "Fintech",
    verified: true,
    premium: false,
    followers: 1203,
  },
  {
    id: "4",
    name: "Ibrahim Keita",
    role: "Menuisier",
    location: "Bamako, Mali",
    avatar: "/african-carpenter.jpg",
    specialty: "Mobilier sur mesure",
    verified: false,
    premium: false,
    followers: 156,
  },
  {
    id: "5",
    name: "Fatou Ndiaye",
    role: "Photographe",
    location: "Lomé, Togo",
    avatar: "/african-photographer.jpg",
    specialty: "Portrait & Événementiel",
    verified: true,
    premium: true,
    followers: 892,
  },
  {
    id: "6",
    name: "Youssef Traoré",
    role: "Développeur Web",
    location: "Ouagadougou, Burkina Faso",
    avatar: "/african-developer.jpg",
    specialty: "Applications Web",
    verified: true,
    premium: false,
    followers: 567,
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    title: "Expansion Atelier Textile",
    author: "Awa Diallo",
    location: "Dakar, Sénégal",
    category: "Financement",
    targetAmount: 25000,
    currentAmount: 15000,
    progress: 60,
    daysRemaining: 30,
    contributors: 45,
  },
  {
    id: "p2",
    title: "Distribution Artisanat",
    author: "Kofi Mensah",
    location: "Accra, Ghana",
    category: "Partenaires",
    description: "Recherche distributeur pour l'Europe",
    stats: { label: "Partenariat commercial", value: "Building2" },
    responses: 12,
  },
  {
    id: "p3",
    title: "Startup Fintech",
    author: "Aminata Touré",
    location: "Abidjan",
    category: "À vendre",
    targetAmount: 50000,
    shares: "20% parts",
    description: "Croissance 150% annuelle",
    interestedCount: 8,
  },
];
