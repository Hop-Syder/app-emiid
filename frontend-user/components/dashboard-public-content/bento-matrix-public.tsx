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

/**
 * Emprise de chaque tuile. Huit métiers sur trois colonnes : un grand bloc
 * 2×2, une colonne simple, une rangée de trois, puis un bandeau large. Le
 * remplissage dense de la grille rebouche les cellules laissées libres.
 */
const TILE_SPANS = [
  "col-span-2 row-span-2",          // grand bloc d'ouverture
  "",
  "",
  "",
  "",
  "",
  "col-span-2",                     // bandeau large
  "",
]

/**
 * Apparition d'une tuile. Le décalage vient du rang (`custom`) : la grille se
 * compose alors sous l'œil au lieu de surgir d'un bloc. Il est plafonné, sans
 * quoi la dernière tuile d'une liste longue se ferait attendre.
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
      delay: Math.min(i, 7) * 0.07,
    },
  }),
}

export function BentoMatrixPublic() {
  const router = useRouter()
  // Respecte le réglage système : un mouvement continu peut incommoder les
  // personnes sensibles aux animations.
  const reduceMotion = useReducedMotion()
  // Ordre d'occupation des emplacements. Ce sont les images qui tournent, pas
  // la mosaïque : les emprises restent attachées à l'emplacement, si bien que
  // la silhouette de la grille ne bouge jamais et que chaque métier passe à
  // son tour dans le grand bloc.
  const [order, setOrder] = useState<number[]>(() => ARTISAN_CATEGORIES.map((_, i) => i))
  // Suspend la rotation pendant qu'on survole la galerie : une tuile qui se
  // déplace à l'instant du clic fait manquer sa cible.
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    // Pas de mouvement automatique pour qui a demandé moins d'animations :
    // du contenu qui bouge seul est précisément ce que ce réglage vise.
    if (reduceMotion || paused) return

    const id = setInterval(() => {
      // Onglet en arrière-plan : inutile de faire tourner une grille que
      // personne ne regarde.
      if (document.visibilityState !== "visible") return
      // Décalage d'un cran plutôt que brassage complet : tout se déplace, mais
      // le mouvement reste lisible au lieu de partir dans tous les sens.
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
          const cat = ARTISAN_CATEGORIES[categoryIndex]
          const span = TILE_SPANS[i % TILE_SPANS.length]
          return (
            <motion.button
              key={cat.id}
              type="button"
              // `layout` fait glisser la tuile de son ancien emplacement vers
              // le nouveau ; sans lui, les images sauteraient d'un coup.
              layout
              transition={{ type: "spring", stiffness: 210, damping: 27 }}
              custom={i}
              variants={tileVariants}
              initial="hidden"
              whileInView="show"
              // La galerie se compose à la première apparition ; la rejouer à
              // chaque passage deviendrait vite agaçant au défilement.
              viewport={{ once: true, amount: 0.2 }}
              onClick={() => router.push(`/annuaire?query=${encodeURIComponent(cat.title)}`)}
              aria-label={`${cat.title} — ${cat.count} professionnels certifiés`}
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
                        // Décalage indexé sur le métier et non sur
                        // l'emplacement : accroché à l'emplacement, il
                        // changerait à chaque rotation et relancerait le
                        // va-et-vient de toutes les tuiles d'un coup.
                        // Désynchronisées, elles évitent le battement commun.
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

              {/* Le nom n'apparaît qu'au survol, comme dans la maquette. Le
                  voile n'existe que pour le rendre lisible sur une photo
                  claire, d'où son apparition simultanée. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 translate-y-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <h3 className="text-sm font-black leading-tight text-white">{cat.title}</h3>
                <span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-white/75">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  {cat.count} pros certifiés
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

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
