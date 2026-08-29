/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description BentoMatrixPublic — Galerie visuelle des Métiers & Artisans d'Excellence EmiID.
 *              Les métiers sont présentés en mosaïque d'images : la photo dit le
 *              métier plus vite qu'un paragraphe, et laisse la section respirer.
 *              La galerie est fixe et sans filtre : le tri fin est le rôle de
 *              l'annuaire, vers lequel chaque tuile mène.
 *
 *              Trois mouvements se superposent, et c'est leur cumul qui donne
 *              l'impression de vie : l'apparition décalée d'une tuile à l'autre,
 *              un lent va-et-vient d'échelle désynchronisé qui empêche l'image de
 *              paraître figée, et le rapprochement au survol — seul mouvement
 *              réellement déclenché par la personne.
 * @created 2026-08-24
 * @updated 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react"

export interface PublicCategoryItem {
  id: string
  title: string
  subtitle: string
  count: number
  badge: string
  badgeColor: string
  image: string
  tags: string[]
}

const OFFICIAL_CATEGORIES: PublicCategoryItem[] = [
  {
    id: "artisan",
    title: "Artisan",
    subtitle: "Création manuelle, métiers de l'artisanat & savoir-faire",
    count: 38,
    badge: "Savoir-faire",
    badgeColor: "bg-amber-600 text-white",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    tags: ["Maroquinerie", "Création", "Artisanat d'art"],
  },
  {
    id: "commerçante",
    title: "Commerçant",
    subtitle: "Vente de biens, boutiquier, grossiste & distribution",
    count: 52,
    badge: "Commerce",
    badgeColor: "bg-emerald-600 text-white",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
    tags: ["Boutique", "Grossiste", "Retail"],
  },
  {
    id: "freelance",
    title: "Freelance / Indépendant",
    subtitle: "Prestation de service en solo, consultant & expert",
    count: 42,
    badge: "Indépendant",
    badgeColor: "bg-[#013ff4] text-white",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    tags: ["Consulting", "Tech & Créa", "Solo"],
  },
  {
    id: "entreprise",
    title: "Entreprise",
    subtitle: "PME, TPE & Grande entreprise classique",
    count: 31,
    badge: "PME & TPE",
    badgeColor: "bg-slate-800 text-white",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    tags: ["PME", "TPE", "Corporate"],
  },
  {
    id: "agence",
    title: "Agence",
    subtitle: "Communication, Marketing, Web & RH",
    count: 27,
    badge: "Conseil & Créa",
    badgeColor: "bg-purple-600 text-white",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
    tags: ["Marketing", "Web & Design", "Stratégie"],
  },
  {
    id: "startup",
    title: "Startup",
    subtitle: "Jeune entreprise innovante, Tech & Croissance",
    count: 35,
    badge: "Innovation",
    badgeColor: "bg-rose-600 text-white",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    tags: ["Tech", "SaaS", "Scalabilité"],
  },
  {
    id: "ong",
    title: "ONG / Association",
    subtitle: "À but non lucratif, fondation & impact social",
    count: 19,
    badge: "Impact Social",
    badgeColor: "bg-cyan-600 text-white",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
    tags: ["Humanitaire", "Éducation", "Solidarité"],
  },
  {
    id: "investisseur",
    title: "Entreprise / Investisseur",
    subtitle: "Fonds d'investissement & recherche d'opportunités",
    count: 16,
    badge: "Investissement",
    badgeColor: "bg-indigo-600 text-white",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    tags: ["Capital", "Croissance", "Financement"],
  },
  {
    id: "institution",
    title: "Institution Publique",
    subtitle: "Ministère, agence d'État & chambre de commerce",
    count: 14,
    badge: "Secteur Public",
    badgeColor: "bg-teal-700 text-white",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    tags: ["Gouvernance", "Chambres", "Services publics"],
  },
  {
    id: "etudiant",
    title: "Étudiant / Jeune Diplômé",
    subtitle: "Recherche de stage, premier emploi & opportunités",
    count: 48,
    badge: "Jeunes Talents",
    badgeColor: "bg-orange-600 text-white",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    tags: ["Stage", "Premier emploi", "Diplômé"],
  },
]

/**
 * Emprise de chaque tuile pour les 10 catégories sur 3 colonnes :
 * - Rang 1-2 : Grand bloc 2x2 + 2 tuiles 1x1
 * - Rang 3   : 3 tuiles 1x1
 * - Rang 4   : Bandeau 2x1 + 1 tuile 1x1
 * - Rang 5   : 1 tuile 1x1 + Bandeau 2x1
 */
const TILE_SPANS = [
  "col-span-2 row-span-2",          // 0: grand bloc d'ouverture
  "",                              // 1: 1x1
  "",                              // 2: 1x1
  "",                              // 3: 1x1
  "",                              // 4: 1x1
  "",                              // 5: 1x1
  "col-span-2",                    // 6: bandeau large
  "",                              // 7: 1x1
  "",                              // 8: 1x1
  "col-span-2",                    // 9: bandeau large
]

/**
 * Apparition d'une tuile. Le décalage vient du rang (`custom`) : la grille se
 * compose alors sous l'œil au lieu de surgir d'un bloc.
 */
const tileVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 26,
      delay: Math.min(i, 9) * 0.06,
    },
  }),
}

interface BentoMatrixPublicProps {
  categoryCounts?: Record<string, number>
}

export function BentoMatrixPublic({ categoryCounts }: BentoMatrixPublicProps = {}) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [order, setOrder] = useState<number[]>(() => OFFICIAL_CATEGORIES.map((_, i) => i))
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduceMotion || paused) return

    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return
      setOrder((prev) => [...prev.slice(1), prev[0]])
    }, 5000)

    return () => clearInterval(id)
  }, [reduceMotion, paused])

  return (
    <section className="space-y-8 py-4">
      {/* ── EN-TÊTE DE LA SECTION ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/90 shadow-[0_12px_32px_rgba(15,23,42,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#013ff4]/5 to-[#03b3f8]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-3 relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            Découvrez nos 10 Catégories d&apos;Activité
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Du créateur indépendant aux grandes institutions, explorez les profils vérifiés de l&apos;écosystème EmiID et connectez-vous immédiatement.
          </p>
        </div>

      </div>

      {/* ── GALERIE EN MOSAÏQUE ────────────────────────────────────────
          Découpe asymétrique : un grand bloc, une colonne, une rangée, un
          bandeau. C'est l'irrégularité qui distingue une mosaïque d'un damier.
          Les proportions ne s'appliquent qu'à partir de `lg` ; en dessous, deux
          colonnes suffisent à garder du rythme sans écraser les photos. */}
      <div
        className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[150px] sm:auto-rows-[190px] gap-2.5 grid-flow-dense"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        // Même suspension au clavier : la tuile ciblée doit rester en place.
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {order.map((categoryIndex, i) => {
          const cat = OFFICIAL_CATEGORIES[categoryIndex]
          const span = TILE_SPANS[i % TILE_SPANS.length]
          const displayCount = categoryCounts?.[cat.id] ?? cat.count

          return (
            <motion.button
              key={cat.id}
              type="button"
              // `layout` fait glisser la tuile de son ancien emplacement vers le nouveau
              layout
              transition={{ type: "spring", stiffness: 210, damping: 27 }}
              custom={i}
              variants={tileVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              onClick={() => router.push(`/annuaire?category=${encodeURIComponent(cat.id)}`)}
              aria-label={`${cat.title} — ${displayCount} professionnels`}
              className={`group relative overflow-hidden rounded-2xl bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013ff4] focus-visible:ring-offset-2 ${span}`}
            >
              <motion.div
                className="absolute inset-0"
                animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                      duration: 9,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: (categoryIndex % 5) * 1.4,
                    }
                }
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                />
              </motion.div>

              {/* Voile de lisibilité permanent sur mobile, intensifié au survol sur desktop */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-85 sm:opacity-60 transition-opacity duration-300 group-hover:opacity-95" />
              
              {/* Badge de catégorie discret en haut à gauche */}
              <div className="pointer-events-none absolute top-3 left-3 z-10">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide backdrop-blur-md border border-white/10 ${cat.badgeColor || "bg-[#013ff4] text-white"}`}>
                  {cat.badge}
                </span>
              </div>

              {/* Bouton flèche discret en haut à droite (animé au survol) */}
              <div className="pointer-events-none absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-105">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>

              {/* Contenu textuel ancré en bas */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 sm:p-4 transition-transform duration-300 group-hover:-translate-y-0.5 z-10 text-left">
                <h3 className={`font-black leading-tight text-white tracking-tight ${span.includes("col-span-2 row-span-2") ? "text-base sm:text-xl" : "text-xs sm:text-sm"}`}>
                  {cat.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{displayCount} {typeof displayCount === "number" || !isNaN(Number(displayCount)) ? "profils" : ""}</span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* ── BANNIÈRE BASSE D'ACCÈS RAPIDE À L'ANNUAIRE ──────────────────── */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-[#013ff4] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 text-center sm:text-left z-10">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Vous recherchez un profil ou une expertise précise ?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            Explorez l&apos;annuaire complet d&apos;EmiID avec filtres avancés par commune, catégorie, badges certifiés et prise de contact instantanée.
          </p>
        </div>

        <button
          onClick={() => router.push('/annuaire')}
          className="z-10 shrink-0 px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <span>Explorer tout l&apos;annuaire</span>
          <ArrowRight className="h-4 w-4 text-[#013ff4]" />
        </button>
      </div>
    </section>
  )
}
