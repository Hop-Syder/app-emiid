/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description BentoMatrixPublic — Galerie visuelle des Métiers & Artisans d'Excellence EmiID.
 *              Remplace l'ancienne matrice abstraite par une section visuelle riche
 *              présentant les métiers, cartes d'artisans avec images, filtres par secteur
 *              et recherche dynamique pour s'orienter facilement dans l'annuaire.
 * @created 2026-08-24
 * @updated 2026-08-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Search, Sparkles, ArrowRight, MapPin, Users,
  CheckCircle2, Wrench, Scissors, Car, Utensils,
  Hammer, Paintbrush, Zap, ShieldCheck
} from "lucide-react"

export interface ArtisanCategoryItem {
  id: string
  title: string
  subtitle: string
  count: number
  badge: string
  badgeColor: string
  image: string
  sector: "Artisanat BTP" | "Mode & Beauté" | "Services Techniques" | "Alimentation" | "Créatifs & Tech"
  tags: string[]
  samplePros: { name: string; avatar: string; location: string }[]
}

const ARTISAN_CATEGORIES: ArtisanCategoryItem[] = [
  {
    id: "electricite",
    title: "Électricité & Bâtiment",
    subtitle: "Installations électriques, dépannages rapides & mises aux normes",
    count: 38,
    badge: "Haute Demande",
    badgeColor: "bg-[#013ff4] text-white",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    sector: "Artisanat BTP",
    tags: ["Électricité", "Dépannage 24/7", "Domotique"],
    samplePros: [
      { name: "Koffi Adjovi", avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80", location: "Cotonou" },
      { name: "Moussa G.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", location: "Calavi" },
    ]
  },
  {
    id: "couture",
    title: "Couture, Mode & Sur-Mesure",
    subtitle: "Stylisme, prêt-à-porter wax, broderie & tenues de cérémonie",
    count: 52,
    badge: "Top Tendances",
    badgeColor: "bg-pink-600 text-white",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458e5e?auto=format&fit=crop&w=800&q=80",
    sector: "Mode & Beauté",
    tags: ["Couture Wax", "Sur-Mesure", "Cérémonie"],
    samplePros: [
      { name: "Aïcha Seidou", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", location: "Cotonou" },
      { name: "Léonie Kpoton", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", location: "Porto-Novo" },
    ]
  },
  {
    id: "mecanique",
    title: "Mécanique Auto & Diagnostic",
    subtitle: "Entretien moteur, électronique automobile, freinage & pneu",
    count: 29,
    badge: "Vérifiés",
    badgeColor: "bg-amber-600 text-white",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
    sector: "Services Techniques",
    tags: ["Mécanique", "Diagnostic", "Vulcanisation"],
    samplePros: [
      { name: "Rachid Bio", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", location: "Parakou" },
      { name: "Yacoubou I.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80", location: "Parakou" },
    ]
  },
  {
    id: "traiteur",
    title: "Traiteur & Pâtisserie",
    subtitle: "Buffets béninois, pâtisserie de réceptions & mariages",
    count: 34,
    badge: "Certifiés",
    badgeColor: "bg-emerald-600 text-white",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    sector: "Alimentation",
    tags: ["Traiteur", "Gâteaux", "Mariages"],
    samplePros: [
      { name: "Bernadette H.", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80", location: "Porto-Novo" },
      { name: "Micheline T.", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80", location: "Cotonou" },
    ]
  },
  {
    id: "menuiserie",
    title: "Menuiserie & Travaux du Bois",
    subtitle: "Mobilier sur mesure, agencement d'intérieur & charpentes",
    count: 26,
    badge: "Artisan Pro",
    badgeColor: "bg-orange-600 text-white",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
    sector: "Artisanat BTP",
    tags: ["Menuiserie", "Mobilier", "Charpente"],
    samplePros: [
      { name: "Ibrahim Traoré", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80", location: "Bohicon" },
      { name: "Prosper A.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", location: "Ouidah" },
    ]
  },
  {
    id: "coiffure",
    title: "Coiffure & Soins Esthétiques",
    subtitle: "Tresses afro, soins naturels, maquillage & salons de beauté",
    count: 41,
    badge: "Tendances",
    badgeColor: "bg-purple-600 text-white",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    sector: "Mode & Beauté",
    tags: ["Tresses Afro", "Esthétique", "Soins"],
    samplePros: [
      { name: "Fatou Zinsou", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80", location: "Abomey-Calavi" },
    ]
  },
  {
    id: "soudure",
    title: "Soudure & Métallerie d'Art",
    subtitle: "Portails sur mesure, grilles de protection & charpentes métalliques",
    count: 22,
    badge: "Sécurité",
    badgeColor: "bg-slate-800 text-white",
    image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    sector: "Artisanat BTP",
    tags: ["Métallerie", "Portails", "Soudure"],
    samplePros: [
      { name: "Anicet A.", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80", location: "Abomey-Calavi" },
    ]
  },
  {
    id: "creatifs-tech",
    title: "Développement & Design",
    subtitle: "Création de sites web, graphisme, identité visuelle & logiciels",
    count: 36,
    badge: "Digital & Tech",
    badgeColor: "bg-cyan-600 text-white",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    sector: "Créatifs & Tech",
    tags: ["Web & Mobile", "Logos & Design", "Freelance"],
    samplePros: [
      { name: "Serge Dossou", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80", location: "Cotonou" },
      { name: "Sandrine Loko", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", location: "Cotonou" },
    ]
  }
]

const SECTORS = [
  "Tous les secteurs",
  "Artisanat BTP",
  "Mode & Beauté",
  "Services Techniques",
  "Alimentation",
  "Créatifs & Tech"
] as const

export function BentoMatrixPublic() {
  const router = useRouter()
  const [selectedSector, setSelectedSector] = useState<string>("Tous les secteurs")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredCategories = useMemo(() => {
    return ARTISAN_CATEGORIES.filter((cat) => {
      const matchSector = selectedSector === "Tous les secteurs" || cat.sector === selectedSector
      const matchQuery =
        searchQuery.trim() === "" ||
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchSector && matchQuery
    })
  }, [selectedSector, searchQuery])

  return (
    <section className="space-y-8 py-4">
      {/* ── EN-TÊTE DE LA SECTION ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/90 shadow-[0_12px_32px_rgba(15,23,42,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#013ff4]/5 to-[#03b3f8]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf1ff] text-[#013ff4] text-xs font-bold shadow-xs">
            <Sparkles className="h-4 w-4" />
            <span>Portail des Artisans & Métiers d'Excellence</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            Découvrez nos Artisans & Spécialistes certifiés
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Parcourez les catégories de métiers du Bénin, visualisez les talents vérifiés proches de chez vous et entrez directement en contact.
          </p>
        </div>

        {/* BARRE DE RECHERCHE DYNAMIQUE DANS LA SECTION */}
        <div className="relative z-10 w-full lg:w-80">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher un métier, tag (ex: électricité)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30 focus:border-[#013ff4] transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* ── FILTRES PAR SECTEUR (BOUTONS PILLS) ────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SECTORS.map((sector) => {
          const isActive = selectedSector === sector
          return (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-[#013ff4] text-white shadow-md shadow-[#013ff4]/20 scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {sector === "Tous les secteurs" && <Users className="h-3.5 w-3.5" />}
              {sector === "Artisanat BTP" && <Hammer className="h-3.5 w-3.5" />}
              {sector === "Mode & Beauté" && <Scissors className="h-3.5 w-3.5" />}
              {sector === "Services Techniques" && <Wrench className="h-3.5 w-3.5" />}
              {sector === "Alimentation" && <Utensils className="h-3.5 w-3.5" />}
              {sector === "Créatifs & Tech" && <Paintbrush className="h-3.5 w-3.5" />}
              <span>{sector}</span>
            </button>
          )
        })}
      </div>

      {/* ── GRILLE DE CARTES VISUELLES D'ARTISANS ──────────────────────── */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-slate-200 p-8 space-y-3">
          <Search className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Aucun métier trouvé</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Aucun secteur ne correspond à "{searchQuery}". Essayez une autre recherche ou réinitialisez les filtres.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedSector("Tous les secteurs"); }}
            className="px-4 py-2 rounded-xl bg-[#013ff4] text-white text-xs font-bold mt-2"
          >
            Réinitialiser la recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                onClick={() => router.push(`/annuaire?query=${encodeURIComponent(cat.title)}`)}
                className="group relative overflow-hidden rounded-[2.2rem] bg-white border border-slate-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_36px_rgba(1,63,244,0.12)] hover:border-[#013ff4]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Image d'En-tête avec Overlay et Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Badge Haut-Droit */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${cat.badgeColor}`}>
                      {cat.badge}
                    </span>
                  </div>

                  {/* Secteur Bas-Gauche */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-bold text-white/90 bg-slate-900/80 px-2.5 py-1 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>{cat.count} Pros certifiés</span>
                    </span>
                  </div>
                </div>

                {/* Corps de la Carte */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#013ff4] transition-colors leading-tight font-heading">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Tags clés */}
                  <div className="flex flex-wrap gap-1.5">
                    {cat.tags.map((t) => (
                      <span key={t} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Profils d'Exemple (Avatars + Localisation) */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                      {cat.samplePros.map((pro, idx) => (
                        <img
                          key={idx}
                          src={pro.avatar}
                          alt={pro.name}
                          className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-xs"
                          title={`${pro.name} (${pro.location})`}
                        />
                      ))}
                      <span className="text-[10px] font-bold text-slate-500 pl-3">
                        {cat.samplePros.map(p => p.location).join(', ')}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-[#013ff4] text-slate-400 group-hover:text-white transition-all shadow-xs">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── BANNIÈRE BASSE D'ACCÈS RAPIDE À L'ANNUAIRE ──────────────────── */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-[#013ff4] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 text-center sm:text-left z-10">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Vous ne trouvez pas votre métier ?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            Explorez l'annuaire complet d'EmiID avec filtres avancés par commune, avis clients et prise de contact instantanée.
          </p>
        </div>

        <button
          onClick={() => router.push('/annuaire')}
          className="z-10 shrink-0 px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <span>Voir tout l'annuaire</span>
          <ArrowRight className="h-4 w-4 text-[#013ff4]" />
        </button>
      </div>
    </section>
  )
}
