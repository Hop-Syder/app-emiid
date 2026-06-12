/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page d'annuaire (Explore) connectée à Supabase pour afficher les vrais profils
 * @created 2026-06-12
 * @updated 2026-06-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import Link from "next/link";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

export const metadata: Metadata = {
  title: "Annuaire des Professionnels | Emiid",
  description: "Découvrez les professionnels, fondateurs et talents tech sur Emiid.",
};

export default async function ExplorePage() {
  const supabase = await createClient();
  
  // Fetch real profiles from public_profiles view
  const { data: profiles, error } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <main className="min-h-screen bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 lg:px-16">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            L'Annuaire Certifié
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Découvrez des talents tech, des fondateurs audacieux et des artisans qualifiés. L'écosystème professionnel de confiance en Afrique.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-8">
            Erreur lors du chargement des profils. Veuillez réessayer plus tard.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {profiles?.map((profile) => (
            <div key={profile.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.first_name || ""} className="w-full h-full object-cover" />
                  ) : (
                    (profile.first_name?.[0] || "") + (profile.last_name?.[0] || "")
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  {profile.is_verified && (
                    <span className="inline-flex items-center text-xs font-semibold text-green-600">
                      ✓ Vérifié
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-indigo-600 truncate">{profile.role} {profile.company && `@ ${profile.company}`}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{profile.industry || profile.activity_domain || "Professionnel"}</p>
              </div>

              <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                {profile.bio || "Aucune biographie renseignée."}
              </p>

              <a 
                href={`${USER_APP_URL}/profil/${profile.slug || profile.id}`}
                className="w-full text-center py-2.5 px-4 rounded-xl font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                Voir le profil
              </a>
            </div>
          ))}
          
          {(!profiles || profiles.length === 0) && !error && (
            <div className="col-span-full text-center py-12 text-gray-500">
              Aucun profil publié pour le moment. Soyez le premier !
            </div>
          )}
        </div>

        <div className="mt-24 bg-indigo-900 rounded-3xl p-8 sm:p-12 text-center overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Prêt à créer la vôtre ?</h2>
            <p className="text-indigo-200 mb-8 max-w-xl mx-auto">Rejoignez des milliers de professionnels qui utilisent Emiid pour centraliser leur présence en ligne.</p>
            <a href={`${USER_APP_URL}/creer-profil`} className="inline-block bg-white dark:bg-gray-900 text-indigo-900 font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
              Créer mon profil gratuitement
            </a>
          </div>
          {/* Décoration de fond */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        </div>
      </div>
    </main>
  );
}
