/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page d'accueil racine de l'application — Tableau de bord public (SSR/ISR 60s)
 *              Les profils et les stats sont chargés côté serveur (SSR/ISR) pour
 *              garantir un premier rendu sans Layout Shift (CLS 0) et une indexation
 *              SEO complète par les crawlers (contenu visible dans le HTML brut).
 * @created 2026-05-20
 * @updated 2026-06-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
// ──────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { NavigationShell } from "@/components/navigation/navigation-shell";
import { createClient } from "@/lib/supabase/server";
import { DashboardPublicContent } from "@/components/dashboard-public-content/dashboard-public-content";
import type { EntrepreneurProfile } from "@/components/dashboard-public-content/dashboard-public-content";
import type { DashboardStats } from "@/types";
import { PublicProfileJoined, countryName, tagNames } from "@/types/supabase-rows";

// Régénération statique incrémentielle toutes les 60 secondes
export const revalidate = 60;

// ─── SEO & Open Graph ────────────────────────────────────────────────────────
// og:url et métadonnées pour la page d'accueil racine
export const metadata: Metadata = {
  title: "EmiID — Votre empreinte numérique professionnelle",
  description:
    "Crée ta carte de visite numérique et rejoins le réseau de professionnels qui construisent l'Afrique de demain.",
  keywords: ["networking", "professionnel", "Afrique", "carte de visite", "EmiID"],
  authors: [{ name: "Nexus Partners", url: "https://app.emiid.com" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://app.emiid.com",
    siteName: "EmiID",
    title: "EmiID — Votre empreinte numérique professionnelle",
    description:
      "Crée ta carte de visite numérique et rejoins le réseau de professionnels qui construisent l'Afrique de demain.",
    images: [
      {
        url: "https://app.emiid.com/logo/og-image.png",
        width: 1200,
        height: 630,
        alt: "EmiID — Votre empreinte numérique professionnelle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@hopsyder",
    title: "EmiID — Votre empreinte numérique professionnelle",
    description:
      "Crée ta carte de visite numérique et rejoins le réseau de professionnels qui construisent l'Afrique de demain.",
  },
  // La page d'accueil publique est maintenant indexable car c'est le point d'entrée principal
  robots: {
    index: true,
    follow: true,
  },
};

async function fetchInitialStats(): Promise<DashboardStats | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    const res = await fetch(`${apiUrl}/api/public/stats`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchInitialProfiles(): Promise<EntrepreneurProfile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("public_profiles")
      .select("*, countries(name, iso_code), profile_tags(tags(name))")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data) return [];

    return (data as unknown as PublicProfileJoined[]).map((e) => {
      const profileId = e.user_id || e.id || "0";
      const country = countryName(e.countries);
      return {
        id: profileId,
        slug: e.slug || undefined,
        name: (e.first_name || e.last_name)
          ? `${e.first_name || ""} ${e.last_name || ""}`.trim()
          : "Utilisateur EmiID",
        role: e.role || "Membre EmiID",
        location: e.city
          ? `${e.city}, ${country}`
          : country || "Afrique",
        avatar: e.avatar_url || "/profil/avatar.jpg",
        specialty: e.specialty || "Expertise",
        category: e.category || "",
        verified: !!e.is_verified,
        premium: !!e.is_premium,
        followers: e.followers_count || 0,
        isFollowed: false,
        tags: tagNames(e.profile_tags),
      };
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  // Chargement parallèle — stats & profils résolus avant le premier octet envoyé au client
  const [initialStats, initialProfiles] = await Promise.all([
    fetchInitialStats(),
    fetchInitialProfiles(),
  ]);

  return (
    <NavigationShell isPublic={true}>
      <div className="flex-1 w-full min-h-screen flex flex-col">
        <DashboardPublicContent
          initialStats={initialStats}
          initialProfiles={initialProfiles}
        />
      </div>
    </NavigationShell>
  );
}
