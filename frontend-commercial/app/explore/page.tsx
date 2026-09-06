/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Explorer (Annuaire interactif des profils et entreprises vérifiés)
 * @created 2026-09-06
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, CheckCircle2, Crown, Sparkles, ArrowRight, ExternalLink, Filter, ShieldCheck } from "lucide-react";
import Link from "next/link";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

interface ProfileItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  category: "tech" | "design" | "business" | "artisanat" | "founder";
  location: string;
  country: string;
  flag: string;
  bio: string;
  initials: string;
  gradient: string;
  isFounder?: boolean;
  isVerified?: boolean;
  skills: string[];
}

const profiles: ProfileItem[] = [
  {
    id: "p1",
    name: "Aminata Touré",
    slug: "aminata-toure",
    role: "Développeuse Fullstack & Mobile",
    category: "tech",
    location: "Abidjan",
    country: "Côte d'Ivoire",
    flag: "🇨🇮",
    bio: "Experte React Native, Next.js et architectures d'APIs financières en Afrique de l'Ouest.",
    initials: "AT",
    gradient: "from-blue-600 to-cyan-500",
    isVerified: true,
    skills: ["React Native", "Next.js", "TypeScript", "FedaPay"],
  },
  {
    id: "p2",
    name: "Koffi Mensah",
    slug: "koffi-mensah",
    role: "Directeur Associé · FinTech Hub",
    category: "founder",
    location: "Lomé",
    country: "Togo",
    flag: "🇹🇬",
    bio: "Pionnier des solutions de paiement transfrontalier et d'accélération de startups fintech francophones.",
    initials: "KM",
    gradient: "from-amber-500 to-orange-600",
    isFounder: true,
    isVerified: true,
    skills: ["FinTech", "Levée de fonds", "Mobile Money", "Stratégie"],
  },
  {
    id: "p3",
    name: "Sarah Benali",
    slug: "sarah-benali",
    role: "Consultante Stratégie & Diaspora",
    category: "business",
    location: "Dakar & Paris",
    country: "Sénégal",
    flag: "🇸🇳",
    bio: "Accompagne les fonds et PME de la diaspora dans leur implantation stratégique en Afrique de l'Ouest.",
    initials: "SB",
    gradient: "from-cyan-600 to-blue-700",
    isVerified: true,
    skills: ["Conseil M&A", "Partenariats", "Audit RSE", "Développement"],
  },
  {
    id: "p4",
    name: "Ibrahim Diallo",
    slug: "ibrahim-diallo",
    role: "Product Designer & UX Researcher",
    category: "design",
    location: "Conakry",
    country: "Guinée",
    flag: "🇬🇳",
    bio: "Conçoit des expériences mobiles simples, inclusives et adaptées aux environnements à faible débit.",
    initials: "ID",
    gradient: "from-purple-600 to-indigo-600",
    isVerified: true,
    skills: ["Figma", "Design System", "Mobile UX", "Recherche utilisateur"],
  },
  {
    id: "p5",
    name: "Yao Rodrigue",
    slug: "yao-rodrigue",
    role: "Maître Artisan Ébéniste d'Art",
    category: "artisanat",
    location: "Cotonou",
    country: "Bénin",
    flag: "🇧🇯",
    bio: "Mobilier contemporain haut de gamme en bois massif africain certifié. Export sous-régional.",
    initials: "YR",
    gradient: "from-emerald-600 to-teal-500",
    isFounder: true,
    isVerified: true,
    skills: ["Ébénisterie", "Mobilier sur mesure", "Design Africain", "Restauration"],
  },
  {
    id: "p6",
    name: "Fatou Sow",
    slug: "fatou-sow",
    role: "Data Scientist & Architecte IA",
    category: "tech",
    location: "Dakar",
    country: "Sénégal",
    flag: "🇸🇳",
    bio: "Spécialiste du traitement du langage naturel (NLP) pour les langues locales africaines.",
    initials: "FS",
    gradient: "from-blue-700 to-indigo-500",
    isVerified: true,
    skills: ["Python", "NLP", "LLM Serving", "PostgreSQL"],
  },
];

const categories = [
  { id: "all", label: "Tous les profils" },
  { id: "tech", label: "Tech & Ingénierie" },
  { id: "founder", label: "Fondateurs & Startups" },
  { id: "business", label: "Consulting & Business" },
  { id: "design", label: "Design & Produit" },
  { id: "artisanat", label: "Artisanat & Métiers d'Art" },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");

  const countries = useMemo(() => {
    const list = Array.from(new Set(profiles.map((p) => p.country)));
    return ["all", ...list];
  }, []);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchCountry = selectedCountry === "all" || p.country === selectedCountry;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q));
      return matchCat && matchCountry && matchSearch;
    });
  }, [search, selectedCategory, selectedCountry]);

  return (
    <main className="min-h-screen bg-background relative overflow-hidden py-24 sm:py-32">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#013ff4]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#03b3f8]/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#013ff4]/10 dark:bg-[#013ff4]/20 border border-[#013ff4]/25 text-[#013ff4] dark:text-[#03b3f8] text-xs font-bold uppercase tracking-wider mb-4"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Annuaire Public Certifié</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4"
          >
            Explorer les talents et entreprises d&apos;<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] to-[#03b3f8]">Afrique</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Découvrez des profils professionnels vérifiés, prêts à collaborer. Cliquez sur un profil pour consulter son empreinte certifiée sur l&apos;application.
          </motion.p>
        </div>

        {/* Filtres & Barre de recherche */}
        <div className="max-w-4xl mx-auto mb-12 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, métier, compétence (ex: React, FinTech, Abidjan...)"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-[#000616] border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#013ff4] shadow-sm"
              />
            </div>

            {/* Sélecteur Pays */}
            <div className="relative sm:w-56 shrink-0">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#000616] border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#013ff4] shadow-sm appearance-none cursor-pointer"
              >
                <option value="all">Tous les pays ({profiles.length})</option>
                {countries.filter((c) => c !== "all").map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pilules Catégories */}
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#013ff4] text-white shadow-sm"
                    : "bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de Profils */}
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-16 px-6 max-w-md mx-auto rounded-3xl bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10">
            <p className="font-bold text-gray-900 dark:text-white text-base mb-1">Aucun profil ne correspond</p>
            <p className="text-xs text-gray-500">Modifiez vos mots-clés ou réinitialisez les filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
            {filteredProfiles.map((profile, idx) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#000616] border border-gray-200/80 dark:border-white/10 hover:border-[#013ff4]/40 dark:hover:border-[#03b3f8]/40 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* Header carte */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${profile.gradient} text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0`}>
                        {profile.initials}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#013ff4] dark:group-hover:text-[#03b3f8] transition-colors flex items-center gap-1.5">
                          {profile.name}
                          <span title={profile.country}>{profile.flag}</span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{profile.role}</p>
                      </div>
                    </div>

                    {/* Badge */}
                    {profile.isFounder ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 shrink-0">
                        <Crown className="w-3 h-3" /> Fondateur
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Vérifié
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-2">
                    {profile.bio}
                  </p>

                  {/* Compétences */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {profile.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer avec lien vers l'application */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {profile.location}, {profile.country}
                  </span>

                  <a
                    href={`${USER_APP_URL}/profil/${profile.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#013ff4] dark:text-[#03b3f8] group-hover:underline"
                  >
                    <span>Voir profil</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Rejoindre le réseau */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-[#013ff4] to-[#000616] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl border border-[#013ff4]/40">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">
              Vous avez une expertise à faire valoir ?
            </h2>
            <p className="text-blue-100/90 text-xs sm:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
              Rejoignez les 500+ acteurs économiques qui certifient leur réputation professionnelle sur EmiID. Inscription gratuite sans carte bancaire.
            </p>
            <Link
              href={`${USER_APP_URL}/creer-profil`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#013ff4] font-bold text-sm shadow-lg hover:scale-105 transition-all"
            >
              <span>Créer mon empreinte numérique</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
