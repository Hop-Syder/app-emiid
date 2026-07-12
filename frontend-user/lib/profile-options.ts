/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Source unique des Types de profil (category) et Secteurs d'activité
 *              (activity_domain). Utilisée par la création de profil, l'édition
 *              (paramètres) et les filtres de l'annuaire — pour rester cohérent partout.
 * @created 2026-07-12
 */

export interface ProfileOption {
  value: string
  /** Libellé affiché, emoji inclus. */
  label: string
}

/** Types de profil (user_profiles.category). */
export const PROFILE_CATEGORIES: ProfileOption[] = [
  { value: "artisan",          label: "🎨 Artisan" },
  { value: "commerçante",      label: "🛒 Commerçant(e)" },
  { value: "freelance",        label: "💻 Freelance" },
  { value: "consultant",       label: "🧠 Consultant(e) / Expert indépendant" },
  { value: "employe",          label: "💼 Employé(e) / Salarié(e)" },
  { value: "entreprise",       label: "🏢 Entreprise" },
  { value: "agence",           label: "📣 Agence" },
  { value: "startup",          label: "🚀 Startup" },
  { value: "createur_contenu", label: "📸 Créateur de contenu / Influenceur" },
  { value: "artiste",          label: "🎭 Artiste / Performeur / Musicien" },
  { value: "event_planner",    label: "🎪 Event Planner / Organisateur d'événements" },
  { value: "ong",              label: "🌍 ONG / Association" },
  { value: "investisseur",     label: "📈 Entreprise / Investisseur" },
  { value: "institution",      label: "🏛️ Institution publique" },
  { value: "ecole",            label: "🎓 École / Centre de formation" },
  { value: "etudiant",         label: "🎓 Étudiant / Junior" },
  { value: "recherche_emploi", label: "🔍 En recherche d'opportunités" },
]

/** Secteurs d'activité (user_profiles.activity_domain). */
export const ACTIVITY_DOMAINS: ProfileOption[] = [
  { value: "tech",         label: "💻 Tech & Digital" },
  { value: "agro",         label: "🌾 Agroalimentaire" },
  { value: "btp",          label: "🏗️ BTP & Construction" },
  { value: "finance",      label: "💰 Finance & Assurance" },
  { value: "droit",        label: "⚖️ Droit & Juridique" },
  { value: "conseil",      label: "🧠 Conseil, Audit & RH" },
  { value: "immobilier",   label: "🏠 Immobilier & Logement" },
  { value: "sante",        label: "🏥 Santé & Bien-être" },
  { value: "education",    label: "📚 Éducation & Formation" },
  { value: "creatif",      label: "🎨 Arts & Créativité" },
  { value: "media",        label: "📢 Médias, Communication & Publicité" },
  { value: "mode",         label: "👕 Mode, Beauté & Cosmétique" },
  { value: "restauration", label: "🍳 Restauration & Métiers de bouche" },
  { value: "commerce",     label: "🛍️ Commerce & Distribution" },
  { value: "industrie",    label: "⚙️ Industrie, Mécanique & Automobile" },
  { value: "transport",    label: "🚚 Transport & Logistique" },
  { value: "tourisme",     label: "✈️ Tourisme & Hôtellerie" },
  { value: "securite",     label: "🛡️ Sécurité, Gardiennage & Protection" },
  { value: "services",     label: "🛠️ Services à la personne & Maintenance" },
  { value: "sport",        label: "⚽ Sport, Loisirs & Bien-être" },
  { value: "evenementiel", label: "🎪 Événementiel" },
  { value: "energie",      label: "⚡ Énergie & Environnement" },
  { value: "b2b",          label: "🤝 Services B2B" },
]

/** Variante avec l'option « Tous » en tête, pour les filtres. */
export const categoryFilterOptions = (allLabel = "Tous les types") => [
  { value: "all", label: allLabel },
  ...PROFILE_CATEGORIES,
]
export const domainFilterOptions = (allLabel = "Tous les secteurs") => [
  { value: "all", label: allLabel },
  ...ACTIVITY_DOMAINS,
]
