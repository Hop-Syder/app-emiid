import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Nukun Admin",
  description: "Cockpit d'administration Nukun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans bg-slate-50 text-slate-900">
        {children}
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  );
}
