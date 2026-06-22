/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout racine de l'application commerciale intégrant le Header et le Footer globaux
 * @created 2026-06-12
 * @updated 2026-06-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://emiid.com"),
  title: "Emiid - Votre empreinte numérique professionnelle",
  description: "L'annuaire de référence pour les acteurs de l'écosystème africain.",
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
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} font-sans antialiased bg-background text-foreground`}>
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
