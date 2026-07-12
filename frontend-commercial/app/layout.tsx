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
  title: "Emiid - Votre empreinte numérique professionnelle",
  description: "L'annuaire de référence pour les acteurs de l'écosystème africain.",
  keywords: ["Emiid", "réseau professionnel", "Afrique", "annuaire", "profil professionnel", "freelance", "entreprise", "FCFA"],
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, title: "Emiid", statusBarStyle: "default" },
  other: { "msapplication-TileColor": "#013ff4" },
  openGraph: {
    title: "Emiid - L'annuaire de l'écosystème africain",
    description: "Rejoignez l'annuaire Emiid pour augmenter votre visibilité et développer votre réseau.",
    url: "https://emiid.com",
    siteName: "Emiid",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/logo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Emiid - Votre empreinte numérique professionnelle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emiid - Votre empreinte numérique",
    description: "L'annuaire de référence pour les acteurs de l'écosystème africain.",
    images: ["/logo/og-image.png"],
  },
  icons: {
    icon: [
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
    apple: "/logo/apple-icon.png",
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

        {/* Données structurées — Organization + WebSite (valides en body pour Google) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Emiid",
              url: "https://emiid.com",
              logo: "https://emiid.com/logo/logo-emiid-light.png",
              description:
                "Le réseau professionnel certifié pensé pour l'Afrique : profils vérifiés, annuaire et messagerie.",
            }).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Emiid",
              url: "https://emiid.com",
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
