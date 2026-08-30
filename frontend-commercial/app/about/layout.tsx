import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos d'Emiid — Le réseau professionnel pensé pour l'Afrique",
  description:
    "La mission d'Emiid : donner à chaque professionnel africain une identité numérique certifiée, visible et crédible. Découvrez notre vision, nos valeurs et nos engagements.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "À propos d'Emiid — Notre Vision & Mission",
    description:
      "La mission d'Emiid : donner à chaque professionnel africain une identité numérique certifiée et visible.",
    url: "https://emiid.com/about",
    siteName: "Emiid",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/logo-emiid-bleu-blanc.png",
        width: 500,
        height: 500,
        alt: "À propos d'Emiid",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "À propos d'Emiid — Notre Vision & Mission",
    description:
      "Découvrez l'équipe et la mission d'Emiid pour transformer le networking en Afrique.",
    creator: "@hopsyder",
    images: ["/logo-emiid-bleu-blanc.png"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "À propos d'Emiid",
            url: "https://emiid.com/about",
            description:
              "La mission d'Emiid : donner à chaque professionnel africain une identité numérique certifiée, visible et crédible.",
            mainEntity: {
              "@type": "Organization",
              name: "Emiid",
              url: "https://emiid.com",
              logo: "https://emiid.com/logo-emiid-bleu-blanc.png",
            },
          }).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
