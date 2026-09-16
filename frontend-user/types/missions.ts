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
  user_id: string
  amount: number
  type: TransactionType
  reference_id: string | null
  description: string | null
  created_at: string
}

export type MissionStatus =
  | "DRAFT"
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"

export type EscrowStatus = "PENDING" | "FUNDED" | "RELEASED" | "REFUNDED"

export interface Mission {
  id: string
  client_id: string
  title: string
  description: string
  budget_min?: number | null
  budget_max?: number | null
  currency: string
  deadline?: string | null
  status: MissionStatus
  assigned_to?: string | null
  selected_application_id?: string | null
  escrow_amount?: number | null
  escrow_status?: EscrowStatus | null
  delivered_at?: string | null
  auto_release_at?: string | null
  cancellation_reason?: string | null
  created_at: string
  updated_at: string
  // Jointures et métadonnées UI
  client?: {
    full_name?: string | null
    avatar_url?: string | null
    trust_tier?: number | null
    identity_verified?: boolean | null
  }
  applications_count?: number
}

export type ApplicationStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED"

export interface MissionApplication {
  id: string
  mission_id: string
  freelancer_id: string
  proposal?: string | null
  pitch?: string | null
  price_quote?: number | null
  estimated_days?: number | null
  portfolio_items?: string[] | null
  status: ApplicationStatus
  credit_debited: boolean
  created_at: string
  updated_at: string
  freelancer?: {
    full_name?: string | null
    avatar_url?: string | null
    trust_tier?: number | null
    identity_verified?: boolean | null
    headline?: string | null
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
