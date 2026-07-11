import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos d'Emiid — Le réseau professionnel pensé pour l'Afrique",
  description:
    "La mission d'Emiid : donner à chaque professionnel africain une identité numérique certifiée, visible et crédible. Découvrez notre vision, notre histoire et l'équipe.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "À propos d'Emiid",
    description:
      "La mission d'Emiid : donner à chaque professionnel africain une identité numérique certifiée et visible.",
    url: "https://emiid.com/about",
    siteName: "Emiid",
    locale: "fr_FR",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
