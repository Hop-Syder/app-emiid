/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Splash screen d'onboarding EmiID avec animations et gestion de l'état d'affichage unique
 * @created 2026-05-20
 * @updated 2026-05-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/
// ──────────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { introSlides } from "@/lib/introSlides";
import { useIntroGuard } from "@/lib/useIntroGuard";

export default function IntroScreen() {
  const router = useRouter();
  const { shouldShow, markIntroSeen } = useIntroGuard();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"in" | "out">("in");

  const currentSlide = introSlides[currentIndex];
  const isLastSlide = currentIndex === introSlides.length - 1;

  // Anime la transition entre slides
  const goTo = useCallback(
    (nextIndex: number) => {
      if (animating) return;
      setAnimating(true);
      setDirection("out");

      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setDirection("in");
        setAnimating(false);
      }, 300);
    },
    [animating]
  );

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      markIntroSeen();
      router.push("/dashboard-public");
    } else {
      goTo(currentIndex + 1);
    }
  }, [isLastSlide, currentIndex, goTo, markIntroSeen, router]);

  const handleSkip = useCallback(() => {
    markIntroSeen();
    router.push("/dashboard-public");
  }, [markIntroSeen, router]);

  // Support navigation clavier (→ pour avancer, Echap pour passer)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handleSkip]);

  // Pendant la vérification localStorage → rendu vide pour éviter le flash
  if (shouldShow === null) return null;

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-between bg-[#0A0A0F] px-6 py-8 overflow-hidden"
      role="main"
      aria-label={`Introduction EmiID — étape ${currentIndex + 1} sur ${introSlides.length}`}
    >
      {/* ─── Fond décoratif ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Halo doré subtil */}
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        {/* Halo bas */}
        <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#1a6b4a]/15 blur-3xl" />
      </div>

      {/* ─── Header : Logo + Skip ─── */}
      <header className="relative z-10 flex w-full max-w-md items-center justify-between">
        {/* Logo EmiID */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo/logo-1.png"
            alt="EmiID"
            width={100}
            height={32}
            priority
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Bouton Skip — accessible et visible */}
        <button
          onClick={handleSkip}
          className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-white/50 transition-all duration-200 hover:border-white/30 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
          aria-label="Passer l'introduction et accéder à la plateforme"
        >
          Passer
        </button>
      </header>

      {/* ─── Contenu de la slide ─── */}
      <section
        className={`relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center text-center transition-all duration-300 ${
          animating && direction === "out"
            ? "translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Illustration */}
        <div
          aria-hidden="true"
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 overflow-hidden ring-1 ring-white/10 relative"
        >
          {currentSlide.illustration.startsWith("/") ? (
            <Image
              src={currentSlide.illustration}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
              priority
            />
          ) : (
            <span className="text-5xl">{currentSlide.illustration}</span>
          )}
        </div>

        {/* Eyebrow */}
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[#D4AF37]">
          {currentSlide.eyebrow}
        </p>

        {/* Headline — typo grande, tutoiement */}
        <h1 className="mb-4 whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          {currentSlide.headline}
        </h1>

        {/* Corps */}
        <p className="max-w-sm text-base leading-relaxed text-white/60">
          {currentSlide.body}
        </p>
      </section>

      {/* ─── Footer : Dots + CTA ─── */}
      <footer className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        {/* Dots de progression */}
        <div
          className="flex items-center gap-2"
          role="tablist"
          aria-label="Progression de l'introduction"
        >
          {introSlides.map((slide, i) => (
            <button
              key={slide.id}
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Étape ${i + 1}`}
              onClick={() => i < currentIndex && goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 ${
                i === currentIndex
                  ? "w-8 bg-[#D4AF37]"
                  : i < currentIndex
                  ? "w-1.5 cursor-pointer bg-white/40 hover:bg-white/60"
                  : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* CTA principal — orienté bénéfice */}
        <button
          onClick={handleNext}
          className="w-full rounded-2xl bg-[#D4AF37] px-8 py-4 text-base font-semibold text-[#0A0A0F] transition-all duration-200 hover:bg-[#e6c84a] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
          aria-label={
            isLastSlide
              ? "Créer mon profil gratuit et accéder à EmiID"
              : "Passer à l'étape suivante"
          }
        >
          {currentSlide.ctaLabel}
        </button>

        {/* Compteur discret */}
        <p className="text-xs text-white/30" aria-hidden="true">
          {currentIndex + 1} / {introSlides.length}
        </p>
      </footer>
    </main>
  );
}
