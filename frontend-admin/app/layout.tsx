import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "EmiID Admin",
  description: "Cockpit d'administration EmiID",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans bg-[#f8fafc] text-slate-900">
        {children}
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  );
}
