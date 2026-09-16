/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Types TypeScript stricts pour le moteur Missions Courtes,
 *              le wallet de crédits, le séquestre et le parrainage EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

export type TransactionType =
  | "WELCOME_BONUS"
  | "PURCHASE"
  | "APPLICATION_FEE"
  | "REFUND"

export interface CreditWallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  wallet_id: string
  amount: number
  type: TransactionType
  mission_id: string | null
  payment_id: string | null
  created_at: string
}

// Valeurs réelles de l'enum public.mission_status — voir
// sql/migrations/20260915_missions_engine_phase1.sql:64-66. "OPEN" n'existe
// pas (correctif 2026-09-16, suite à une erreur bloquante en publication).
export type MissionStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "APPLICATIONS_OPEN"
  | "APPLICATIONS_CLOSED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED"
  | "EXPIRED"

// Une mission est ouverte aux candidatures dans ces deux statuts — les
// composants d'affichage doivent tester les deux, pas une seule valeur.
export const OPEN_MISSION_STATUSES: MissionStatus[] = ["PUBLISHED", "APPLICATIONS_OPEN"]

// Valeurs réelles de l'enum public.mission_escrow_status — voir
// sql/migrations/20260915d_missions_engine_phase3_escrow.sql.
export type EscrowStatus = "NONE" | "PENDING_PAYMENT" | "HELD" | "RELEASED" | "REFUNDED"

export interface Mission {
  id: string
  client_id: string
  title: string
  description: string
  category?: string | null
  budget_min?: number | null
  budget_max?: number | null
  currency: string
  deadline?: string | null
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  status: MissionStatus
  has_escrow: boolean
  escrow_fee_bps: number
  escrow_status?: EscrowStatus
  escrow_paid_at?: string | null
  escrow_released_at?: string | null
  escrow_released_by?: string | null
  escrow_transaction_id?: string | null
  selected_pro_id?: string | null
  max_applications: number
  started_at?: string | null
  delivered_at?: string | null
  auto_release_at?: string | null
  client_confirmed_at?: string | null
  expires_at: string
  created_at: string
  updated_at: string
  // Jointures et métadonnées UI construites côté client (missions.client_id
  // référence auth.users, pas user_profiles — pas de FK directe pour un embed
  // PostgREST ; voir hooks/use-missions.ts).
  client?: {
    full_name?: string | null
    avatar_url?: string | null
    trust_tier?: number | null
    identity_verified?: boolean | null
  }
  applications_count?: number
}

// Valeurs réelles de l'enum public.application_status — "SUBMITTED" n'existe
// pas, l'état initial réel est "PENDING".
export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED"

export interface MissionApplication {
  id: string
  mission_id: string
  pro_id: string
  proposed_price: number
  pitch?: string | null
  status: ApplicationStatus
  created_at: string
  // Alias de compatibilité UI (= pro_id), posé par use-missions.ts pour ne
  // pas casser les composants déjà écrits contre "freelancer_id".
  freelancer_id: string
  freelancer?: {
    full_name?: string | null
    avatar_url?: string | null
    trust_tier?: number | null
    identity_verified?: boolean | null
  }
}

export interface MissionReview {
  id: string
  mission_id: string
  reviewer_id: string
  reviewee_id: string
  role: "CLIENT" | "FREELANCER"
  rating: number
  comment?: string | null
  created_at: string
}

export interface CreditPack {
  id: string
  credits: number
  priceFcfa: number
  unitPriceFcfa: number
  popular?: boolean
  label: string
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "pack_5",
    credits: 5,
    priceFcfa: 2000,
    unitPriceFcfa: 400,
    label: "Pack Découverte",
  },
  {
    id: "pack_15",
    credits: 15,
    priceFcfa: 5000,
    unitPriceFcfa: 333,
    popular: true,
    label: "Pack Pro Performance",
  },
]
