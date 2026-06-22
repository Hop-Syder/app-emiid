"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe2, UserCircle2, CreditCard, ShieldCheck } from "lucide-react";

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

interface Faq {
  question: string;
  answer: string;
}

interface Category {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  faqs: Faq[];
}

const categories: Category[] = [
  {
    title: "Comprendre Emiid",
    icon: Globe2,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",
    faqs: [
      {
        question: "Qu'est-ce qu'Emiid exactement ?",
        answer:
          "Emiid est la première plateforme africaine de profils professionnels certifiés. Concrètement, c'est l'endroit où vous créez une carte d'identité professionnelle en ligne — validée par vos pairs, visible par les recruteurs, entreprises et partenaires d'affaires. Contrairement aux réseaux généralistes, Emiid est conçu pour valoriser aussi bien le développeur senior que l'artisan talentueux ou le fondateur de startup, en tenant compte des réalités économiques et technologiques du continent.",
      },
      {
        question: "Pour qui est conçu Emiid ?",
        answer:
          "Emiid s'adresse à trois grandes cibles :\n\n• **Les Talents & Freelancers** — développeurs, designers, artisans, consultants — qui veulent être trouvés et contactés sans passer par des intermédiaires.\n• **Les Fondateurs & Entrepreneurs** — qui cherchent à crédibiliser leur startup, exposer leur vision et attirer des entreprises ou des talents.\n• **Les Entreprises** — qui veulent identifier et contacter des profils vérifiés en Afrique, sans friction ni faux comptes.",
      },
      {
        question: "En quoi êtes-vous différents de LinkedIn ou WhatsApp Business ?",
        answer:
          "LinkedIn est pensé pour le marché occidental : ses tarifs en dollars sont inaccessibles pour la plupart des professionnels africains, il ne valorise pas l'économie informelle, et il est souvent trop lent sur des connexions mobiles instables.\n\nWhatsApp permet la messagerie, mais n'offre aucune crédibilisation de profil, aucune découvrabilité, aucune vérification.\n\nEmiid combine les deux : un profil professionnel structuré et certifié + une messagerie directe, le tout optimisé pour l'Afrique — tarifs en FCFA, paiement Mobile Money, interface ultra-légère, et support en français par une équipe locale.",
      },
      {
        question: "Dans quels pays est disponible Emiid ?",
        answer:
          "Emiid est disponible partout dans le monde, mais conçu en priorité pour l'Afrique subsaharienne francophone : Côte d'Ivoire, Sénégal, Mali, Burkina Faso, Guinée, Bénin, Togo, Cameroun, Congo, Gabon et bien d'autres. Les paiements Mobile Money (Wave, Orange Money, MTN MoMo) sont activés dans les pays où ces services opèrent. Des membres internationaux (Europe, Canada, États-Unis) rejoignent également la plateforme pour accéder aux profils africains.",
      },
    ],
  },
  {
    title: "Profil & Compte",
    icon: UserCircle2,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
    faqs: [
      {
        question: "Comment créer mon profil Emiid ?",
        answer:
          "La création de profil prend moins de 5 minutes en 5 étapes guidées :\n\n1. **Identité** — Photo, nom complet et titre professionnel.\n2. **Expertise** — Votre catégorie (Talent, Fondateur, Entreprise...) et secteur d'activité.\n3. **Histoire** — Votre bio et lien personnalisé (emiid.com/votrenom).\n4. **Localisation** — Pays et ville.\n5. **Compétences** — Tags qui vous rendent trouvable dans l'annuaire.\n\nVous pouvez sauvegarder en cours de route et compléter plus tard. Aucune carte bancaire requise.",
      },
      {
        question: "Quel type de profil dois-je choisir ?",
        answer:
          "Lors de la création, vous sélectionnez votre catégorie principale :\n\n• **Talent** : développeur, designer, comptable, juriste, artisan, prestataire de service.\n• **Fondateur** : vous avez lancé ou co-fondé une startup, une entreprise, une association.\n• **Entreprise** : vous investissez, accompagnez ou financez des projets (business angels, fonds, VC), ou recrutez des profils.\n• **Recruteur / Entreprise** : vous cherchez à embaucher ou à sous-traiter.\n\nVous pouvez compléter avec plusieurs secteurs d'activité. Le profil reste modifiable à tout moment.",
      },
      {
        question: "Comment personnaliser mon lien de profil ?",
        answer:
          `Avec un compte gratuit, votre profil est accessible via un URL avec votre identifiant unique. Avec le plan Pro (2 000 FCFA/mois), vous choisissez un pseudo personnalisé : emiid.com/votrenom. Ce lien est ensuite utilisable sur votre CV, votre carte de visite ou vos signatures d'email. Si le pseudo est déjà pris, le système vous propose des alternatives. Vous pouvez le modifier une fois tous les 60 jours.`,
      },
      {
        question: "Mon profil est-il visible immédiatement après inscription ?",
        answer:
          "Oui, dès que vous publiez votre profil, il est visible dans l'annuaire public. Cependant, votre visibilité dans les résultats de recherche dépend de la complétude de votre profil : un profil à 80%+ remonte bien plus haut qu'un profil vide. Les réalisations ajoutées à votre portfolio passent par une modération légère (généralement sous 24h) avant d'apparaître publiquement, pour éviter les contenus inappropriés.",
      },
      {
        question: "Comment ajouter des réalisations à mon portfolio ?",
        answer:
          "Depuis votre espace Portefeuille (accessible dans le menu une fois connecté), cliquez sur « Ajouter une réalisation ». Vous uploadez une image, ajoutez un titre et une courte description de la mission ou du projet. La réalisation passe en statut « En attente » le temps de la modération (sous 24h en général), puis elle est visible sur votre profil public avec le badge « Publié ». En cas de refus, la raison vous est communiquée pour corriger et renvoyer.",
      },
      {
        question: "Comment obtenir le Badge Fondateur Numéroté ?",
        answer:
          "Le Badge Fondateur est réservé aux 1 000 premiers inscrits (700 places en Afrique, 300 à l'international) qui remplissent ces 4 conditions :\n\n1. **Être dans les 1 000 premiers** profils validés, en temps réel.\n2. **Compléter son profil à au moins 80%** (bio, compétences, photo, localisation).\n3. **Parrainer 3 amis actifs** (inscrits + profil complété à 30% minimum).\n4. **Avoir un compte de plus de 48h** (anti-spam).\n\nEn bonus : faites valider au moins une compétence par un pair pour booster votre crédibilité. Le badge vous donne accès à 1 an de Plan Pro offert — valeur de 24 000 FCFA.",
      },
    ],
  },
  {
    title: "Abonnements & Paiement",
    icon: CreditCard,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    faqs: [
      {
        question: "Est-ce qu'Emiid est gratuit ?",
        answer:
          "La création de profil et l'accès à l'annuaire de base sont **entièrement gratuits et le restent**. Le plan Gratuit inclut un profil public, l'apparition dans l'annuaire, jusqu'à 3 compétences et la messagerie basique (10 messages/jour).\n\nPour aller plus loin, nous proposons 3 plans payants :\n• **Pro** — 2 000 FCFA/mois (portfolio illimité, messagerie illimitée, stats de visibilité, lien personnalisé)\n• **Entreprise** — 5 000 FCFA/mois (page entreprise vérifiée, gestion d'équipe, offres d'emploi, CRM)\n• **Entreprise+** — 10 000 FCFA/mois (profils illimités, API, account manager dédié)\n\nLa facturation annuelle offre 20% de réduction sur tous les plans.",
      },
      {
        question: "Quels modes de paiement acceptez-vous ?",
        answer:
          "Nous acceptons :\n• **Wave** (Côte d'Ivoire, Sénégal, Mali, Burkina Faso...)\n• **Orange Money** (multi-pays)\n• **MTN MoMo** (Côte d'Ivoire, Cameroun, Bénin...)\n• **Cartes bancaires Visa / Mastercard** (via FedaPay)\n• **Virement bancaire** (plans Entreprise+ sur devis)\n\nTous les paiements sont en **FCFA**, sans conversion ni frais de change. Aucune carte de crédit étrangère n'est requise pour commencer.",
      },
      {
        question: "Y a-t-il une réduction pour l'abonnement annuel ?",
        answer:
          "Oui, chaque plan payant bénéficie de **20% de réduction** en choisissant la facturation annuelle :\n• Pro : 2 000 → 1 600 FCFA/mois (19 200 FCFA facturés une fois par an)\n• Entreprise : 5 000 → 4 000 FCFA/mois (48 000 FCFA/an)\n• Entreprise+ : 10 000 → 8 000 FCFA/mois (96 000 FCFA/an)\n\nVous pouvez basculer entre mensuel et annuel à tout moment depuis votre tableau de bord.",
      },
      {
        question: "Puis-je changer ou annuler mon abonnement à tout moment ?",
        answer:
          "Oui, sans frais et sans conditions. Vous pouvez upgrader, downgrader ou annuler depuis votre espace Paramètres → Abonnement. En cas d'annulation, vous conservez l'accès aux fonctionnalités payantes jusqu'à la fin de la période déjà réglée. Aucun remboursement prorata n'est proposé pour les périodes mensuelles, mais les abonnements annuels font l'objet d'un remboursement au prorata si l'annulation intervient dans les 7 premiers jours.",
      },
    ],
  },
  {
    title: "Fonctionnalités & Sécurité",
    icon: ShieldCheck,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    faqs: [
      {
        question: "Comment fonctionne le système de vérification et de confiance ?",
        answer:
          "Emiid utilise plusieurs couches de confiance :\n\n• **Vérification d'identité légère** : à l'inscription, votre adresse email ou numéro de téléphone est confirmé.\n• **Validation par les pairs** : vos contacts sur la plateforme peuvent endorser vos compétences, ce qui ajoute un badge de crédibilité sur chaque compétence validée.\n• **Badge Entreprise Certifiée** : les comptes Entreprise fournissent leur registre de commerce pour obtenir le badge officiel.\n• **Signalement communautaire** : chaque profil peut être signalé par les utilisateurs. Notre équipe examine sous 48h et peut suspendre un compte frauduleux.\n\nCette approche progressive nous permet d'équilibrer accessibilité et fiabilité.",
      },
      {
        question: "Comment fonctionne la messagerie EmiID ?",
        answer:
          "La messagerie d'Emiid permet de contacter n'importe quel profil directement depuis la plateforme, sans partager votre numéro de téléphone. Elle supporte :\n• Texte et emojis\n• Envoi de fichiers et d'images (plan Pro et supérieurs)\n• Lecture confirmée (vu)\n• Chiffrement en transit\n\nLe plan Gratuit est limité à 10 messages envoyés par jour. Le plan Pro lève cette limite. La messagerie est accessible depuis la version web et sera bientôt disponible via une application mobile.",
      },
      {
        question: "Mes données personnelles sont-elles protégées ?",
        answer:
          "Oui. Emiid est construit sur Supabase avec une architecture de sécurité Row-Level Security (RLS) : chaque utilisateur n'accède qu'aux données qui lui sont destinées. Vos données ne sont jamais vendues à des tiers.\n\nDe plus :\n• Votre profil peut être masqué de l'annuaire public à tout moment depuis Paramètres.\n• Vous pouvez activer un **code PIN** pour protéger l'accès à votre compte.\n• Vous pouvez activer la **vérification en 2 étapes (2FA)** via SMS ou WhatsApp.\n• Les données sont hébergées sur des serveurs situés en Europe (conformité RGPD).",
      },
      {
        question: "Comment fonctionne la médiation intégrée dans les conversations ?",
        answer:
          "Emiid intègre un système de médiation directement dans chaque conversation. Si un échange tourne au conflit — litige sur une prestation, désaccord sur un paiement, malentendu professionnel — l'une ou l'autre des parties peut déclencher une demande de médiation sans quitter la messagerie.\n\nConcrètement :\n• Un bouton « Demander une médiation » est disponible dans les options de la conversation.\n• Une fois la demande envoyée, un message de médiation officiel apparaît dans le fil de discussion, visible par les deux parties.\n• Un médiateur Emiid est notifié et rejoint la conversation pour faciliter la résolution à l'amiable.\n• Les échanges dans ce cadre sont tracés et conservés pour servir de référence en cas d'escalade.\n\nCette fonctionnalité est disponible sur tous les plans, y compris le plan Gratuit. Elle vise à protéger aussi bien le prestataire que le client, sans avoir à recourir à des voies extérieures.",
      },
      {
        question: "Comment signaler un faux profil ou un contenu abusif ?",
        answer:
          "Sur chaque profil public, un bouton « Signaler » est accessible dans le menu des options (icône ⋯). Vous choisissez la catégorie de signalement (faux profil, arnaque, contenu inapproprié, usurpation d'identité) et ajoutez un commentaire optionnel. Notre équipe de modération examine le signalement sous 24 à 48h et prend les mesures appropriées (avertissement, suspension temporaire ou bannissement définitif). Les signalements abusifs sont également traçables pour protéger les profils légitimes.",
      },
    ],
  },
];

export function FaqAccordion() {
  const [openKey, setOpenKey] = useState<string | null>("0-0");

  const toggle = (key: string) => setOpenKey(openKey === key ? null : key);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 space-y-10">
      {categories.map((cat, catIdx) => {
        const Icon = cat.icon;
        return (
          <div key={catIdx}>
            {/* Category header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className={`p-2 rounded-xl ${cat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">
                {cat.title}
              </h3>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </motion.div>

            {/* Questions */}
            <div className="space-y-3">
              {cat.faqs.map((faq, faqIdx) => {
                const key = `${catIdx}-${faqIdx}`;
                const isOpen = openKey === key;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: faqIdx * 0.07 }}
                    className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
                      isOpen
                        ? "bg-white/70 dark:bg-white/[0.05] border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                        : "bg-white/30 dark:bg-[#0a0a0a]/60 border-gray-200/50 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                    } backdrop-blur-xl`}
                  >
                    <button
                      onClick={() => toggle(key)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className={`text-base font-bold leading-snug pr-4 ${isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className={`flex-shrink-0 p-2 rounded-full transition-colors ${isOpen ? "bg-indigo-500/10 text-indigo-500" : "bg-gray-100 dark:bg-white/5 text-gray-400"}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Contact CTA at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl"
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          Vous ne trouvez pas la réponse à votre question ?
        </p>
        <a
          href="mailto:contact@emiid.com"
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Contactez notre équipe →
        </a>
      </motion.div>
    </div>
  );
}
