import { notFound } from "next/navigation";
import { Metadata } from "next";

// Mock data (to be replaced by Supabase queries)
const mockProfiles: Record<string, any> = {
  "jean-dupont": {
    name: "Jean Dupont",
    role: "Fondateur & CEO",
    company: "TechAfrica",
    bio: "Entrepreneur passionné par l'inclusion financière en Afrique.",
    tags: ["Fintech", "SaaS"],
  },
  "fatou-diop": {
    name: "Fatou Diop",
    role: "Investisseure",
    company: "Ventures Capital",
    bio: "Spécialiste de la phase Seed pour les startups HealthTech.",
    tags: ["Seed", "HealthTech"],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = mockProfiles[resolvedParams.slug];
  
  if (!profile) {
    return { title: "Profil non trouvé | Emiid" };
  }

  return {
    title: `${profile.name} - ${profile.role} chez ${profile.company} | Emiid`,
    description: profile.bio,
    openGraph: {
      title: `${profile.name} sur Emiid`,
      description: profile.bio,
      type: "profile",
    },
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const profile = mockProfiles[resolvedParams.slug];

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name}</h1>
          <p className="text-xl text-indigo-600 font-medium mb-6">{profile.role} @ {profile.company}</p>
          
          <div className="prose prose-indigo mb-8">
            <h2 className="text-lg font-semibold text-gray-900">À propos</h2>
            <p className="text-gray-600">{profile.bio}</p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Expertises</h2>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-12 flex gap-4">
            <a href={`mailto:contact@emiid.com?subject=Contact via Emiid - ${profile.name}`} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
              Contacter {profile.name.split(' ')[0]}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
