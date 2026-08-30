/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout racine de l'application commerciale intégrant le Header et le Footer globaux
 * @created 2026-06-12
 * @updated 2026-06-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Inter } from "next/font/google";

// Corps : Inter (substitut libre de « Google Sans » — charte EmiID)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Charte EmiID : fonds officiels (blanc en clair, slate-950 en sombre).
// La couleur de marque #013ff4 reste l'accent/symbole, pas le fond du chrome mobile.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://emiid.com"),
  applicationName: "Emiid",
  title: {
    default: "Emiid — Le réseau professionnel pensé pour l'Afrique",
    template: "%s | Emiid",
  },
  description:
    "Emiid est la première plateforme d'identité professionnelle certifiée en Afrique. Créez votre profil vérifié, boostez votre visibilité et connectez-vous avec des milliers d'entreprises et talents.",
  keywords: [
    "Emiid",
    "réseau professionnel Afrique",
    "carte de visite numérique",
    "annuaire certifié",
    "profil vérifié",
    "B2B Afrique",
    "freelance Afrique",
    "artisans certifiés",
    "entreprise",
    "Bénin",
    "Côte d'Ivoire",
    "Sénégal",
    "Togo",
    "Afrique de l'Ouest",
    "FCFA"
  ],
  authors: [{ name: "Nexus Partners", url: "https://emiid.com" }],
  creator: "Nexus Partners",
  publisher: "Nexus Partners",
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, title: "Emiid", statusBarStyle: "default" },
  other: { "msapplication-TileColor": "#013ff4" },
  openGraph: {
    title: "Emiid — Le réseau professionnel pensé pour l'Afrique",
    description:
      "Rejoignez l'annuaire de référence des professionnels et entreprises en Afrique. Profil certifié, messagerie et opportunités.",
    url: "https://emiid.com",
    siteName: "Emiid",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/logo-emiid-bleu-blanc.png",
        width: 500,
        height: 500,
        alt: "Emiid — Le réseau professionnel pensé pour l'Afrique",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emiid — Le réseau professionnel pensé pour l'Afrique",
    description:
      "L'annuaire certifié pour les acteurs et talents de l'écosystème africain.",
    creator: "@hopsyder",
    images: ["/logo-emiid-bleu-blanc.png"],
  },
  icons: {
    icon: [
      {
        url: "/logo-emiid-bleu-blanc.png",
        type: "image/png",
      },
      {
        url: "/logo/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/logo/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/logo-emiid-bleu-blanc.png",
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {/* Google Analytics 4 — via next/script (hors <head> manuel, laisse la
            Metadata API gérer le <head> SEO). */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KYGF0JWYZE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KYGF0JWYZE');
          `}
        </Script>

        {/* Données structurées — Organization + WebSite + SoftwareApplication (valides en body pour Google) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://emiid.com/#organization",
                  name: "Emiid",
                  url: "https://emiid.com",
                  logo: "https://emiid.com/logo-emiid-bleu-blanc.png",
                  image: "https://emiid.com/logo-emiid-bleu-blanc.png",
                  description:
                    "Le réseau professionnel certifié pensé pour l'Afrique : profils vérifiés, annuaire et messagerie.",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Cotonou",
                    addressCountry: "BJ",
                  },
                  sameAs: [
                    "https://app.emiid.com",
                    "https://x.com/hopsyder",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://emiid.com/#website",
                  name: "Emiid",
                  url: "https://emiid.com",
                  publisher: {
                    "@id": "https://emiid.com/#organization",
                  },
                },
                {
                  "@type": "SoftwareApplication",
                  name: "Emiid",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Web, Mobile (PWA)",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "XOF",
                  },
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
