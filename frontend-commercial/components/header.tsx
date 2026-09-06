/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant de navigation (Header) avec design premium glassmorphic, Bleu Nuit #000616 et nouveau logo
 * @created 2026-06-12
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ArrowRight, Home, Compass, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Explorer", href: "/explore", icon: Compass },
  { name: "À propos", href: "/about", icon: Info },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
];

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

function DockItem({ href, icon, label, onClick, active }: { href: string; icon: React.ReactNode; label: string; onClick: () => void; active: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200",
        active
          ? "bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-bold"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      {icon}
      <span className="text-[8px] sm:text-[9px] font-bold mt-0.5 tracking-wider">{label}</span>
    </Link>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Ferme le menu lors d'un changement de page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
          scrolled
            ? "bg-white/80 dark:bg-[#000616]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 shadow-sm py-3.5"
            : "bg-transparent py-5"
        )}
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
          <nav className="flex items-center justify-between" aria-label="Navigation principale">
            {/* Logo */}
            <div className="flex lg:flex-1">
              <Link href="/" className="flex items-center gap-2.5 group">
                <Image
                  src="/logo/icon.svg"
                  alt="Logo EmiID"
                  width={44}
                  height={44}
                  className="h-10 w-auto object-contain group-hover:scale-105 transition-all duration-300 shrink-0"
                  priority
                />
                <span className="font-wordmark font-black text-2xl tracking-tight text-brand-gradient">
                  EmiID
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:gap-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-sm font-semibold leading-6 transition-all relative py-1 px-2.5 rounded-lg hover:text-blue-600 dark:hover:text-cyan-400",
                      isActive
                        ? "text-blue-600 dark:text-cyan-400"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-400"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right actions (CTAs) - Desktop only */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
              <ThemeToggle />
              <Link
                href={`${USER_APP_URL}/login`}
                className="text-sm font-semibold leading-6 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/5"
              >
                <User className="h-4 w-4" />
                Connexion
              </Link>
              <Link
                href={`${USER_APP_URL}/creer-profil`}
                className="inline-flex items-center justify-center px-4.5 py-2.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 gap-1.5 group active:scale-[0.98]"
              >
                Créer mon profil
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Theme Toggle on Mobile top right */}
            <div className="flex lg:hidden lg:flex-1 justify-end items-center">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Floating Dock (Bottom) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] lg:hidden flex flex-col items-center">
        <motion.div
          layout
          initial={{ borderRadius: 9999 }}
          animate={{
            borderRadius: mobileMenuOpen ? 24 : 9999,
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          className={cn(
            "bg-white/95 dark:bg-[#000616]/95 backdrop-blur-2xl border border-gray-200/80 dark:border-white/15 shadow-[0_10px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex items-center overflow-hidden",
            mobileMenuOpen ? "p-1.5" : "p-0"
          )}
        >
          <AnimatePresence mode="popLayout">
            {!mobileMenuOpen ? (
              <motion.button
                key="hamburger-btn"
                layoutId="dock-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(true)}
                className="w-13 h-13 p-3.5 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-full shadow-lg shadow-blue-500/30 relative overflow-hidden group"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5 relative z-10" />
              </motion.button>
            ) : (
              <motion.div
                key="dock-menu"
                layoutId="dock-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1"
              >
                {navigation.map((item) => (
                  <DockItem
                    key={item.name}
                    href={item.href}
                    icon={<item.icon className="w-4 h-4" />}
                    label={item.name}
                    onClick={() => setMobileMenuOpen(false)}
                    active={pathname === item.href}
                  />
                ))}

                <div className="w-[1px] h-7 bg-gray-200 dark:bg-white/10 mx-0.5" />

                <DockItem
                  href={`${USER_APP_URL}/login`}
                  icon={<User className="w-4 h-4" />}
                  label="Login"
                  onClick={() => setMobileMenuOpen(false)}
                  active={false}
                />

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
