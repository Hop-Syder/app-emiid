import type { Config } from "tailwindcss";

// ── Charte EmiID ──────────────────────────────────────────────────────────────
// Échelles dérivées des hex officiels : bleu roi #013ff4 (primaire), cyan #03b3f8
// (secondaire), bleu nuit #000616. On REDÉFINIT les familles Tailwind utilisées en
// dur par le site (indigo/blue = primaire, purple/violet/fuchsia/cyan = secondaire)
// pour basculer tout le commercial sur la charte sans réécrire les composants.
const brandBlue = {
  50: "#e8efff",
  100: "#d1dfff",
  200: "#a3bfff",
  300: "#6f97ff",
  400: "#3a6bff",
  500: "#0d4bf9",
  600: "#013ff4",
  700: "#0132c2",
  800: "#012a9e",
  900: "#04246e",
  950: "#000616",
};

const brandCyan = {
  50: "#e6f8ff",
  100: "#c7f0ff",
  200: "#90e2fd",
  300: "#54d1fb",
  400: "#22c1f9",
  500: "#03b3f8",
  600: "#0090d4",
  700: "#0271a8",
  800: "#075d88",
  900: "#0c4d70",
  950: "#05314b",
};

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        // Primaire charte (bleu roi) — remplace l'indigo/blue hérités
        blue: brandBlue,
        indigo: brandBlue,
        // Secondaire charte (cyan) — remplace purple/violet/fuchsia/cyan hérités
        cyan: brandCyan,
        purple: brandCyan,
        violet: brandCyan,
        fuchsia: brandCyan,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
